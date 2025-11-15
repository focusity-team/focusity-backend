import express, { Application } from 'express'
import { router as AuthRouter, authenticateUser } from './routes/auth'

import {getUsersArray} from './db/users'

if (process.env.NODE_ENV !== 'production') { 
    const dotenv = require('dotenv')
    dotenv.config()
}

const app : Application = express()
const port : number = 8080


app.use(express.urlencoded({extended: false}))
app.use(express.json())

app.use('/auth', AuthRouter)

app.get('/', authenticateUser, (req, res)=>{
    res.send("Logged In")
})

app.get('/users', (req, res)=>{
    res.send(getUsersArray())
})

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}, ${process.env.JWT_SECRET}`)
})

