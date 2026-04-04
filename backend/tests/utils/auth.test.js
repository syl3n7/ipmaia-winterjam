const { expect } = require('chai');
const { generateToken, verifyToken } = require('../../utils/auth');

describe('auth.generateToken / verifyToken', () => {
  it('includes role and basic info in token payload', () => {
    const user = { id: 1, username: 'admin', email: 'admin@example.com', role: 'super_admin', is_active: true };
    const token = generateToken(user);
    const decoded = verifyToken(token);
    expect(decoded).to.be.an('object');
    expect(decoded.role).to.equal('super_admin');
    expect(decoded.id).to.equal(1);
    expect(decoded.username).to.equal('admin');
    expect(decoded.email).to.equal('admin@example.com');
    expect(decoded.is_active).to.equal(true);
  });

  it('verifyToken returns null for invalid token', () => {
    const bad = verifyToken('not-a-token');
    expect(bad).to.equal(null);
  });
});