const { expect } = require('chai');
const { normalizeSponsorLogoReference, getSponsorImageSrc, normalizeSponsorPayload } = require('../../routes/sponsors');
const { parseSponsorSettings } = require('../../routes/public');

describe('sponsor logo URL support', () => {
  it('accepts a direct external URL for the sponsor logo', () => {
    const result = normalizeSponsorLogoReference({
      logo_url: 'https://cdn.example.com/logo.png',
      logo_filename: ''
    });

    expect(result).to.equal('https://cdn.example.com/logo.png');
  });

  it('returns a direct remote URL without rewriting it through the upload route', () => {
    const result = getSponsorImageSrc('https://cdn.example.com/logo.png', 'http', 'localhost:3001');
    expect(result).to.equal('https://cdn.example.com/logo.png');
  });

  it('keeps uploaded filenames mapped to the sponsor logo endpoint', () => {
    const result = getSponsorImageSrc('my-logo.png', 'http', 'localhost:3001');
    expect(result).to.equal('http://localhost:3001/api/sponsors/logo/my-logo.png');
  });

  it('defaults new sponsors to inactive so they do not appear on the public frontpage until intentionally enabled', () => {
    const result = normalizeSponsorPayload({
      name: 'Example Sponsor',
      tier: 'gold',
    });

    expect(result.is_active).to.equal(false);
    expect(result.website_url).to.equal(null);
    expect(result.description).to.equal(null);
  });

  it('parses sponsor settings from JSON strings and falls back to defaults', () => {
    expect(parseSponsorSettings('{"appearance":"row","columns":2,"entries":[{"sponsor_id":7}]}')).to.deep.include({
      appearance: 'row',
      columns: 2,
      entries: [{ sponsor_id: 7 }]
    });
    expect(parseSponsorSettings('not-json')).to.deep.include({ appearance: 'grid', columns: 3, entries: [] });
  });
});
