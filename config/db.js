import mongoose from 'mongoose'

// Turns common MongoDB errors into a short hint. The raw error is always printed too.
function explain(err) {
  const m = err.message || ''
  if (m.includes('ENOTFOUND') || m.includes('querySrv'))
    return 'The cluster address in MONGODB_URI was not found. Copy the exact string from Atlas (Connect > Drivers), or check your DNS / internet.'
  if (m.includes('bad auth') || m.includes('Authentication failed'))
    return 'Wrong username or password in MONGODB_URI. Check Atlas > Database Access. Do not keep the < > signs.'
  if (m.includes('whitelist') || m.includes("isn't whitelisted") || m.includes('Could not connect to any servers'))
    return 'Atlas refused the connection. Most likely your IP is not allowed: Atlas > Network Access > Add IP Address (or 0.0.0.0/0). Also check the cluster is not paused.'
  if (m.includes('Server selection timed out') || m.includes('ETIMEOUT') || m.includes('ECONNREFUSED'))
    return 'Cannot reach the database. In Atlas > Network Access, add your IP (or 0.0.0.0/0). For a local MongoDB, check that it is running.'
  return 'Unknown database error (see the raw message above).'
}

// Tries to connect once. Returns true on success, false on failure (never exits the process).
export default async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      family: 4, // use IPv4: avoids IPv6/DNS timeouts that are common on Windows
    })
    console.log('MongoDB connected')
    return true
  } catch (err) {
    console.error('\nMongoDB connection failed.')
    console.error(' - Raw error: ' + err.message)
    console.error(' - Hint: ' + explain(err) + '\n')
    return false
  }
}

export const isDbReady = () => mongoose.connection.readyState === 1
