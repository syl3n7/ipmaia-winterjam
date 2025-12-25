// User model for isolated authentication
// Uses Argon2id for strong hashing when available and supports bcrypt -> argon2 migration
const bcrypt = require('bcrypt');
let argon2 = null;
try {
  argon2 = require('argon2');
} catch (err) {
  console.warn('⚠️ argon2 package not available, falling back to bcrypt. Install argon2 for stronger hashing.');
}

class User {
  constructor({ id, username, email, passwordHash }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
  }

  // Hash password: use argon2 when present, otherwise bcrypt
  static async hashPassword(password) {
    if (argon2) {
      const options = {
        type: argon2.argon2id,
        timeCost: Number(process.env.ARGON2_TIME_COST) || 3,
        memoryCost: Number(process.env.ARGON2_MEMORY_COST) || 1 << 16, // 64 MB
        parallelism: Number(process.env.ARGON2_PARALLELISM) || 1,
      };
      return await argon2.hash(password, options);
    }
    // Fallback to bcrypt with a higher-than-default cost
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Verify password against either bcrypt or argon2 hash
  async verifyPassword(password) {
    const hash = this.passwordHash || '';

    try {
      if (hash.startsWith('$2')) {
        // bcrypt
        const ok = await bcrypt.compare(password, hash);
        // If bcrypt was used but argon2 is available, indicate rehash is desirable
        return { ok, needsRehash: ok && !!argon2 };
      }
      if (argon2 && hash.startsWith('$argon2')) {
        const ok = await argon2.verify(hash, password);
        return { ok, needsRehash: false };
      }

      // Unknown hash format - fail safe
      return { ok: false, needsRehash: false };
    } catch (err) {
      console.error('Error verifying password:', err);
      return { ok: false, needsRehash: false };
    }
  }
}

module.exports = User;