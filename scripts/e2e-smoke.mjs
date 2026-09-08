const baseUrl = (process.env.E2E_BASE_URL || 'https://ipmaia-winterjam.pt').replace(/\/$/, '');

const checks = [
  { name: 'homepage', path: '/' },
  { name: 'login page', path: '/login' },
  { name: 'frontend version', path: '/api/version', validate: validateVersion },
  { name: 'frontend health proxy', path: '/api/health-check', validate: validateHealth },
];

async function validateVersion(response, payload) {
  if (payload?.service !== 'frontend' || !payload.version || payload.version === 'unknown') {
    throw new Error('Frontend version metadata is missing or unknown');
  }
}

async function validateHealth(response, payload) {
  if (payload?.status !== 'ok') {
    throw new Error(`Expected frontend health status ok, received ${payload?.status || 'missing'}`);
  }
}

for (const check of checks) {
  const response = await fetch(`${baseUrl}${check.path}`, {
    headers: { 'user-agent': 'ipmaia-e2e-smoke-check' },
  });

  if (!response.ok) {
    throw new Error(`${check.name} returned HTTP ${response.status}`);
  }

  if (check.validate) {
    await check.validate(response, await response.json());
  }

  console.log(`PASS ${check.name}: ${response.status}`);
}

console.log(`E2E smoke checks passed against ${baseUrl}`);
