const { expect } = require('chai');
const sinon = require('sinon');

const authRouter = require('../../routes/auth');
const { pool } = require('../../config/database');
const audit = require('../../utils/auditLog');

function findRouteHandler(router, path, method = 'get') {
  const layer = router.stack.find(l => l.route && l.route.path === path);
  if (!layer) return null;
  const stacks = layer.route.stack.filter(s => s.method === method);
  return stacks.length > 0 ? stacks[stacks.length - 1].handle : null;
}

describe('Discord auth routes', () => {
  let poolStub;
  let auditStub;

  beforeEach(() => {
    process.env.DISCORD_CLIENT_ID = 'test-discord-client-id';
    process.env.DISCORD_CLIENT_SECRET = 'test-discord-client-secret';
    process.env.DISCORD_REDIRECT_URI = 'http://localhost:3001/api/auth/discord/callback';
  });

  afterEach(() => {
    if (poolStub) poolStub.restore();
    if (auditStub) auditStub.restore();
    delete process.env.DISCORD_CLIENT_ID;
    delete process.env.DISCORD_CLIENT_SECRET;
    delete process.env.DISCORD_REDIRECT_URI;
  });

  it('GET /discord/login creates a Discord authorize URL with state and redirect info', async () => {
    const handler = findRouteHandler(authRouter, '/discord/login', 'get');
    expect(handler).to.be.a('function');

    const req = {
      session: {},
      query: {}
    };

    const res = {
      redirect: sinon.stub(),
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };

    await handler(req, res);

    expect(res.redirect.calledOnce).to.be.true;
    const url = res.redirect.firstCall.args[0];
    expect(url).to.include('https://discord.com/api/oauth2/authorize');
    expect(url).to.include('client_id=');
    expect(url).to.include('state=');
    expect(req.session.discordState).to.be.a('string');
  });

  it('GET /discord/callback rejects missing or mismatched state', async () => {
    const handler = findRouteHandler(authRouter, '/discord/callback', 'get');
    expect(handler).to.be.a('function');

    const req = {
      session: { discordState: 'abc' },
      query: { code: 'token', state: 'def' }
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis()
    };

    await handler(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0].error).to.equal('Invalid Discord auth state');
  });
});
