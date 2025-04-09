const Koa = require('koa');
const Router = require('@koa/router');
const { logger } = require('winston');
const coa = require('coa');
const jwt = require('jsonwebtoken');
const webpack = require('webpack');

const app = new Koa();
const router = new Router();

// Example usage of coa
try {
  const program = coa.Cmd();
  program.name('example-app').version('1.0.0');
  program.option({
    name: 'input',
    shortcut: 'i',
    description: 'Input file'
  });
  program.parse(['node', 'app.js', '-i', 'test.txt']);
  logger.info('COA parsed arguments successfully (example)');
} catch (err) {
  logger.error('Error using COA (example):', err);
}

// Example JWT usage
const generateToken = (payload) => {
  try {
    const token = jwt.sign(payload, 'your-secret-key', { expiresIn: '1h' });
    return token;
  } catch (err) {
    logger.error('Error generating JWT:', err);
    throw err;
  }
};

// Example webpack usage
const webpackConfig = {
  entry: './src/index.js',
  output: {
    path: __dirname + '/dist',
    filename: 'bundle.js'
  }
};

const compiler = webpack(webpackConfig);

// Add middleware
app.use(async (ctx, next) => {
  try {
    // Example JWT verification
    const authHeader = ctx.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, 'your-secret-key');
        ctx.state.user = decoded;
      } catch (err) {
        logger.warn('Invalid token:', err);
      }
    }
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

// Example route using JWT
router.post('/login', (ctx) => {
  const { username, password } = ctx.request.body;
  // In a real app, verify credentials here
  const token = generateToken({ username });
  ctx.body = { token };
});

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app; 