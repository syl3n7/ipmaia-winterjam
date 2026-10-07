const { expect } = require('chai');
const { sanitizeData } = require('../routes/forms');

describe('form submission sanitization', () => {
  it('preserves team member names from object arrays', () => {
    const data = {
      team_members: [
        { name: 'member1' },
        { name: 'member2' },
        { name: 'membername memberlastname' },
      ],
    };

    expect(sanitizeData(data)).to.deep.equal({
      team_members: ['member1', 'member2', 'membername memberlastname'],
    });
  });
});
