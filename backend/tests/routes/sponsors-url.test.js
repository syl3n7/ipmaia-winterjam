const { expect } = require('chai');
const { normalizeSponsorLogoReference, getSponsorImageSrc } = require('../routes/sponsors');

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
});
