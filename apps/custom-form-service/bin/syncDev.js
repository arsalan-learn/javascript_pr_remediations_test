#!/usr/bin/env node

const { syncDev } = require('@og-pro/db-migration');

syncDev()
  .then(() => {
    console.log('Database synced successfully');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Error syncing database:', err);
    process.exit(1);
  }); 