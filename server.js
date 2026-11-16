import checkEnv from './config/checkEnv.js'
checkEnv()

const { default: connectDB } = await import('./config/db.js')
const { default: app } = await import('./app.js')
const { default: Product } = await import('./models/Product.js')
const { default: sampleProducts } = await import('./data/products.js')

const PORT = process.env.PORT || 3000
const RETRY_MS = 10000

// Start the HTTP server first. While MongoDB is not connected, /api answers 503
// with a clear message (instead of "connection refused" in the browser).
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`))

// Connect to MongoDB, and keep retrying until it works.
async function connectWithRetry() {
  while (!(await connectDB())) {
    console.log(`Retrying MongoDB connection in ${RETRY_MS / 1000} seconds...`)
    await new Promise((r) => setTimeout(r, RETRY_MS))
  }
  // Add the sample products automatically the first time (empty database)
  if ((await Product.countDocuments()) === 0) {
    await Product.insertMany(sampleProducts)
    console.log(`Database was empty: added ${sampleProducts.length} sample products`)
  }
}
connectWithRetry()
