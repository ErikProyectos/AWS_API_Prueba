import express from 'express'
import cookieParser from 'cookie-parser'
import compression from 'compression'
import cors from 'cors'
import mongoose from 'mongoose'

import router from './router'

const app = express()

app.use(cors({
  credentials: true
}))

app.use(compression())
app.use(cookieParser())

app.use(express.json()) // middleware that transforms req.body in format json

const PORT = 3000

const MONGO_URL = 'mongodb+srv://admin:K52HFBf4SBE9Cl9l@cluster0.rmic8tw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'

mongoose.Promise = Promise
mongoose.connect(MONGO_URL)
mongoose.connection.on('error', (error: Error) => console.log(error))

app.use('/', router())

/* app.get('/', (_req, res) => {
  console.log('Here goes the PING')
  res.send('PONG')
}) */

app.listen(PORT, () => {
  console.log(`Running on port ${PORT}`)
})
