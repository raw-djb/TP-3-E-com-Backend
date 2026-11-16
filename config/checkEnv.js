import 'dotenv/config'

// Stops the app early with a clear message if .env is not filled correctly.
export default function checkEnv() {
  const problems = []
  const uri = (process.env.MONGODB_URI || '').trim()
  const secret = (process.env.JWT_SECRET || '').trim()

  if (!uri) {
    problems.push('MONGODB_URI is missing. Create the .env file (run: npm run setup).')
  } else if (!/^mongodb(\+srv)?:\/\//.test(uri)) {
    problems.push(
      'MONGODB_URI is not a real connection string yet. It must start with mongodb+srv:// or mongodb://. ' +
        'Copy it from MongoDB Atlas (Connect > Drivers).'
    )
  } else if (/abcde|YOUR_|YOURCLUSTER|<db_password>|<password>/i.test(uri)) {
    problems.push(
      'MONGODB_URI still contains example text (abcde, YOUR_..., or <password>). ' +
        'Use your own cluster, username and password from MongoDB Atlas.'
    )
  }

  if (!secret) {
    problems.push('JWT_SECRET is missing. Add any long random text in .env.')
  }

  if (problems.length) {
    console.error('\nConfiguration problem(s):')
    problems.forEach((p) => console.error(' - ' + p))
    console.error('\nFix the .env file in the project folder, then run the command again.\n')
    process.exit(1)
  }
}
