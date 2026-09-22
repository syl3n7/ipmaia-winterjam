const { expect } = require('chai');
const sinon = require('sinon');

const adminRouter = require('../../routes/admin');
const { pool } = require('../../config/database');
const audit = require('../../utils/auditLog');

function findRouteHandler(router, path, method = 'post') {
  const layer = router.stack.find(l => l.route && l.route.path === path);
  if (!layer) return null;
  const stacks = layer.route.stack.filter(s => s.method === method);
  return stacks.length > 0 ? stacks[stacks.length - 1].handle : null;
}

describe('Discord invite flow', () => {
  let poolStub;
  let auditStub;

  afterEach(() => {
    if (poolStub) poolStub.restore();
    if (auditStub) auditStub.restore();
  });

  it('POST /users/invite accepts a Discord invite without email and stores Discord identity metadata', async () => {
    const handler = findRouteHandler(adminRouter, '/users/invite', 'post');
    expect(handler).to.be.a('function');

    poolStub = sinon.stub(pool, 'query');
    poolStub.onCall(0).resolves({ rows: [] }); // no recent invite
    poolStub.onCall(1).resolves({ rows: [] }); // user lookup none
    poolStub.onCall(2).resolves({ rows: [{
      id: 42,
      username: 'discord-user',
      email: 'discord-123456789@local.invalid',
      role: 'admin',
      is_active: true,
      discord_user_id: '123456789',
      discord_username: 'winterjam-admin',
      auth_provider: 'discord'
    }] }); // insert new user
    poolStub.onCall(3).resolves({ rows: [{ id: 99 }] }); // invite insert

    auditStub = sinon.stub(audit, 'logAudit').resolves();

    const req = {
      session: { userId: 7, username: 'super-admin' },
      body: {
        username: 'discord-user',
        discordUserId: '123456789',
        discordUsername: 'winterjam-admin',
        role: 'admin',
        expiresOption: '3d',
        sendEmail: false,
        inviteType: 'discord'
      }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };

    await handler(req, res);

    expect(res.status.calledWith(200) || res.status.calledWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    const payload = res.json.firstCall.args[0];
    expect(payload.success).to.equal(true);
    expect(payload.user.discord_user_id).to.equal('123456789');
    expect(payload.inviteType).to.equal('discord');
    expect(payload.user.email).to.equal('discord-123456789@local.invalid');

    const insertUserCall = poolStub.getCalls().find(call => typeof call.args[0] === 'string' && call.args[0].includes('INSERT INTO users'));
    expect(insertUserCall).to.exist;
    expect(insertUserCall.args[0]).to.include('discord_user_id');
  });
});
