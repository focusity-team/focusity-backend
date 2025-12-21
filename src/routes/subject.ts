import { Router } from 'express'
import { getSubjectsNames } from '../db/globalData'
import { z } from 'zod'
import { authenticateUser } from './auth'
import { getProfileFromRequest } from '../db/users'
import { supabase } from '../db/db'

export const router = Router()


const createSubjectSchema = z.object({
	name: z.string().max(30)
})

router.post('/add', authenticateUser, async (req, res) => {
	const userProfile = await getProfileFromRequest(req)
	if (!userProfile) return res.sendStatus(401)

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

const editSubjectSchema = z.object({
    remove: z.boolean().default(false),
    id_subject: z.number().int().positive(),
	name: z.string().max(30)
})

router.post('/edit', authenticateUser, async (req, res)=>{
    const userProfile = await getProfileFromRequest(req)
	if (!userProfile) return res.sendStatus(401)

    const validation = editSubjectSchema.safeParse(req.body)
	if (!validation.success) return res.status(400).json({error: z.treeifyError(validation.error)})

    const { id_subject, remove, name } = validation.data
    
    var err = null
    if (remove) {
        const {data, error} = await supabase!.from('subject').delete().eq('id_subject', id_subject)
        err = error

    } else {
        const {data, error} = await supabase!.from('subject').update({
            name
        }).eq('id_subject', id_subject)
        err = error
    }

    if (err) return res.sendStatus(500)
    return res.sendStatus(200)
})


const createTopicSchema = z.object({
    id_subject: z.number().int().positive(),
    name: z.string().max(30)
})

router.post('/addTopic', authenticateUser, async (req, res) => {
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

const editTopicSchema = z.object({
    remove: z.boolean().default(false),
    id_topic: z.number().int().positive(),
	name: z.string().max(30)
})

router.post('/editTopic', authenticateUser, async (req, res)=>{
    const userProfile = await getProfileFromRequest(req)
	if (!userProfile) return res.sendStatus(401)

    const validation = editTopicSchema.safeParse(req.body)
	if (!validation.success) return res.status(400).json({error: z.treeifyError(validation.error)})

    const { id_topic, remove, name } = validation.data

    var err = null
    if (remove) {
        const {data, error} = await supabase!.from('topic').delete().eq('id_topic', id_topic)
        err = error
    } else {
        const {data, error} = await supabase!.from('topic').update({
            name
        }).eq('id_topic', id_topic)
        err = error
    }


    if (err) return res.sendStatus(500)
    return res.sendStatus(200)
})