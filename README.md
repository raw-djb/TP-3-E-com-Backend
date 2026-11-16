# Lumiere Backend

**Student name:** DJEBIR Raounak
**Module:** WAMD - TD/TP 3 (ENSTA)

REST API for the Lumiere sleepwear store. It stores **products** and **users** in MongoDB. Users can register and log in. Creating, updating and deleting products needs a token.

## Technologies

Node.js, Express, MongoDB (Atlas) with Mongoose, bcryptjs, jsonwebtoken (JWT), express-rate-limit, cors, dotenv.

## Project structure

```
server.js            Starts the server and connects to MongoDB
app.js               Express app: CORS, rate limit, routes, errors
seed.js              Resets the 10 sample products (optional)
config/              checkEnv.js (checks .env) and db.js (MongoDB connection)
data/products.js     The 10 sample products
models/              Product.js and User.js
routes/              auth.js and products.js
middleware/          auth.js (token check) and rateLimit.js
scripts/setup.js     Creates the .env file
```

## Install and run

1. Install Node.js 18 or newer.
2. Open a terminal in the `backend` folder.
3. Install the packages:
   ```
   npm install
   ```
4. Create the `.env` file:
   ```
   npm run setup
   ```
5. Open `.env` and set `MONGODB_URI` (see the next section).
6. Start the server:
   ```
   npm run dev
   ```

You should see:

```
Server running on http://localhost:3000
MongoDB connected
```

The first time, the database is empty, so the server adds 10 sample products automatically. To reset them later, run `npm run seed`.

## MongoDB Atlas setup

1. Create a free **M0 cluster** on MongoDB Atlas.
2. **Database Access:** create a user. Use a password with letters and numbers only. Give it the privilege *Read and write to any database*.
3. **Network Access:** add your IP, or `0.0.0.0/0` for testing. Wait until the status is **Active**.
4. Click **Connect > Drivers** on your cluster and copy the connection string.
5. Paste it in `.env` as `MONGODB_URI` and change two things:
   - replace the password placeholder with your real password (no `<` `>`),
   - add the database name before the `?`, for example `/lumiere20`.

## Environment variables (`.env`)

```
PORT=3000
MONGODB_URI=mongodb+srv://USER:PASSWORD@YOURCLUSTER.mongodb.net/lumiere20?appName=Cluster0
JWT_SECRET=any_long_random_text
CLIENT_ORIGIN=http://localhost:5173
```

The `.env` file contains secrets. It is in `.gitignore`: never push it to GitHub and never share it. Use `.env.example` as the template.

## Database models

**Product:** name, description, price (min 0), category, imageUrl, stock (min 0). All required except imageUrl.

**User:** name, email (unique, lowercase), passwordHash.

## API endpoints

| Method | Endpoint | What it does | Access |
|---|---|---|---|
| POST | `/api/auth/register` | Create a user | Public |
| POST | `/api/auth/login` | Log in and get a JWT | Public (5 tries / 15 min) |
| GET | `/api/products` | List all products | Public |
| GET | `/api/products/:id` | Get one product | Public |
| POST | `/api/products` | Create a product | Token |
| PUT | `/api/products/:id` | Update a product | Token |
| DELETE | `/api/products/:id` | Delete a product | Token |

**Example bodies**

Register: `{ "name": "Amina", "email": "amina@mail.com", "password": "secret123" }`
Login: `{ "email": "amina@mail.com", "password": "secret123" }` returns `{ "token": "..." }`

## Security

- **Passwords** are hashed with bcrypt. Only the hash is stored.
- **JWT:** login returns a token valid for 1 hour. For protected routes send the header `Authorization: Bearer <TOKEN>`. Without a valid token the API returns **401**.
- **OAuth2:** the same routes also accept a Google access token. If the token is not one of our JWTs, the server asks Google to check it.
- **Rate limiting:** all `/api` routes allow 100 requests per 15 minutes. Login allows only 5 per 15 minutes. After that the API returns **429**.
- **CORS:** only `CLIENT_ORIGIN` (the React app) can call the API from a browser.

## Status codes and errors

| Code | Meaning |
|---|---|
| 200 / 201 | OK / created |
| 400 | Invalid data, invalid id, or invalid JSON |
| 401 | Missing, invalid or expired token, or wrong login |
| 404 | Product or route not found |
| 409 | Email already registered |
| 429 | Too many requests |
| 500 | Server error |
| 503 | Database not connected yet |

Every error has the same format: `{ "message": "..." }`

## Common problems

| Problem | What to do |
|---|---|
| Frontend says "Cannot reach the server" | The backend is not running. Run `npm run dev` in `backend` |
| API answers **503** | The server runs but MongoDB is not connected. Read the reason in the terminal. It retries every 10 seconds |
| `Could not connect to any servers` / `Cannot reach the database` | Atlas > Network Access: add your IP (or `0.0.0.0/0`) and wait for **Active**. Check the cluster is not paused |
| `bad auth` / `Authentication failed` | Wrong username or password in `MONGODB_URI`. Reset the password in Atlas > Database Access |
| `MONGODB_URI is not a real connection string` | You did not replace the placeholder in `.env` |
| `ENOTFOUND` / `querySrv` | Wrong cluster address or DNS problem. Copy the string again from Atlas, or try another network |

