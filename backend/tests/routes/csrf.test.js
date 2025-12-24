const { expect } = require('chai');
const sinon = require('sinon');

const authRouter = require('../../routes/auth');
const { shouldSkipCsrf } = require('../../server');

// Helper to find route handler for a given path and method on an Express router
function findRouteHandler(router, path, method = 'get') {
  const layer = router.stack.find(l => l.route && l.route.path === path);
  if (!layer) return null;
  const stack = layer.route.stack.find(s => s.method === method);
  return stack ? stack.handle : null;
}

describe('CSRF helper and endpoint', () => {
  it('shouldSkipCsrf returns true for admin paths in dev', () => {
    const old = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';
    const req = { path: '/api/admin/users', method: 'GET' };
    expect(shouldSkipCsrf(req)).to.equal(true);
    process.env.NODE_ENV = old;
  });

  it('shouldSkipCsrf returns false for admin paths in production', () => {
    const old = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const req = { path: '/api/admin/users', method: 'GET' };
    expect(shouldSkipCsrf(req)).to.equal(false);
    process.env.NODE_ENV = old;
  });

  it('GET /csrf-token returns token and sets cookie when csrfToken is available', async () => {
    const handler = findRouteHandler(authRouter, '/csrf-token', 'get');
    expect(handler).to.be.a('function');

    const req = { csrfToken: () => 'fake-token' };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis(), cookie: sinon.stub().returnsThis() };

    await handler(req, res);

    expect(res.cookie.calledOnce).to.be.true;
    expect(res.cookie.firstCall.args[0]).to.equal('XSRF-TOKEN');
    expect(res.json.calledOnce).to.be.true;
    const payload = res.json.firstCall.args[0];
    expect(payload.csrfToken).to.equal('fake-token');
  });

  it('GET /csrf-token returns 500 when csrfToken not available', async () => {
    const handler = findRouteHandler(authRouter, '/csrf-token', 'get');
    expect(handler).to.be.a('function');

    const req = {}; // no csrfToken
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis(), cookie: sinon.stub().returnsThis() };

    await handler(req, res);

    expect(res.status.calledOnce).to.be.true;
    expect(res.status.firstCall.args[0]).to.equal(500);
    expect(res.json.calledOnce).to.be.true;
  });
});