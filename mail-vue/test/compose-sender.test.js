import assert from 'node:assert/strict';
import test from 'node:test';

const { applyComposerSender, hasSameComposerSender } = await import('../src/layout/write/compose-sender.js')
  .catch(error => {
    if (error.code === 'ERR_MODULE_NOT_FOUND') return {};
    throw error;
  });

test('switching the sender changes the send payload without losing draft content or attachments', () => {
  assert.equal(typeof applyComposerSender, 'function', 'Composer sender selection must be available');
  const attachments = [{ filename: 'notes.txt', key: 'attachment-1' }];
  const recipients = ['recipient@example.com'];
  const form = {
    accountId: 1, sendEmail: 'admin@example.com', name: 'Admin',
    receiveEmail: recipients, subject: 'Draft subject', content: '<p>Keep this body</p>',
    attachments, draftId: 17, sendType: 'reply', emailId: 29,
  };
  assert.equal(applyComposerSender(form, { accountId: 2, email: 'team@example.com', name: 'Team' }), true);
  assert.deepEqual(form, {
    accountId: 2, sendEmail: 'team@example.com', name: 'Team',
    receiveEmail: recipients, subject: 'Draft subject', content: '<p>Keep this body</p>',
    attachments, draftId: 17, sendType: 'reply', emailId: 29,
  });
  assert.equal(form.attachments, attachments);
  assert.equal(form.receiveEmail, recipients);
});

test('an unavailable sender cannot overwrite the selected identity', () => {
  assert.equal(typeof applyComposerSender, 'function', 'Composer sender selection must be available');
  const form = { accountId: 1, sendEmail: 'admin@example.com', name: 'Admin' };
  for (const account of [undefined, { email: 'team@example.com' }, { accountId: 2 }]) {
    assert.equal(applyComposerSender(form, account), false);
    assert.deepEqual(form, { accountId: 1, sendEmail: 'admin@example.com', name: 'Admin' });
  }
});

test('changing only the sender counts as an edit to a reply or forward', () => {
  assert.equal(typeof hasSameComposerSender, 'function', 'Sender identity must participate in the unsaved-edit check');
  const original = { accountId: 1, sendEmail: 'admin@example.com', name: 'Admin' };
  const form = { ...original, subject: 'Re: Question', content: '<p>Original quote</p>' };
  assert.equal(hasSameComposerSender(form, original), true);
  applyComposerSender(form, { accountId: 2, email: 'team@example.com', name: 'Team' });
  assert.equal(hasSameComposerSender(form, original), false);
  assert.equal(form.subject, 'Re: Question');
  assert.equal(form.content, '<p>Original quote</p>');
});
