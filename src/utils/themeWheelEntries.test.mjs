import test from 'node:test';
import assert from 'node:assert/strict';
import { createThemeEntry } from './themeWheelEntries.mjs';

test('creates a trimmed enabled theme entry', () => {
  assert.deepEqual(createThemeEntry('   Cyberpunk City  '), {
    text: 'Cyberpunk City',
    weight: 1,
    enabled: true,
  });
});

test('rejects empty theme text', () => {
  assert.equal(createThemeEntry('   '), null);
});
