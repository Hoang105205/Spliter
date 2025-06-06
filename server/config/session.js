const session = require('express-session');

module.exports = (app) => {
  app.use(session({
    secret: process.env.SESSION_SECRET || 'default_secret',
    resave: false,
    saveUninitialized: true,
  }));
};

// Bản nâng cấp (nên dùng Redis trong production):

// module.exports = (app) => {
//   // Nếu là production, dùng RedisStore
//   if (process.env.NODE_ENV === 'production') {
//     const RedisStore = require('connect-redis')(session);
//     const redis = require('redis');
//     const redisClient = redis.createClient({
//       url: process.env.REDIS_URL,
//       legacyMode: true,
//     });
//     redisClient.connect().catch(console.error);

//     app.use(session({
//       store: new RedisStore({ client: redisClient }),
//       secret: process.env.SESSION_SECRET || 'default_secret',
//       resave: false,
//       saveUninitialized: false,
//       cookie: {
//         secure: true,      // Chỉ gửi cookie qua HTTPS
//         httpOnly: true,    // Không cho JS truy cập cookie
//         maxAge: 24 * 60 * 60 * 1000, // 1 ngày
//       }
//     }));
//   } else {
//     // Dev: dùng MemoryStore mặc định
//     app.use(session({
//       secret: process.env.SESSION_SECRET || 'dev_secret',
//       resave: false,
//       saveUninitialized: true,
//       cookie: {
//         secure: false,     // Cho phép qua HTTP
//         httpOnly: true,
//         maxAge: 24 * 60 * 60 * 1000,
//       }
//     }));
//   }
// };