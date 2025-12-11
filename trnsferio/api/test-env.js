require('dotenv').config();

console.log('=== Environment Variables Test ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('PORT:', process.env.PORT);

console.log('\n=== All Environment Variables ===');
// Show only environment variables that start with DB_
Object.keys(process.env).filter(key => key.startsWith('DB_')).forEach(key => {
  console.log(`${key}: ${process.env[key]}`);
});

console.log('\n=== .env file path check ===');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
console.log('Looking for .env at:', envPath);
console.log('.env file exists:', fs.existsSync(envPath));

if (fs.existsSync(envPath)) {
  console.log('.env file contents:');
  console.log(fs.readFileSync(envPath, 'utf8'));
}