import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import lodash from 'lodash'

import { addUser, User, findUserByUsername, findUserById,  } from '../db/users'
import { removeRefreshToken, addRefreshToken, isRefreshTokenPresent, generateRefreshToken, generateAccessToken} from '../db/users'

export const router = Router()
router.post("/login", async (req, res) => {
    const { username, password } = req.body
    const user = await findUserByUsername(username)
    if (!user) return res.status(401).send()
    
    if (await bcrypt.compare(password, user.password)){
        const newRefreshToken = generateRefreshToken(user)
        addRefreshToken(newRefreshToken)

        const newAccessToken = generateAccessToken(user)
        return res.status(200).json({ accessToken: newAccessToken, refreshToken: newRefreshToken })
    }
    
    res.status(401).send()
})

router.post('/token', (req, res)=>{
	const refreshToken = req.body.refreshToken
    if (!refreshToken || !isRefreshTokenPresent(refreshToken)) return res.status(401).send()

    jwt.verify(refreshToken, process.env.JWT_SECRET || '', async (err : any, user_info : any)=> {
        const user = await findUserById(user_info.id)
        if (err || !user) return res.status(401).send()

        res.json({accessToken : generateAccessToken(user)})
    })
})

router.post('/register', async (req, res) => {
	try {
		let hashed_password = await bcrypt.hash(req.body.password, 10)
        const user : User = {
            id: 0,
			username: req.body.username,
			password: hashed_password
        }
        const data = await addUser(user)
        if (data?.status == 201){
		    res.status(200).send()
        }
        else {
            res.status(500)
        }
	} catch {
		res.status(500).send()
	}
})

router.delete('/logout', (req, res)=>{
	const token = req.body.refreshToken	
    removeRefreshToken(token)
    res.sendStatus(200)
})

export function authenticateUser(req : Request, res : Response, next : NextFunction){
    const authHeader = req.headers.authorization
    const token = authHeader?.split(" ")[1]
    if (!token) return res.status(401).send()
        
    jwt.verify(token, process.env.JWT_SECRET ?? '', (err, user)=>{
        if (err) return res.status(401).send()
            lodash.set(req, "user_info", user)
        next()
    })
}
