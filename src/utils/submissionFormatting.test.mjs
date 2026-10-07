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

test('splits comma- and newline-separated team members into individual names', () => {
  assert.equal(
    formatSubmissionValue('member1, member2\nmember3, member4'),
    'member1, member2, member3, member4',
  );
});

test('leaves regular string values unchanged', () => {
  assert.equal(formatSubmissionValue('email@email.com'), 'email@email.com');
});
