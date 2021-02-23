import 'reflect-metadata'
import { createConnection } from 'typeorm'
import express from 'express'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import cors from 'cors'

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })

import authRoutes from './routes/auth'
import postRoutes from './routes/posts'
import subRoutes from './routes/subs'
import miscRoutes from './routes/misc'
import userRoutes from './routes/users'

import trim from './middleware/trim'
import { createProxyMiddleware } from 'http-proxy-middleware'
const app = express()
const PORT = process.env.PORT
app.use(express.json())
app.use(morgan('dev'))
app.use(trim)
app.use(cookieParser())
app.use(
  cors({
    credentials: true,
    origin: process.env.APP_URL,
    optionsSuccessStatus: 200,
  }),
)
app.use(express.static('public'))
app.disable('x-powered-by')
app.get('/hehe', (_, res) => res.send('eheheh'))
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/subs', subRoutes)
app.use('/api/misc', miscRoutes)
app.use('/api/users', userRoutes)
app.all('*', (_, res) => {
  res.setHeader('X-Powered-By', 'Anak Bangsa')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  )
})
app.listen(PORT, async () => {
  console.log(`Server running at http://localhost:${PORT}`)
  console.log(process.env.NODE_ENV, 'env')
  try {
    await createConnection()
    console.log('Database connected!')
  } catch (err) {
    console.log(err)
  }
})
