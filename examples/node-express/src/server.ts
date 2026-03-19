import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'
import { fileURLToPath } from 'url'
import { AuthonBackend } from '@authon/node'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
const authon = new AuthonBackend(process.env.AUTHON_API_KEY!, {
  apiUrl: process.env.AUTHON_API_URL,
})

app.use(express.json())
app.use(cookieParser())
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, '..', 'src', 'views'))

app.get('/', async (req, res) => {
  const token = req.cookies.authon_token
  let user = null
  if (token) {
    try {
      user = await authon.verifyToken(token)
    } catch {
      res.clearCookie('authon_token')
    }
  }
  res.render('index', {
    user,
    projectId: process.env.AUTHON_PROJECT_ID,
    apiUrl: process.env.AUTHON_API_URL || 'https://api.authon.dev',
  })
})

app.post('/auth/token', (req, res) => {
  const { token } = req.body
  if (!token) {
    res.status(400).json({ error: 'missing token' })
    return
  }
  res.cookie('authon_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600000,
  })
  res.json({ ok: true })
})

app.post('/auth/signout', (req, res) => {
  res.clearCookie('authon_token')
  res.redirect('/')
})

app.post('/webhook', express.raw({ type: '*/*' }), (req, res) => {
  try {
    const sig = req.headers['x-authon-signature'] as string
    const ts = req.headers['x-authon-timestamp'] as string
    const event = authon.webhooks.verify(req.body, sig, ts, process.env.AUTHON_WEBHOOK_SECRET!)
    console.log('Webhook received:', event)
    res.json({ ok: true })
  } catch {
    res.status(400).json({ error: 'invalid signature' })
  }
})

const port = parseInt(process.env.PORT || '3000', 10)
app.listen(port, () => console.log(`Authon Express example running on :${port}`))
