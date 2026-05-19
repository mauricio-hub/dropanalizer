#!/usr/bin/env node

/**
 * Setup Cloudinary Unsigned Upload Preset
 *
 * This script creates an unsigned upload preset for the Dropanalizer project
 * It requires Cloudinary API credentials
 */

const https = require('https');

// Get credentials from environment or command line
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dnkqzaolo';
const apiKey = process.env.CLOUDINARY_API_KEY || '957891344239572';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'X1Nw8wQw54EzZz1mEQ4tTeaF150';

const presetName = 'proply_unsigned';

console.log('🚀 Setting up Cloudinary unsigned upload preset...');
console.log(`   Cloud: ${cloudName}`);
console.log(`   Preset: ${presetName}`);

// Create request body
const body = new URLSearchParams({
  name: presetName,
  unsigned: true,
  type: 'upload',
});

// Prepare auth header
const auth = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64');

const options = {
  hostname: 'api.cloudinary.com',
  port: 443,
  path: `/v1_1/${cloudName}/upload_presets`,
  method: 'POST',
  headers: {
    'Authorization': `Basic ${auth}`,
    'Content-Type': 'application/x-www-form-urlencoded',
    'Content-Length': body.toString().length,
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      const result = JSON.parse(data);
      console.log('✅ Success! Unsigned preset created.');
      console.log(`   Preset ID: ${result.name}`);
      console.log(`   Unsigned: ${result.unsigned}`);
      console.log('\nYou can now upload images to Dropanalizer!');
    } else if (res.statusCode === 409) {
      console.log('ℹ️  Preset already exists (this is fine!)');
      console.log('   You can now upload images to Dropanalizer!');
    } else {
      console.error(`❌ Error: ${res.statusCode}`);
      console.error(data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(body.toString());
req.end();
