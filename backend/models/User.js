// User model for isolated authentication
const bcrypt = require('bcrypt');

class User {
  constructor({ id, username, email, passwordHash }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  static async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async verifyPassword(password) {
    return await bcrypt.compare(password, this.passwordHash);
  }
}

module.exports = User;
