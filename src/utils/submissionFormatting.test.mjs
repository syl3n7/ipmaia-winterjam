import test from 'node:test';
import assert from 'node:assert/strict';
import { formatSubmissionValue } from './submissionFormatting.mjs';

test('formats team members stored as objects into a readable comma-separated list', () => {
  assert.equal(
    formatSubmissionValue([
      { name: 'membro1' },
      { name: 'membro2' },
      { name: 'membro3' },
    ]),
    'membro1, membro2, membro3',
  );
});

test('leaves regular string values unchanged', () => {
  assert.equal(formatSubmissionValue('email@email.com'), 'email@email.com');
});
