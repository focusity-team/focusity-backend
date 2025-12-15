import { Router, Request, Response, NextFunction } from 'express'
import { authenticateUser } from './auth'
import { findProfileByUserId, findUserById, findUserByUsername, getTodaysStudyHours } from '../db/users'
import { get as getUntype } from 'lodash'

export const router = Router()
router.get("/current", authenticateUser, async (req, res)=>{
    const curr_id = getUntype(req, "id_user")
    if (curr_id){
        const findProfileRes = await findProfileByUserId(curr_id)
        console.log("Current Profile Req: ", findProfileRes)
        if (findProfileRes){
            res.json({
                name: findProfileRes.name, 
                description: findProfileRes.description,
                pfp: findProfileRes.pfp
                //username
                //stats 
                // - ore di oggi di studio
                // - daily average ore
                // - badge
                //friends
            })
        }
        else{
            res.sendStatus(404)
        }
    }
    else {
        res.sendStatus(401)
    }
})


router.get("/test", async (req, res)=>{
    res.json(await getTodaysStudyHours(3))
})