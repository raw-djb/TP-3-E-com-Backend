import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { loginLimiter } from '../middleware/rateLimit.js'

const router = Router()

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {}
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' })
    }
    if (typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must have at least 6 characters' })
    }

    const exists = await User.findOne({ email: String(email).toLowerCase() })
    if (exists) return res.status(409).json({ message: 'Email already registered' })

    const passwordHash = await bcrypt.hash(password, 10)
    const user = await User.create({ name, email, passwordHash })

    res.status(201).json({ id: user._id, name: user.name, email: user.email })
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'Email already registered' })
    res.status(500).json({ message: 'Server error' })
  }
})

router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body || {}
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' })
    }

    const user = await User.findOne({ email: String(email).toLowerCase() })
    const ok = user && (await bcrypt.compare(String(password), user.passwordHash))
    if (!ok) return res.status(401).json({ message: 'Invalid email or password' })

    const token = jwt.sign({ id: user._id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    })
    res.status(200).json({ token })
  } catch (err) {
    res.status(500).json({ message: 'Server error' })
  }
})

export default router
