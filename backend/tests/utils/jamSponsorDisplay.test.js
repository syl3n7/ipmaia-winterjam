const { expect } = require('chai');
const { normalizeJamSponsorEntries, pickJamSponsorsForDisplay } = require('../../utils/jamSponsorDisplay');

describe('jam sponsor display helpers', () => {
  it('sorts selected sponsors by display_order and keeps the active ones', () => {
    const result = normalizeJamSponsorEntries([
      { sponsor_id: 7, display_order: 2, is_active: true },
      { sponsor_id: 2, display_order: 0, is_active: true },
      { sponsor_id: 5, display_order: 1, is_active: false },
    ]);

    expect(result.map(item => item.sponsor_id)).to.deep.equal([2, 7]);
  });

  it('prefers jam sponsors over fallback sponsors when a jam provides entries', () => {
    const result = pickJamSponsorsForDisplay(
      [
        { sponsor_id: 10, display_order: 0, is_active: true, href: 'https://jam.example', imgSrc: '/jam.png', alt: 'Jam sponsor' },
      ],
      [
        { sponsor_id: 1, href: 'https://fallback.example', imgSrc: '/fallback.png', alt: 'Fallback sponsor' },
      ]
    );

    expect(result).to.have.length(1);
    expect(result[0].sponsor_id).to.equal(10);
    expect(result[0].href).to.equal('https://jam.example');
  });

  it('falls back to the general sponsor list when a jam has no selected sponsors', () => {
    const result = pickJamSponsorsForDisplay([], [
      { sponsor_id: 1, href: 'https://fallback.example', imgSrc: '/fallback.png', alt: 'Fallback sponsor' },
      { sponsor_id: 2, href: 'https://fallback-two.example', imgSrc: '/fallback2.png', alt: 'Fallback sponsor 2' },
    ]);

    expect(result).to.have.length(2);
    expect(result[0].sponsor_id).to.equal(1);
  });
});
