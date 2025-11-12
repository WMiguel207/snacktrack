// Simple client helper to call the local backend API
// Edit BASE_URL depending on environment.

const isAndroidEmulator = () => {
  // For Android emulator, localhost of machine is 10.0.2.2
  return true;
};

const DEV_BASE = 'http://10.0.2.2:3000'; // Android emulator
// If you're testing on device via ngrok, replace with the ngrok HTTPS URL
// e.g. const DEV_BASE = 'https://abcd-1234.ngrok.io'
const BASE_URL = __DEV__ ? DEV_BASE : 'https://your-production-url.example';

export async function getItems() {
  const res = await fetch(`${BASE_URL}/items`);
  if (!res.ok) throw new Error('Network response not ok');
  return res.json();
}

export async function createOrder(payload) {
  const res = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Network response not ok');
  return res.json();
}
