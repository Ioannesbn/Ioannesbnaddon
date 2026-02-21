#!/usr/bin/env node
const { serveHTTP } = require('stremio-addon-sdk');
const addonInterface = require('./addon');

serveHTTP(addonInterface, { port: process.env.PORT || 7000 });
console.log(`Addon IoannesBn environment version running at: http://localhost:7000/manifest.json`);
