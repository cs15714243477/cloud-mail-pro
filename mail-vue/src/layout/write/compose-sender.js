export function applyComposerSender(form, account) {
  if (!account?.email || !(account.accountId > 0)) return false;
  form.accountId = account.accountId;
  form.sendEmail = account.email;
  form.name = account.name || '';
  return true;
}

export function hasSameComposerSender(form, original) {
  return form.accountId === original.accountId &&
    form.sendEmail === original.sendEmail && form.name === original.name;
}
