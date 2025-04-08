const Koa = require('koa');
const Router = require('@koa/router');
const { logger } = require('@og-pro/logger');

const app = new Koa();
const router = new Router();

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