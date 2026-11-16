import { Router } from 'express'
import mongoose from 'mongoose'
import Product from '../models/Product.js'
import auth from '../middleware/auth.js'

const router = Router()

const checkId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: 'Invalid product id' })
  }
  next()
}

const handleError = (err, res) => {
  if (err.name === 'ValidationError' || err.name === 'CastError') {
    return res.status(400).json({ message: err.message })
  }
  res.status(500).json({ message: 'Server error' })
}

// Public
router.get('/', async (req, res) => {
  try {
    res.status(200).json(await Product.find())
  } catch (err) {
    handleError(err, res)
  }
})

router.get('/:id', checkId, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.status(200).json(product)
  } catch (err) {
    handleError(err, res)
  }
})

// Protected (token required)
router.post('/', auth, async (req, res) => {
  try {
    const product = await Product.create(req.body)
    res.status(201).json(product)
  } catch (err) {
    handleError(err, res)
  }
})

router.put('/:id', auth, checkId, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.status(200).json(product)
  } catch (err) {
    handleError(err, res)
  }
})

router.delete('/:id', auth, checkId, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) return res.status(404).json({ message: 'Product not found' })
    res.status(200).json({ message: 'Product deleted' })
  } catch (err) {
    handleError(err, res)
  }
})

export default router
