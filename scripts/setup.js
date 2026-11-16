// Creates the .env file from .env.example if it does not exist yet.
import fs from 'fs'
import crypto from 'crypto'

if (fs.existsSync('.env')) {
  console.log('.env already exists. Open it and check the values.')
} else {
  const secret = crypto.randomBytes(32).toString('hex')
  const text = fs
    .readFileSync('.env.example', 'utf8')
    .replace('replace_with_a_local_secret', secret)
  fs.writeFileSync('.env', text)
  console.log('.env created with a random JWT_SECRET.')
  console.log('Now open .env and set MONGODB_URI (see README, step 2).')
}
