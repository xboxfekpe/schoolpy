// Android emulator: 10.0.2.2
// iOS simulator: localhost
// Real phone: your computer's LAN IP
// Production web: deployed backend URL
const defaultApiBase = 'https://your-render-backend-url';

export const BASE =
  (typeof process !== 'undefined' && process.env.EXPO_PUBLIC_API_BASE) ||
  defaultApiBase;

let token = null;

export const setToken = (t) => {
  token = t;
};

export async function api(path, method = 'GET', body) {
  const r = await fetch(BASE + path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const d = await r.json().catch(() => ({}));

  if (!r.ok) {
    throw new Error(
      typeof d.detail === 'string' ? d.detail : 'Check the form and try again'
    );
  }

  return d;
}
