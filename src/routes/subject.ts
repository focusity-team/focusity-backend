import { Router } from 'express'
import { getSubjectsNames } from '../db/globalData'
import { z } from 'zod'
import { authenticateUser } from './auth'
import { getProfileFromRequest, Profile } from '../db/users'
import { supabase } from '../db/db'
import logger from '../appFuncs/logger'

export const router = Router()


export async function isSubjectOwner(profile : Profile, id_subject: number){
    const {data, error} = await supabase.from("subject").select("id_subject").eq("id_profile", profile.id_profile).eq("id_subject", id_subject)

    return !(error || data.length == 0)
}

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

const getTopicsSchema = z.object({
    id_subject: z.coerce.number().int().positive(),
})

router.get('/getTopicsFromSubject/:id_subject', authenticateUser, async (req, res)=>{
    const userProfile = await getProfileFromRequest(req)
    if (!userProfile) return res.sendStatus(401)

    const validation = getTopicsSchema.safeParse(req.params)
	if (!validation.success) return res.status(400).json({error: z.treeifyError(validation.error)})

    const {id_subject} = validation.data


    if (!isSubjectOwner(userProfile, id_subject)) return res.sendStatus(401)
    
    logger.debug("Get Topics for subject: ", id_subject)

    const {data, error} = await supabase.from("topic").select("*").eq("id_subject", id_subject)

    if (error) return res.sendStatus(400)
    
    return res.status(200).json({
        topics: data
    })
})