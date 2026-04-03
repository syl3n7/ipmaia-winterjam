const express = require('express');
const Form = require('../models/Form');
const FormSubmission = require('../models/FormSubmission');
const { SMTP_CONFIGURED } = require('../utils/email');
const nodemailer = require('nodemailer');
const router = express.Router();

// ─── helpers ──────────────────────────────────────────────────────────────────

/**
 * Strip HTML tags from a string to prevent stored XSS in submission data.
 */
function sanitizeString(value) {
  if (typeof value !== 'string') return value;
  return value.replace(/<[^>]*>/g, '').trim();
}

function sanitizeData(data) {
  if (typeof data !== 'object' || data === null) return {};
  const out = {};
  for (const [k, v] of Object.entries(data)) {
    if (Array.isArray(v)) {
      out[k] = v.map(item => sanitizeString(String(item)));
    } else {
      out[k] = sanitizeString(String(v ?? ''));
    }
  }
  return out;
}

/**
 * Validate a submission payload against the form's field definitions.
 * Returns an array of error messages (empty = valid).
 */
function validateSubmission(fields, data) {
  const errors = [];

  for (const field of fields) {
    const value = data[field.name];
    const missing = value === undefined || value === null || value === '' ||
      (Array.isArray(value) && value.length === 0);

    if (field.required && missing) {
      errors.push(`"${field.label}" is required.`);
      continue;
    }

    if (missing) continue;

    // Type-specific validation
    if (field.type === 'email') {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(value)) {
        errors.push(`"${field.label}" must be a valid email address.`);
      }
    }

    if (field.type === 'phone') {
      // Allow digits, spaces, +, -, (, )
      const phoneRe = /^[+\d\s\-().]{5,30}$/;
      if (!phoneRe.test(value)) {
        errors.push(`"${field.label}" must be a valid phone number.`);
      }
    }
  }

  return errors;
}

// ─── routes ───────────────────────────────────────────────────────────────────

/** GET /api/forms/:slug  — public metadata (no admin info) */
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    if (!/^[a-z0-9-]+$/i.test(slug)) {
      return res.status(400).json({ error: 'Invalid form slug.' });
    }

    const form = await Form.findBySlug(slug);
    if (!form || form.status !== 'active') {
      return res.status(404).json({ error: 'Form not found or not active.' });
    }

    // Return only public-safe fields
    res.json({
      id: form.id,
      name: form.name,
      slug: form.slug,
      description: form.description,
      fields: form.fields,
      submit_button_text: form.submit_button_text,
      success_message: form.success_message,
      gamejam_name: form.gamejam_name,
    });
  } catch (err) {
    console.error('Error fetching public form:', err);
    res.status(500).json({ error: 'Failed to load form.' });
  }
});

/** POST /api/forms/:slug/submit  — public submission endpoint */
router.post('/:slug/submit', async (req, res) => {
  try {
    const { slug } = req.params;
    if (!/^[a-z0-9-]+$/i.test(slug)) {
      return res.status(400).json({ error: 'Invalid form slug.' });
    }

    const form = await Form.findBySlug(slug);
    if (!form || form.status !== 'active') {
      return res.status(404).json({ error: 'Form not found or not accepting submissions.' });
    }

    const fields = Array.isArray(form.fields) ? form.fields : [];
    const rawData = req.body || {};

    // Sanitize input
    const data = sanitizeData(rawData);

    // Validate
    const errors = validateSubmission(fields, data);
    if (errors.length > 0) {
      return res.status(422).json({ errors });
    }

    // Persist submission
    const submission = await FormSubmission.create({
      form_id: form.id,
      data,
      ip_address: req.clientInfo?.ip || req.ip,
    });

    // Fire-and-forget emails (non-blocking)
    sendFormEmails(form, data, fields).catch(err => {
      console.error('⚠️ Form email error:', err.message);
    });

    // Auto-create game if setting is enabled and form is linked to a jam
    if (form.settings?.auto_create_game && form.gamejam_id) {
      createGameFromSubmission(form, submission, data, fields).catch(err => {
        console.error('⚠️ Auto-create game error:', err.message);
      });
    }

    res.status(201).json({ message: form.success_message, submissionId: submission.id });
  } catch (err) {
    console.error('Error submitting form:', err);
    res.status(500).json({ error: 'Failed to submit form.' });
  }
});

// ─── email helpers (non-blocking) ────────────────────────────────────────────

async function sendFormEmails(form, data, fields) {
  if (!SMTP_CONFIGURED) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  // Build a human-readable HTML table of the submission
  const rows = fields.map(f => {
    const val = data[f.name];
    const display = Array.isArray(val) ? val.join(', ') : (val || '—');
    return `<tr><td style="padding:6px 12px;border:1px solid #ddd;font-weight:600">${f.label}</td><td style="padding:6px 12px;border:1px solid #ddd">${display}</td></tr>`;
  }).join('');

  const html = `
    <h2 style="font-family:sans-serif">New submission: ${form.name}</h2>
    <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows}</table>
  `;

  // Admin/notification email
  if (form.notification_email) {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: form.notification_email,
      subject: `New submission: ${form.name}`,
      html,
    });
  }

  // User confirmation email (if there's an email field in the submission)
  const emailField = fields.find(f => f.type === 'email');
  const userEmail = emailField ? data[emailField.name] : null;
  if (userEmail) {
    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: userEmail,
      subject: `Registration received — ${form.name}`,
      html: `
        <h2 style="font-family:sans-serif">Thank you for your submission!</h2>
        <p style="font-family:sans-serif">${form.success_message}</p>
        <h3 style="font-family:sans-serif">Your details:</h3>
        <table style="border-collapse:collapse;font-family:sans-serif;font-size:14px">${rows}</table>
      `,
    });
  }
}

// ─── auto game creation helper ────────────────────────────────────────────────

async function createGameFromSubmission(form, submission, data, fields) {
  const Game = require('../models/Game');

  // Build game data from field mappings
  const gameData = buildGameDataFromSubmission(data, fields, form.gamejam_id);

  const game = await Game.create(gameData);
  if (game) {
    await FormSubmission.markProcessed(submission.id, game.id, 'Auto-created on submission');
  }
  return game;
}

/**
 * Map form submission data to game fields using field.maps_to metadata.
 * maps_to values: team_name | team_members | title | description |
 *                 github_url | itch_url | contact_email
 */
function buildGameDataFromSubmission(data, fields, gamejam_id) {
  const gameData = {
    game_jam_id: gamejam_id,
    title: '',
    team_name: '',
    team_members: [],
    custom_fields: {},
  };

  const memberNames = [];

  for (const field of fields) {
    const value = data[field.name];
    if (value === undefined || value === null || value === '') continue;

    switch (field.maps_to) {
      case 'title':
        gameData.title = value;
        break;
      case 'team_name':
        gameData.team_name = value;
        break;
      case 'team_members':
        // Textarea with one member per line, or comma-separated
        if (typeof value === 'string') {
          const parts = value.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);
          memberNames.push(...parts);
        }
        break;
      case 'member_name':
        // Individual name fields
        if (typeof value === 'string' && value.trim()) {
          memberNames.push(value.trim());
        }
        break;
      case 'description':
        gameData.description = value;
        break;
      case 'github_url':
        gameData.github_url = value;
        break;
      case 'itch_url':
        gameData.itch_url = value;
        break;
      default:
        // Unmapped fields → custom_fields
        gameData.custom_fields[field.name] = value;
        break;
    }
  }

  // Fall back: if no explicit title, use team_name
  if (!gameData.title && gameData.team_name) {
    gameData.title = gameData.team_name;
  }
  if (!gameData.title) gameData.title = 'TBD';

  // Build team_members array — each entry is an object with a name
  if (memberNames.length > 0) {
    gameData.team_members = memberNames.map(name => ({ name }));
  }

  return gameData;
}

module.exports = { router, buildGameDataFromSubmission };
