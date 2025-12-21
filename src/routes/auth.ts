import { Router, Request, Response, NextFunction } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import lodash from 'lodash'

import { Profile, addUser, User, findUserByUsername, findUserById,  } from '../db/users'
import { removeRefreshToken, addRefreshToken, isRefreshTokenPresent, generateRefreshToken, generateAccessToken} from '../db/users'

export const router = Router()
router.post("/login", async (req, res) => {
    const { username, password } = req.body
    const user = await findUserByUsername(username)
    // console.log(`Login Attempt: Username ${username}; Password ${password}; Userobj ${user}`)

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
    // console.log(`New Token Requested`)

	const refreshToken = req.body.refreshToken
    if (!refreshToken || !isRefreshTokenPresent(refreshToken)) return res.status(401).send()

    jwt.verify(refreshToken, process.env.JWT_SECRET || '', async (err : any, user_info : any)=> {
        const user = await findUserById(user_info.id_user)
        // console.log("jwt data", user_info, "db data", user)
        if (err || !user) return res.status(401).send()

        res.json({accessToken : generateAccessToken(user)})
    })
})

router.post('/register', async (req, res) => {
	try {
		let hashed_password = await bcrypt.hash(req.body.password, 10)
        const user: User = {
            id_user: 0,
			username: req.body.username,
			password: hashed_password,
            email: req.body.email
        }
        const profile: Profile = {
            id: 0,
            name: req.body.name,
            description: req.body.description,
            pfp: req.body.pfp,
            id_user: 0,
        }
        const success = await addUser(user, profile)

        if (success){
		    res.status(200).send()
        }
        else {
            res.status(500).send()
        }
	} catch {
		res.status(500).send()
	}
})

router.delete('/logout', (req, res)=>{
	console.log(req.body)
	if (req.body && req.body.refreshToken){
		removeRefreshToken(req.body.refreshToken)
		res.sendStatus(200)
	}

    else return res.sendStatus(401)
})

export function authenticateUser(req : Request, res : Response, next : NextFunction){
    const authHeader = req.headers.authorization
    const token = authHeader?.split(" ")[1]
    if (!token) return res.status(401).send()
        
    jwt.verify(token, process.env.JWT_SECRET ?? '', (err, user : any)=>{
        if (err) return res.status(401).send()
        lodash.set(req, "id_user", user.id_user)
        next()
    })
}


