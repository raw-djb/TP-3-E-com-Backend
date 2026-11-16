import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import { apiLimiter } from './middleware/rateLimit.js'
import { isDbReady } from './config/db.js'

const app = express()

app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }))
app.use(express.json())
app.use('/api', apiLimiter)

// If MongoDB is not connected yet, answer clearly instead of hanging.
app.use('/api', (req, res, next) => {
  if (!isDbReady()) {
    return res.status(503).json({ message: 'Database not connected yet. Check the backend terminal for the reason.' })
  }
  next()
})

app.get('/', (req, res) => res.json({ message: 'Lumiere API is running' }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)

// Unknown route
app.use((req, res) => res.status(404).json({ message: 'Route not found' }))

// Bad JSON body and other errors
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Invalid JSON body' })
  }
  res.status(500).json({ message: 'Server error' })
})

export default app
