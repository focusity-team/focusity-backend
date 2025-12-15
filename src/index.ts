import express, { Application } from 'express'
import { router as AuthRouter, authenticateUser } from './routes/auth'
import { router as ProfileRouter  } from './routes/profile'
import { router as SubjectsRouter  } from './routes/subjects'

import { connect as ConnectSupabase, connect} from './db/db'
import { getUsersArray } from './db/users'

import { ServerSetup } from './appFuncs/setup'
import {router as SessionRouter} from './routes/session'

if (process.env.NODE_ENV !== 'production') { 
    const dotenv = require('dotenv')
    dotenv.config()
}

export const app : Application = express()
const port : number = 8080

ConnectSupabase()

// ServerSetup()

app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use('/auth', AuthRouter)
app.use('/profile', ProfileRouter)
app.use('/session', SessionRouter)
app.use('/subjects', SubjectsRouter)

app.get('/', authenticateUser, (req, res)=>{
    res.send("Logged In")
})

app.get('/users', (req, res)=>{
    res.send(getUsersArray())
})

export const server = app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}, ${process.env.JWT_SECRET}`)
})