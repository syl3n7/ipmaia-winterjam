const { expect } = require('chai');
const sinon = require('sinon');

const authRouter = require('../../routes/auth');
const { pool } = require('../../config/database');
const audit = require('../../utils/auditLog');

// Helper to find route handler for a given path and method on an Express router
function findRouteHandler(router, path, method = 'post') {
  const layer = router.stack.find(l => l.route && l.route.path === path);
  if (!layer) return null;
  const stacks = layer.route.stack.filter(s => s.method === method);
  return stacks.length > 0 ? stacks[stacks.length - 1].handle : null; // Get the last handler (after middleware)
}

describe('Isolated registration - first user super_admin behavior', () => {
  let poolStub;
  let auditStub;
  afterEach(() => {
    if (poolStub) poolStub.restore();
    if (auditStub) auditStub.restore();
  });

  it('POST /isolated/register makes first user super_admin and disables registration', async () => {
    const handler = findRouteHandler(authRouter, '/isolated/register', 'post');
    expect(handler).to.be.a('function');

    // Mock DB: no users yet (COUNT=0), so first user
    poolStub = sinon.stub(pool, 'query');
    poolStub.onCall(0).resolves({ rows: [] }); // No front_page_settings row
    poolStub.onCall(1).resolves({ rows: [] }); // Check if user exists (none)
    poolStub.onCall(2).resolves({ rows: [{ count: '0' }] }); // COUNT(*) for role check
    poolStub.onCall(3).resolves({ rows: [{ id: 1, username: 'testuser', email: 'test@example.com', role: 'super_admin', is_active: true }] }); // INSERT user
    poolStub.onCall(4).resolves({ rows: [] }); // INSERT setting
    poolStub.onCall(5).resolves({ rows: [] }); // Audit log for setting
    poolStub.onCall(6).resolves({ rows: [] }); // Audit log for user

    auditStub = sinon.stub(audit, 'logAudit').resolves();

    const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis() };

    await handler(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    const payload = res.json.firstCall.args[0];
    expect(payload.user.role).to.equal('super_admin');

    // Verify DB calls: INSERT user with role 'super_admin', INSERT setting to disable registration
    expect(poolStub.callCount).to.equal(6);
    expect(poolStub.getCall(2).args[1]).to.deep.equal(['testuser', 'test@example.com', sinon.match.string, 'super_admin', true]); // INSERT user
    expect(poolStub.getCall(3).args[0]).to.include("INSERT INTO front_page_settings"); // Disable registration
  });

  it('POST /isolated/register makes subsequent users regular users', async () => {
    const handler = findRouteHandler(authRouter, '/isolated/register', 'post');
    expect(handler).to.be.a('function');

    // Mock DB: users exist (COUNT=1), so not first user
    poolStub = sinon.stub(pool, 'query');
    poolStub.onCall(0).resolves({ rows: [] }); // No front_page_settings row
    poolStub.onCall(1).resolves({ rows: [] }); // Check if user exists (none)
    poolStub.onCall(2).resolves({ rows: [{ count: '1' }] }); // COUNT(*) > 0
    poolStub.onCall(3).resolves({ rows: [{ id: 2, username: 'user2', email: 'user2@example.com', role: 'user', is_active: true }] }); // INSERT user
    poolStub.onCall(4).resolves({ rows: [] }); // Audit log for user

    auditStub = sinon.stub(audit, 'logAudit').resolves();

    const req = { body: { username: 'user2', email: 'user2@example.com', password: 'password123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis() };

    await handler(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    const payload = res.json.firstCall.args[0];
    expect(payload.user.role).to.equal('user');

    // Verify DB calls: INSERT user with role 'user', no setting update
    expect(poolStub.callCount).to.equal(4);
    expect(poolStub.getCall(2).args[1]).to.deep.equal(['user2', 'user2@example.com', sinon.match.string, 'user', true]); // INSERT user
  });

  it('POST /isolated/register rejects when public registration disabled', async () => {
    const handler = findRouteHandler(authRouter, '/isolated/register', 'post');
    expect(handler).to.be.a('function');

    // Mock DB: public registration disabled
    poolStub = sinon.stub(pool, 'query').resolves({ rows: [{ setting_value: 'false' }] });

    const req = { body: { username: 'testuser', email: 'test@example.com', password: 'password123' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis() };

    await handler(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0].error).to.equal('Public registration is disabled. Admins can invite users.');
  });
});