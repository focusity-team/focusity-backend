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
		const session_id = create_session_res.data[0].id_study_session
		return res.json({session_id})
	}
	
	return res.sendStatus(500)
})


const addSegmentSchema = z.object({
	id_session: z.number().int().positive(),
	id_topic: z.number().int().positive()
})

router.post('/addSegment', authenticateUser, async (req, res)=>{
	const userProfile = await getProfileFromRequest(req)
	if (!userProfile) return res.sendStatus(401)
		
	const validation = addSegmentSchema.safeParse(req.body)
	if (!validation.success) return res.status(400).json({error:z.treeifyError(validation.error)})
		
	const { id_session, id_topic } = validation.data


	const create_segment_res = await supabase?.from('session_segment').insert({
		id_study_session: id_session,
		id_profile: userProfile.id_profile,
		id_topic: id_topic
	}).select()
	
})


const createTopicSchema = z.object({
	id_subject: z.number().int().positive(),
	name: z.string().max(30)
})

router.post('/createTopic', authenticateUser, async (req, res) => {
	const userProfile = await getProfileFromRequest(req)
	if (!userProfile) return res.sendStatus(401)

		
	const validation = createTopicSchema.safeParse(req.body)
	if (!validation.success) return res.status(400).json({error: z.treeifyError(validation.error)})

	const {id_subject, name} = validation.data


	const create_topic_res = await supabase?.from('topic').insert({
		id_subject,
		name,
	}).select()

	if (!create_topic_res || create_topic_res.error) return res.status(500).json(create_topic_res?.error)
	else return res.status(200).json({id_topic: create_topic_res.data[0].id_topic})
	
})

const createSubjectSchema = z.object({
	name: z.string().max(30)
})

router.post('/createSubject', authenticateUser, async (req, res) => {
	const userProfile = await getProfileFromRequest(req)
	if (!userProfile) return res.sendStatus(401)

	console.log(req.body)
	const validation = createSubjectSchema.safeParse(req.body)
	if (!validation.success) return res.status(400).json({error: z.treeifyError(validation.error)})

	const { name } = validation.data


	const create_subject_res = await supabase?.from('subject').insert({
		name,
		id_profile: userProfile.id_profile
	}).select()
	
	if (!create_subject_res || create_subject_res.error) return res.status(500).json(create_subject_res?.error)
	else return res.status(200).json({id_subject: create_subject_res.data[0].id_subject})
})


router.get('/join/:session_id', (req, res)=>{
	const session_id = req.params.session_id
})