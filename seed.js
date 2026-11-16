// Optional: resets the products to the 10 sample products.
import checkEnv from './config/checkEnv.js'
checkEnv()

const { default: mongoose } = await import('mongoose')
const { default: connectDB } = await import('./config/db.js')
const { default: Product } = await import('./models/Product.js')
const { default: sampleProducts } = await import('./data/products.js')

if (!(await connectDB())) process.exit(1)
await Product.deleteMany()
await Product.insertMany(sampleProducts)
console.log(`Inserted ${sampleProducts.length} products`)
await mongoose.disconnect()
