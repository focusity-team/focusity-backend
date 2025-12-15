import { Router, Request, Response, NextFunction } from 'express'
import { authenticateUser } from './auth'
import { get as getUntype } from 'lodash'
import { supabase } from '../db/db'
import { findProfileByUserId, findUserById } from '../db/users'

export const router = Router()
router.post('/create', authenticateUser, async (req, res)=>{
    const curr_user_id = getUntype(req, "id_user")
    if (curr_user_id){

        const user_profile = await findProfileByUserId(curr_user_id)
        console.log(user_profile);
        
        if (user_profile){
            const session_title = req.body.title;
            const create_session_res = await supabase?.from('study_session').insert({
                title: session_title,
                id_profile: user_profile.id_profile,
                study_time: 0,
                start_date_time: new Date().toISOString(),
                end_date_time: null
            }).select()

            console.log(create_session_res)

            if (create_session_res?.data){
                const session_id = create_session_res.data[0].id_study_session
                return res.json({session_id})
            }

        }
        
    } 

    return res.sendStatus(500)
})

router.get('/join/:session_id', (req, res)=>{
    const session_id = req.params.session_id
})