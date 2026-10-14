import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

// Exercise the actual submit handlers, isolating only their UI/network boundaries.
function handler(path, name) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8');
  const start = source.indexOf(`function ${name}()`);
  assert.ok(start >= 0, `Submit handler ${name} must exist`);
  const body = source.indexOf('{', start);
  let depth = 1;
  let end = body + 1;
  while (depth && end < source.length) {
    if (source[end] === '{') depth++;
    if (source[end] === '}') depth--;
    end++;
  }
  assert.equal(depth, 0, 'Submit handler must have a complete body');
  return source.slice(start, end);
}

for (const [label, path, name] of [
  ['mailbox', '../src/layout/account/index.vue', 'submit'],
  ['registration', '../src/views/login/index.vue', 'submitRegister'],
]) {
  function submitContext(widgetId) {
    let attempts = 0;
    let requests = 0;
    const context = vm.createContext({
      addForm: { email: 'new-mailbox', suffix: '@example.com' },
      registerForm: { email: 'new-user', password: 'test-password', confirmPassword: 'test-password' },
      suffix: { value: '@example.com' },
      settingStore: { settings: { minEmailPrefix: 1, regKey: 1, addEmailVerify: 0, registerVerify: 0 } },
      verifyToken: '',
      verifyShow: { value: true },
      verificationError: { value: '' },
      turnstileId: widgetId,
      verifyErrorCount: 0,
      isEmail: () => true,
      t: key => key,
      ElMessage: () => {},
      console: { log: () => {} },
      showVerification: () => { attempts++; },
      accountAdd: () => { requests++; throw new Error('Unverified mailbox request'); },
      register: () => { requests++; throw new Error('Unverified registration request'); },
    });
    vm.runInContext(handler(path, name), context);
    return { submit: () => context[name](), attempts: () => attempts, requests: () => requests };
  }

  test(`${label} retries when reopened after script loading was interrupted`, () => {
    const flow = submitContext(null);
    flow.submit();
    assert.equal(flow.attempts(), 1);
    assert.equal(flow.requests(), 0);
  });

  test(`${label} with a pending widget cannot submit without a verification token`, () => {
    const flow = submitContext('widget-id');
    flow.submit();
    assert.equal(flow.attempts(), 0);
    assert.equal(flow.requests(), 0);
  });
}
