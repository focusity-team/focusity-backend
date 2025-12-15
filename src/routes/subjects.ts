import { Router } from 'express'
import { getSubjectsNames } from '../db/globalData'


export const router = Router()
router.get('/', async (req, res)=>{
    const data =await getSubjectsNames(); 
    if (!data) return res.sendStatus(500)
    
	res.json(data)
})