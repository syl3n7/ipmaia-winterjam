const { expect } = require('chai');
const sinon = require('sinon');

const authRouter = require('../../routes/auth');
const User = require('../../models/User');
const { pool } = require('../../config/database');

function findRouteHandler(router, path, method = 'post') {
  const layer = router.stack.find(l => l.route && l.route.path === path);
  if (!layer) return null;
  const stacks = layer.route.stack.filter(s => s.method === method);
  return stacks.length > 0 ? stacks[stacks.length - 1].handle : null;
}

describe('Password hash migration', () => {
  let poolStub;
  let hashStub;
  let verifyStub;

  afterEach(() => {
    if (poolStub) poolStub.restore();
    if (hashStub) hashStub.restore();
    if (verifyStub) verifyStub.restore();
  });

  it('rehashes bcrypt password to argon2 on successful login', async () => {
    const handler = findRouteHandler(authRouter, '/isolated/login', 'post');
    expect(handler).to.be.a('function');

    // Simulate DB returning a user with bcrypt hash
    const bcryptHash = '$2b$12$abcdefghijklmnopqrstuv';
    poolStub = sinon.stub(pool, 'query');
    poolStub.withArgs(sinon.match(/SELECT \* FROM users WHERE username/)).resolves({ rows: [{ id: 7, username: 'bob', email: 'bob@example.com', password_hash: bcryptHash, role: 'user', is_active: true }] });

    // Stub user verify to signal ok and needsRehash true (bcrypt was used and argon2 is available)
    verifyStub = sinon.stub(User.prototype, 'verifyPassword').resolves({ ok: true, needsRehash: true });

    // Stub new hash generation and DB update
    hashStub = sinon.stub(User, 'hashPassword').resolves('$argon2$newhash');
    const updateSpy = poolStub.withArgs(sinon.match(/UPDATE users SET password_hash/)).resolves({ rows: [] });

    const req = { body: { username: 'bob', password: 'correcthorsebatterystaple' }, session: {} };
    const res = { json: sinon.stub().returnsThis(), status: sinon.stub().returnsThis() };

    await handler(req, res);

    // Verify we performed a hash and updated DB
    expect(hashStub.calledOnce).to.be.true;
    expect(updateSpy.called).to.be.true;
  });
});
