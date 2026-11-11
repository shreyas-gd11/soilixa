// Configure the backend API URL for local development and production.
// Configure the single API endpoint here after the Render service is live.
const SOILIXA_CONFIG = Object.freeze({ apiBaseUrl: (function () {
  const hostname = window.location.hostname || '';
  const isLocalFile = window.location.protocol === 'file:' || !hostname;

  if (isLocalFile || ['localhost', '127.0.0.1'].includes(hostname)) {
    return 'http://localhost:3000';
  }

  return 'https://YOUR-SOILIXA-BACKEND.onrender.com';
})(), whatsappNumber: 'TODO-WHATSAPP-NUMBER', contactEmail: 'TODO-CONTACT-EMAIL', upiId: 'TODO-UPI-ID', policyVersion: '2026-11-07-v1' });
const API_BASE_URL = SOILIXA_CONFIG.apiBaseUrl;
window.SOILIXA_CONFIG = SOILIXA_CONFIG;

(function warnIfApiBaseUrlUnset() {
  const isPlaceholder = !API_BASE_URL
    || API_BASE_URL.includes('YOUR-SOILIXA-BACKEND')
    || API_BASE_URL.includes('example.com');

  if (isPlaceholder) {
    console.error(
      '[Soilixa] API_BASE_URL is still a placeholder:',
      API_BASE_URL,
      '\nSet apiBaseUrl in js/config.js to the deployed Render service, then redeploy Netlify.'
    );
  } else {
    console.info('[Soilixa] API_BASE_URL =', API_BASE_URL);
  }
})();
