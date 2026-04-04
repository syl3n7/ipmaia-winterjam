const { expect } = require('chai');
const sinon = require('sinon');

const authRouter = require('../../routes/auth');
const { pool } = require('../../config/database');

function findRouteHandler(router, path, method = 'post') {
  const layer = router.stack.find(l => l.route && l.route.path === path);
  if (!layer) return null;
  const stacks = layer.route.stack.filter(s => s.method === method);
  return stacks.length > 0 ? stacks[stacks.length - 1].handle : null;
}

describe('Registration validation', () => {
  let poolStub;
  afterEach(() => {
    if (poolStub) poolStub.restore();
  });

  it('rejects weak passwords on register', async () => {
    const handler = findRouteHandler(authRouter, '/isolated/register', 'post');
    expect(handler).to.be.a('function');

    // DB says registration enabled and no existing user
    poolStub = sinon.stub(pool, 'query');
    poolStub.onCall(0).resolves({ rows: [] }); // front_page_settings
    poolStub.onCall(1).resolves({ rows: [] }); // users check

    const req = { body: { username: 'u', email: 'e@x.com', password: 'weakpw' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis() };

    await handler(req, res);

    expect(res.status.calledOnce).to.be.true;
    expect(res.status.firstCall.args[0]).to.equal(400);
    const payload = res.json.firstCall.args[0];
    expect(payload.error).to.match(/Password/);
  });

  it('GET /registration-status returns enabled flag', async () => {
    const handler = findRouteHandler(authRouter, '/registration-status', 'get');
    expect(handler).to.be.a('function');

    poolStub = sinon.stub(pool, 'query').resolves({ rows: [{ setting_value: 'false' }] });
    const req = {};
    const res = { json: sinon.stub().returnsThis(), status: sinon.stub().returnsThis() };

    await handler(req, res);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.deep.equal({ enabled: false });
  });

  it('handles duplicate insert (unique constraint) gracefully', async () => {
    const handler = findRouteHandler(authRouter, '/isolated/register', 'post');
    expect(handler).to.be.a('function');

    poolStub = sinon.stub(pool, 'query');
    poolStub.onCall(0).resolves({ rows: [] }); // front_page_settings
    poolStub.onCall(1).resolves({ rows: [] }); // users check
    poolStub.onCall(2).resolves({ rows: [] }); // advisory lock
    poolStub.onCall(3).resolves({ rows: [{ count: '0' }] }); // count
    poolStub.onCall(4).rejects({ code: '23505' }); // insert throws unique constraint

    const req = { body: { username: 'dupuser', email: 'dup@example.com', password: 'StrongP@ssw0rd!!' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis() };

    await handler(req, res);

    expect(res.status.calledOnce).to.be.true;
    expect(res.status.firstCall.args[0]).to.equal(409);
  });
});
