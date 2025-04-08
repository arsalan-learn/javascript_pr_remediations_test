#!/usr/bin/env node

const { createServer } = require('@og-pro/service-harness');
const app = require('../src/app');

const server = createServer(app);
const port = process.env.PORT || 3000;

server.listen(port, () => {
  console.log(`Custom Form Service running on port ${port}`);
}); 