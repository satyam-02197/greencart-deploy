// server.js
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import 'dotenv/config'

import connectDB from './configs/db.js'
import connectCloudinary from './configs/cloudinary.js'
import userRouter from './routes/userRoute.js'
import sellerRouter from './routes/sellerRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import addressRouter from './routes/addressRoute.js'
import orderRouter from './routes/orderRoute.js'
import { stripeWebhooks } from './controllers/orderController.js'

const app = express()
const port = process.env.PORT || 4000

// 1) CONNECT DATABASE & CLOUDINARY
await connectDB()
await connectCloudinary()

// 2) CORS SETUP: allow localhost + your Vercel UI origin
const allowedOrigins = [
  'http://localhost:5173',
  'https://greencart-deploy-uiov.vercel.app'
]
const corsOptions = {
  origin: allowedOrigins,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  credentials: true  // ← so that cookies (or auth) can be sent
}

// 3) GLOBAL CORS HANDLER (for simple & preflight requests)
app.use(cors(corsOptions))
app.options('*', cors(corsOptions))

// 4) STRIPE WEBHOOK (must come _before_ express.json() so raw body is preserved)
app.post(
  '/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhooks
)

// 5) BODY + COOKIE PARSING
app.use(express.json())
app.use(cookieParser())

// 6) HEALTHCHECK
app.get('/', (req, res) => {
  res.send('API is Working')
})

// 7) MOUNT YOUR ROUTES
app.use('/api/user',    userRouter)
app.use('/api/seller',  sellerRouter)
app.use('/api/product', productRouter)
app.use('/api/cart',    cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/order',   orderRouter)

// 8) START THE SERVER
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
