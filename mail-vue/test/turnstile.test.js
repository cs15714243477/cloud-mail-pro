import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';

const originalWindow = globalThis.window;
const originalDocument = globalThis.document;
let serial = 0;

afterEach(() => {
  globalThis.window = originalWindow;
  globalThis.document = originalDocument;
});

async function fixture() {
  const scripts = [];
  globalThis.window = {};
  globalThis.document = {
    createElement() {
      const script = new EventTarget();
      script.remove = () => scripts.splice(scripts.indexOf(script), 1);
      return script;
    },
    head: { appendChild: script => scripts.push(script) },
    querySelector: () => scripts[0] || null,
  };
  const { getTurnstile } = await import(`../src/utils/turnstile.js?test=${serial++}`);
  return { scripts, getTurnstile };
}

test('missing site key blocks verification before any script is requested', async () => {
  const { scripts, getTurnstile } = await fixture();
  await assert.rejects(getTurnstile(''), { code: 'TURNSTILE_NOT_CONFIGURED' });
  assert.equal(scripts.length, 0);
});

test('verification waits for a slow script to finish loading', async () => {
  const { scripts, getTurnstile } = await fixture();
  let finished = false;
  const pending = getTurnstile('site-key').then(api => { finished = true; return api; });
  await Promise.resolve();
  assert.equal(finished, false);
  assert.equal(scripts.length, 1);
  const api = { render() {} };
  window.turnstile = api;
  scripts[0].dispatchEvent(new Event('load'));
  assert.equal(await pending, api);
});

test('simultaneous verification requests share one script', async () => {
  const { scripts, getTurnstile } = await fixture();
  const first = getTurnstile('site-key');
  const second = getTurnstile('site-key');
  assert.equal(scripts.length, 1);
  const api = { ready: callback => callback(), render() {} };
  window.turnstile = api;
  scripts[0].dispatchEvent(new Event('load'));
  assert.deepEqual(await Promise.all([first, second]), [api, api]);
});

test('a failed script can be loaded again on the next attempt', async () => {
  const { scripts, getTurnstile } = await fixture();
  const failed = assert.rejects(getTurnstile('site-key'), { code: 'TURNSTILE_LOAD_FAILED' });
  scripts[0].dispatchEvent(new Event('error'));
  await failed;
  const pending = getTurnstile('site-key');
  assert.equal(scripts.length, 1);
  const api = { ready: callback => callback(), render() {} };
  window.turnstile = api;
  scripts[0].dispatchEvent(new Event('load'));
  assert.equal(await pending, api);
});

test('a stalled script times out and permits another attempt', async t => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const { scripts, getTurnstile } = await fixture();
  const failed = assert.rejects(getTurnstile('site-key'), { code: 'TURNSTILE_LOAD_FAILED' });
  t.mock.timers.tick(30000);
  await failed;
  const pending = getTurnstile('site-key');
  const api = { ready: callback => callback(), render() {} };
  window.turnstile = api;
  scripts[0].dispatchEvent(new Event('load'));
  assert.equal(await pending, api);
});

test('an already loaded API can be reused without another script request', async () => {
  const { scripts, getTurnstile } = await fixture();
  const api = { render() {} };
  window.turnstile = api;
  const pending = getTurnstile('site-key');
  assert.equal(scripts.length, 0);
  assert.equal(await pending, api);
});

test('an async-loaded Turnstile API remains usable when ready() rejects async scripts', async () => {
  const { scripts, getTurnstile } = await fixture();
  const api = {
    render() {},
    ready() { throw new Error('Remove async/defer before using turnstile.ready()'); },
  };
  const pending = getTurnstile('site-key');
  window.turnstile = api;
  scripts[0].dispatchEvent(new Event('load'));
  assert.equal(await pending, api);
});
