const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const redis = require('redis');


module.exports = (app) => {
  if (process.env.NODE_ENV === 'production') {
    const redisClient = redis.createClient({
      url: process.env.REDIS_URL,
      legacyMode: true,
    });
    redisClient.connect().catch(console.error);
    
    app.use(session({
      store: new RedisStore({ client: redisClient }),
      secret: process.env.SESSION_SECRET || 'default_secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: true,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      }
    }));
  } else {
    app.use(session({
      secret: process.env.SESSION_SECRET || 'dev_secret',
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      }
    }));
  }
};