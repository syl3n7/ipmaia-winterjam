# Forms Manager Implementation Plan

## ✅ Completed (Dev Groundwork)

### Frontend Components
- **Forms List Page** (`/admin/forms`)
  - Display all forms with stats (submissions, fields, status)
  - Quick actions: Edit, View Submissions, Settings, Delete
  - "Create New Form" button
  
- **Form Builder Page** (`/admin/forms/builder`)
  - Form settings: name, slug, description, notification email, success message
  - Visual field builder with drag-and-drop ready
  - Field types: Text, Email, Phone, Select, Radio, Checkbox, Textarea
  - Add/Edit/Delete fields with options
  - Live preview mode
  - Save form button (dev: logs to console)

- **FormFieldBuilder Component**
  - Expandable field editor
  - Field configuration: label, name, type, placeholder, options
  - Required field toggle
  - Option management (add/remove for select/radio/checkbox)

### Admin Dashboard
- Added "Forms Manager" link to quick links

---

## 🚧 Next Steps (Priority Order)

### Phase 1: Backend Setup (Database)
**Status:** Not started  
**Files needed:**
- `backend/models/Form.js` - Form schema
- `backend/models/FormSubmission.js` - Submissions storage
- `backend/migrations/create-forms-table.js` - Database migration
- `backend/config/forms.js` - Forms configuration

**Database Schema needed:**
```sql
Forms table:
- id, name, slug, description, notification_email, success_message
- submit_button_text, status (active/draft), created_at, updated_at

FormFields table:
- id, form_id, label, name, type, options (JSON), required, order, created_at

FormSubmissions table:
- id, form_id, data (JSON), submitted_at, user_email, ip_address
```

**Effort:** 2-3 hours

---

### Phase 2: Backend API Endpoints
**Status:** Not started  
**Endpoints needed:**

```
POST   /api/admin/forms                    - Create new form
GET    /api/admin/forms                    - List all forms
GET    /api/admin/forms/:id                - Get form details with fields
PUT    /api/admin/forms/:id                - Update form
DELETE /api/admin/forms/:id                - Delete form
POST   /api/admin/forms/:id/fields         - Add field to form
PUT    /api/admin/forms/:id/fields/:fid    - Update field
DELETE /api/admin/forms/:id/fields/:fid    - Delete field
GET    /api/admin/forms/:id/submissions    - List form submissions
POST   /api/forms/:slug/submit             - Public form submission endpoint (with validation)
GET    /api/admin/forms/:id/export         - Export submissions as CSV
```

**Effort:** 4-5 hours

---

### Phase 3: SMTP Email Integration
**Status:** Planning phase  
**Setup:**
1. Brevo SMTP credentials in `.env`:
   - BREVO_SMTP_HOST
   - BREVO_SMTP_PORT
   - BREVO_SMTP_USER
   - BREVO_SMTP_PASSWORD
   - FROM_EMAIL (no-reply@ipmaia-winterjam.pt)

2. Email templates:
   - User confirmation email (HTML template)
   - Admin notification email (with submission data)

3. Nodemailer integration:
   - `backend/utils/emailService.js` - Send emails via Brevo

**Effort:** 2-3 hours

---

### Phase 4: Frontend Form Submission
**Status:** Not started  
**Components needed:**
- Public form page component (displays form dynamically)
- Form submission handler with validation
- Success/error states
- Loading indicator

**Files:**
- `src/app/form/[slug]/page.js` - Public form page
- `src/components/PublicFormRenderer.js` - Render form dynamically
- `src/lib/formAPI.js` - Form submission API calls

**Effort:** 2-3 hours

---

### Phase 5: Submissions Management
**Status:** Not started  
**UI Components:**
- Submissions list page (`/admin/forms/:id/submissions`)
  - Table view with: Date, Email, Status, Actions
  - Filter by status, date range
  - Search by email
  - View individual submission details
  - Delete submission
  - Export as CSV button

**Effort:** 3-4 hours

---

### Phase 6: Form Settings/Advanced Features
**Status:** Not started  
**Features:**
- Branding customization (colors, logo, background image)
- Conditional logic (show/hide fields based on answers)
- Email confirmation settings (enable/disable)
- Submission limits (max submissions, close after date)
- Webhook for external integrations
- Publish/Draft status

**Effort:** 4-5 hours

---

## 📋 Form Field Types Supported

| Type | Input | Validation | Use Case |
|------|-------|-----------|----------|
| **Text** | Text input | Min/max length, regex | Name, team name |
| **Email** | Email input | RFC 5322 | Contact email |
| **Phone** | Tel input | E.164 format | Phone numbers |
| **Select** | Dropdown | Single choice | Team size |
| **Radio** | Radio buttons | Single choice | Yes/No questions |
| **Checkbox** | Multiple checkboxes | Multiple choices | Equipment selection |
| **Textarea** | Text area | Min/max length | Descriptions, allergies |

---

## 🔌 Integration Points

### With Current System
- Reuse existing admin authentication
- Use current MySQL database
- Follow existing API route patterns
- Match dark theme styling

### External Services
- **Brevo SMTP**: Email sending
- **CSV Export**: Via backend route

---

## 🧪 Testing Checklist

- [ ] Create form with various field types
- [ ] Edit form fields
- [ ] Delete form
- [ ] Submit form successfully
- [ ] Receive confirmation email
- [ ] Email notification to admin
- [ ] View submissions
- [ ] Export submissions as CSV
- [ ] Validation errors
- [ ] Conditional field visibility

---

## 📊 Total Estimated Effort

- **Phase 1** (Database): 2-3 hours
- **Phase 2** (API): 4-5 hours
- **Phase 3** (Email): 2-3 hours
- **Phase 4** (Frontend): 2-3 hours
- **Phase 5** (Submissions UI): 3-4 hours
- **Phase 6** (Advanced): 4-5 hours

**Total: ~18-27 hours** (depends on existing infrastructure)

---

## 🎯 MVP (Minimum Viable Product)

For initial release, focus on:
1. Create simple forms (Phase 1-2)
2. Accept submissions (Phase 4)
3. Send confirmation emails (Phase 3)
4. View submissions (Phase 5 - basic)
5. Export CSV

This would take ~8-10 hours and cover 80% of the use case.
