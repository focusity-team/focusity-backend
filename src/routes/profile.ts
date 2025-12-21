import { Router, Request, Response, NextFunction } from 'express'
import { authenticateUser } from './auth'
import { findProfileByUserId, findUserById, findUserByUsername, getTodaysStudyHours } from '../db/users'
import { get as getUntype } from 'lodash'
import logger from '../appFuncs/logger'
import {z} from 'zod'
import { supabase } from '../db/db'

export const router = Router()
router.get("/current", authenticateUser, async (req, res)=>{
    try{
        const curr_id = getUntype(req, "id_user")
        if (curr_id){
            const profile = await findProfileByUserId(curr_id)
            const user = await findUserById(curr_id)
            logger.debug(`current profile req: ${JSON.stringify(profile)}`)
            
            if (profile && user){
                res.json({
                    name: profile.name, 
                    description: profile.description,
                    pfp: profile.pfp,
                    username: user.username
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
    }
    catch(err){
        return res.sendStatus(500)
    }
    
})

const editDescriptionSchema = z.object({
    newDescription: z.string().max(100)
})

router.post("/editDescription", authenticateUser, async (req, res)  => {
    try {
        const validation = editDescriptionSchema.safeParse(req.body) 
        if (!validation.success) return res.sendStatus(400)
            
        const {newDescription} = validation.data
        const curr_id = getUntype(req, "id_user")
        
        const {error, data} = await supabase.from("profile").update({
            description: newDescription
        }).eq("id_user", curr_id)
        
        if (error) return res.sendStatus(500)

        return res.sendStatus(200)
    }
    catch(err){
        return res.sendStatus(500)
    }
})

router.get("/test", async (req, res)=>{
    res.json(await getTodaysStudyHours(3))
})