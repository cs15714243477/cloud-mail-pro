let loading;

export async function getTurnstile(siteKey) {
  if (!siteKey?.trim()) {
    throw Object.assign(new Error('Turnstile site key is missing'), { code: 'TURNSTILE_NOT_CONFIGURED' });
  }
  if (loading) return loading;

  loading = new Promise((resolve, reject) => {
    let script;
    const cleanup = () => {
      clearTimeout(timeout);
      script?.removeEventListener('load', ready);
      script?.removeEventListener('error', failed);
    };
    const failed = () => {
      cleanup();
      script?.remove();
      reject(Object.assign(new Error('Turnstile failed to load'), { code: 'TURNSTILE_LOAD_FAILED' }));
    };
    const ready = () => {
      if (!window.turnstile?.render) return failed();
      try {
        window.turnstile.ready(() => {
          cleanup();
          resolve(window.turnstile);
        });
      } catch {
        failed();
      }
    };
    const timeout = setTimeout(failed, 20000);
    if (window.turnstile?.render) {
      ready();
      return;
    }
    script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.addEventListener('load', ready);
    script.addEventListener('error', failed);
    document.head.appendChild(script);
  }).finally(() => { loading = null; });

  return loading;
}
