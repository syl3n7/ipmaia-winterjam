const { expect } = require('chai');
const sinon = require('sinon');

const adminRouter = require('../../routes/admin');
const { pool } = require('../../config/database');
const audit = require('../../utils/auditLog');

// Helper to find route handler for a given path and method on an Express router
function findRouteHandler(router, path, method = 'get') {
  const layer = router.stack.find(l => l.route && l.route.path === path);
  if (!layer) return null;
  const handles = layer.route.stack
    .filter(s => !s.method || s.method === method)
    .map(s => s.handle);
  if (handles.length === 0) return null;

  // Return a composite function that runs the middleware chain like Express
  return async (req, res) => {
    let idx = -1;
    const next = async () => {
      idx++;
      if (idx >= handles.length) return;
      const fn = handles[idx];
      const result = fn.length >= 3 ? fn(req, res, next) : fn(req, res);
      await Promise.resolve(result);
    };

    // Start the chain
    idx = 0;
    const first = handles[0];
    const firstResult = first.length >= 3 ? first(req, res, next) : first(req, res);
    await Promise.resolve(firstResult);

    // Ensure any remaining middleware runs if next was called
    await next();
  };
}

describe('Admin registration endpoints', () => {
  let poolStub;
  let auditStub;
  afterEach(() => {
    if (poolStub) poolStub.restore();
    if (auditStub) auditStub.restore();
  });

  it('GET /registration returns enabled value from DB when present', async () => {
    const handler = findRouteHandler(adminRouter, '/registration', 'get');
    expect(handler).to.be.a('function');

    poolStub = sinon.stub(pool, 'query').resolves({ rows: [{ setting_value: 'true' }] });

    const req = { session: { userId: 1, role: 'super_admin' } };
    const res = { json: sinon.stub().returnsThis(), status: sinon.stub().returnsThis(), send: sinon.stub().returnsThis() };

    await handler(req, res);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal({ enabled: true });
  });

  it('GET /registration falls back to env when DB has no row', async () => {
    const handler = findRouteHandler(adminRouter, '/registration', 'get');
    expect(handler).to.be.a('function');

    const oldEnv = process.env.PUBLIC_REGISTRATION_ENABLED;
    const oldNodeEnv = process.env.NODE_ENV;
    process.env.PUBLIC_REGISTRATION_ENABLED = 'true';
    process.env.NODE_ENV = 'production';

    poolStub = sinon.stub(pool, 'query').resolves({ rows: [] });

    const req = { session: { userId: 1, role: 'super_admin' } };
    const res = { json: sinon.stub().returnsThis(), status: sinon.stub().returnsThis() };

    await handler(req, res);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal({ enabled: true });

    process.env.PUBLIC_REGISTRATION_ENABLED = oldEnv;
    process.env.NODE_ENV = oldNodeEnv;
  });

  it('PUT /registration validates input and returns 400 for invalid value', async () => {
    const handler = findRouteHandler(adminRouter, '/registration', 'put');
    expect(handler).to.be.a('function');

    const req = { session: { userId: 1, role: 'super_admin' }, body: { enabled: 'not-boolean' } };
    const res = { json: sinon.stub().returnsThis(), status: sinon.stub().returnsThis() };

    await handler(req, res);

    expect(res.status.calledOnce).to.be.true;
    expect(res.status.firstCall.args[0]).to.equal(400);
  });

  it('PUT /registration updates DB and returns new value', async () => {
    const handler = findRouteHandler(adminRouter, '/registration', 'put');
    expect(handler).to.be.a('function');

    poolStub = sinon.stub(pool, 'query').resolves({ rows: [] });
    auditStub = sinon.stub(audit, 'logAudit').resolves();

    const req = { session: { userId: 1, username: 'admin' }, body: { enabled: false }, method: 'PUT' };
    const res = { json: sinon.stub().returnsThis(), status: sinon.stub().returnsThis() };

    await handler(req, res);

    expect(poolStub.called).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal({ enabled: false });
  });
});
