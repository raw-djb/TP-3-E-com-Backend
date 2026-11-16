import rateLimit from 'express-rate-limit'

// To take the screenshot faster you can set API_MAX=5 in .env (default 100).
const apiMax = Number(process.env.API_MAX) || 100

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: apiMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please try again in 15 minutes.' },
})

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many login attempts. Please try again in 15 minutes.' },
})
