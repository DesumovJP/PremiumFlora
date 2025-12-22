const crypto = require('crypto');

function generateKey(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function generateAppKeys() {
  return [
    generateKey(),
    generateKey(),
    generateKey(),
    generateKey(),
  ].join(',');
}

console.log('=== Strapi Production Secrets ===\n');
console.log('Copy these to Railway Environment Variables:\n');
console.log(`APP_KEYS=${generateAppKeys()}`);
console.log(`API_TOKEN_SALT=${generateKey()}`);
console.log(`ADMIN_JWT_SECRET=${generateKey()}`);
console.log(`JWT_SECRET=${generateKey()}`);
console.log(`TRANSFER_TOKEN_SALT=${generateKey()}`);
console.log(`ENCRYPTION_KEY=${generateKey()}`);
console.log('\n=== End of Secrets ===');
