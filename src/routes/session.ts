import { Router, Request, Response, NextFunction } from 'express'
import { authenticateUser } from './auth'
import { create, get as getUntype } from 'lodash'
import { supabase } from '../db/db'
import { findProfileByUserId, findUserById, getProfileFromRequest } from '../db/users'
import { z } from 'zod'

export const router = Router()
router.post('/create', authenticateUser, async (req, res)=>{
	const curr_user_id = getUntype(req, "id_user")
	if (!curr_user_id) return res.status(401).json({ error: "No user ID" });
	
	const user_profile = await findProfileByUserId(curr_user_id)
	if (!user_profile) return res.status(404).json({ error: "Profile not found" });
	
	const session_title = req.body.title;
	const create_session_res = await supabase?.from('study_session').insert({
		title: session_title,
		id_profile: user_profile.id_profile,
		study_time: 0,
		start_date_time: new Date().toISOString(),
		end_date_time: null
	}).select()
	
	if (create_session_res?.error) {
		console.log(create_session_res.error)
	}
	
	if (create_session_res?.data && create_session_res.data.length > 0){
		const id_session = create_session_res.data[0].id_study_session
		return res.status(200).json({id_session})
	}
	
	return res.sendStatus(500)
})


const addSegmentSchema = z.object({
	id_session: z.number().int().positive(),
	id_topic: z.number().int().positive()
})

router.post('/createSegment', authenticateUser, async (req, res)=>{
	const userProfile = await getProfileFromRequest(req)
	if (!userProfile) return res.sendStatus(401)
		
	console.log("segment body", req.body)
	const validation = addSegmentSchema.safeParse(req.body)
	if (!validation.success) return res.status(400).json({error:z.treeifyError(validation.error)})
		
	const { id_session, id_topic } = validation.data


	const create_segment_res = await supabase?.from('session_segment').insert({
		id_study_session: id_session,
		id_profile: userProfile.id_profile,
		id_topic: id_topic
	}).select()
	
	if (create_segment_res && !create_segment_res.error){
		return res.status(200).json({
			id_session_segment: create_segment_res.data[0].id_session_segment
		})
	}

	res.sendStatus(500)
	
})





router.get('/join/:session_id', (req, res)=>{
	const session_id = req.params.session_id
})