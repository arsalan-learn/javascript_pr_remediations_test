const Koa = require('koa');
const Router = require('@koa/router');
const { logger } = require('winston');
const coa = require('coa');

const app = new Koa();
const router = new Router();

// Example usage of coa - This is just a placeholder
// The vulnerability typically occurs during command-line argument parsing
try {
  const program = coa.Cmd();
  program.name('example-app').version('1.0.0');
  program.option({
    name: 'input',
    shortcut: 'i',
    description: 'Input file'
  });
  // Attempt to parse dummy args to potentially trigger vulnerable code paths
  // In a real scenario, this would parse process.argv
  program.parse(['node', 'app.js', '-i', 'test.txt']);
  logger.info('COA parsed arguments successfully (example)');
} catch (err) {
  logger.error('Error using COA (example):', err);
}

// Add middleware
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    logger.error('Error in custom form service:', err);
    ctx.status = err.status || 500;
    ctx.body = {
      error: err.message
    };
  }
});

// Add routes
router.get('/health', (ctx) => {
  ctx.body = { status: 'ok' };
});

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app; 