const { expect } = require('chai');
const sinon = require('sinon');
const adminRouter = require('../../routes/admin');
const { pool } = require('../../config/database');

function findRouteHandler(router, path, method = 'put') {
  const layer = router.stack.find(l => l.route && l.route.path === path);
  if (!layer) return null;
  const stacks = layer.route.stack.filter(s => s.method === method);
  return stacks.length > 0 ? stacks[stacks.length - 1].handle : null;
}

describe('Admin user password reset', () => {
  let poolStub;
  afterEach(() => {
    if (poolStub) poolStub.restore();
  });

  it('PUT /users/:id/password validates password and updates DB', async () => {
    const handler = findRouteHandler(adminRouter, '/users/:id/password', 'put');
    expect(handler).to.be.a('function');

    poolStub = sinon.stub(pool, 'query').resolves({ rows: [] });

    const req = { params: { id: '5' }, body: { password: 'StrongP@ssw0rd!!' }, session: { userId: 1, username: 'super', role: 'super_admin' } };
    const res = { json: sinon.stub().returnsThis(), status: sinon.stub().returnsThis() };

    await handler(req, res);

    expect(poolStub.called).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.have.property('success', true);
  });
});
