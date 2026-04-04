const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('auditLog.logAudit', () => {
  it('should INSERT a row into audit_logs with provided values', async () => {
    const queryStub = sinon.stub().resolves();

    const { logAudit } = proxyquire('../../utils/auditLog', {
      '../config/database': { pool: { query: queryStub } }
    });

    await logAudit({
      userId: 1,
      username: 'tester',
      action: 'TEST_ACTION',
      tableName: 'test_table',
      recordId: 42,
      description: 'Testing audit log',
      oldValues: null,
      newValues: { foo: 'bar' },
      ipAddress: '127.0.0.1',
      userAgent: 'mocha-test'
    });

    expect(queryStub.calledOnce).to.be.true;
    const [sql, params] = queryStub.firstCall.args;
    expect(sql).to.contain('INSERT INTO audit_logs');
    expect(params[0]).to.equal(1); // user_id
    expect(params[1]).to.equal('tester'); // username
    expect(params[2]).to.equal('TEST_ACTION'); // action
    expect(params[3]).to.equal('test_table'); // table_name
    expect(params[4]).to.equal(42); // record_id
    expect(params[5]).to.equal('Testing audit log'); // description
    expect(params[6]).to.equal(null); // old_values
    expect(params[7]).to.be.a('string'); // new_values JSON
    const parsedNew = JSON.parse(params[7]);
    expect(parsedNew.foo).to.equal('bar');
    expect(params[8]).to.equal('127.0.0.1'); // ip
    expect(params[9]).to.equal('mocha-test'); // user agent
  });
});
