const { expect } = require('chai');
const sinon = require('sinon');

const { requireAdmin, requireSuperAdmin } = require('../../routes/auth');

describe('auth middlewares', () => {
  it('requireAdmin: returns 401 when not authenticated', () => {
    const req = { session: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis() };
    const next = sinon.stub();

    requireAdmin(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(next.called).to.be.false;
  });

  it('requireAdmin: returns 403 when not admin', () => {
    const req = { session: { userId: 2, role: 'user' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis() };
    const next = sinon.stub();

    requireAdmin(req, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(next.called).to.be.false;
  });

  it('requireAdmin: calls next for admin', () => {
    const req = { session: { userId: 1, role: 'admin' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis() };
    const next = sinon.stub();

    requireAdmin(req, res, next);

    expect(next.calledOnce).to.be.true;
  });

  it('requireSuperAdmin: returns 401 when not authenticated', () => {
    const req = { session: {} };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis() };
    const next = sinon.stub();

    requireSuperAdmin(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(next.called).to.be.false;
  });

  it('requireSuperAdmin: returns 403 when not super admin', () => {
    const req = { session: { userId: 2, role: 'admin' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis() };
    const next = sinon.stub();

    requireSuperAdmin(req, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(next.called).to.be.false;
  });

  it('requireSuperAdmin: calls next for super_admin', () => {
    const req = { session: { userId: 1, role: 'super_admin' } };
    const res = { status: sinon.stub().returnsThis(), json: sinon.stub().returnsThis() };
    const next = sinon.stub();

    requireSuperAdmin(req, res, next);

    expect(next.calledOnce).to.be.true;
  });
});