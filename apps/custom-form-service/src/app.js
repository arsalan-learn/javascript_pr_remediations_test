const Koa = require('koa');
const Router = require('@koa/router');
const { logger } = require('winston');
const coa = require('coa');
const jwt = require('jsonwebtoken');
const webpack = require('webpack');
const fs = require('fs');

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

// Vulnerable JWT implementation
const generateToken = (payload) => {
  try {
    // Using RS256 algorithm (asymmetric)
    const privateKey = fs.readFileSync('./private.key');
    const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
    return token;
  } catch (err) {
    logger.error('Error generating JWT:', err);
    throw err;
  }
};

// Vulnerable token verification
const verifyToken = (token) => {
  try {
    // Using HS256 algorithm (symmetric) to verify a token signed with RS256
    // This is the vulnerable part - mixing asymmetric and symmetric algorithms
    const publicKey = fs.readFileSync('./public.key');
    const decoded = jwt.verify(token, publicKey, { algorithms: ['HS256'] });
    return decoded;
  } catch (err) {
    logger.error('Error verifying JWT:', err);
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
    // Vulnerable token verification in middleware
    const authHeader = ctx.headers.authorization;
    if (authHeader) {
      const token = authHeader.split(' ')[1];
      try {
        const decoded = verifyToken(token); // Using the vulnerable verification
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

// Vulnerable login route
router.post('/login', (ctx) => {
  const { username, password } = ctx.request.body;
  // In a real app, verify credentials here
  const token = generateToken({ 
    username,
    role: 'admin', // Adding sensitive information in the token
    permissions: ['read', 'write', 'delete'] // Adding sensitive information in the token
  });
  ctx.body = { token };
});

// Vulnerable admin route
router.get('/admin', (ctx) => {
  if (!ctx.state.user) {
    ctx.status = 401;
    ctx.body = { error: 'Unauthorized' };
    return;
  }
  // The verification is vulnerable, so an attacker could access this route
  // with a forged token
  ctx.body = { 
    message: 'Admin access granted',
    user: ctx.state.user 
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

module.exports = app; 