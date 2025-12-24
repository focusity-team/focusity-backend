import jwt from "jsonwebtoken"
import { supabase } from './db'
import {get as getUntype} from 'lodash'
import {Request} from 'express'

export interface User{
    id_user: number, 
    username: string,
    password: string,
    email: string    
}

export interface Profile {
    id_profile: number,
    description: string,
    name: string,
    pfp: number,
    id_user: number
}



export var users : User[] = []
export async function findUserByUsername(username : string){
    const { data, error } = await supabase.from('userinfo').select('*').eq('username', username)
    if (error) throw new Error(JSON.stringify(error))
        
    return data[0] 
}

export async function findUserById(id : number){
    const { data, error } = await supabase.from('userinfo').select('*').eq('id_user', id)
    if (error) throw new Error(JSON.stringify(error))
        
    return data[0]
}

export async function findProfileByUserId(id_user : number){
    const {error, data} = await supabase.from('profile').select('*').eq('id_user', id_user)
    if (error) throw new Error(JSON.stringify(error))
        
    return data[0] as Profile
}

export async function addUser(user : User, profile : Profile){
    const { data: userInfoData, error: userInfoError } = await supabase.from('userinfo').insert({
        username: user.username,
        password: user.password,
        email: user.email,
        fcm_token: "",
        created_on: new Date().toISOString()
    }).select()
    
    if (userInfoError) throw Error(JSON.stringify(userInfoError))
        
    const new_id = userInfoData[0].id_user
    const { data: profileData, error: profileError } = await supabase.from('profile').insert({
        name: profile.name,
        description: profile.description,
        pfp: profile.pfp,
        id_user: new_id,
    })
    
    
    if (profileError) throw Error(JSON.stringify(profileError))

    return true
}

export function getUsersArray(){
    return users
}

var refreshTokens : string[] = []
export function addRefreshToken(token : string){
    if (!refreshTokens.includes(token)) refreshTokens.push(token)
    }

export function removeRefreshToken(token : String){
    refreshTokens = refreshTokens.filter((t)=> t !== token)
}

export function isRefreshTokenPresent(token : string){
    return refreshTokens.includes(token)
}

export function getRefreshTokens(){
    return refreshTokens
}

export function clearRefreshTokens(){
    refreshTokens = []
}

export function generateRefreshToken(user : User){
    const user_info = {id_user : user.id_user}
    return jwt.sign(user_info, process.env.JWT_SECRET || '', { expiresIn: "7d" })
}

export function generateAccessToken(user : User){
    const user_info = {id_user : user.id_user}
    return jwt.sign(user_info, process.env.JWT_SECRET || '', { expiresIn: "15s" })
}

export async function getProfileFromRequest(req : Request){
    const curr_user_id = getUntype(req, "id_user")
    if (!curr_user_id) return undefined
    
    const user_profile = await findProfileByUserId(curr_user_id)
    
    return user_profile as Profile
}



export async function getTodaysStudyHours(id_profile : number){
    const date_start = new Date()
    date_start.setHours(0, 0, 0, 0)
    const date_end = new Date()
    date_end.setHours(23, 59, 59, 0)
    
    const res = await supabase?.from('study_session').select('*').eq('id_profile', id_profile).gt('start_date_time', date_start.toISOString()).lt('end_date_time', date_end.toISOString())
    if (!res?.data) return undefined
    
    var totalSeconds = 0
    if (res.data.length){
        for (let i = 0; i < res.data.length; i++){
            totalSeconds += res.data[i].study_time
        }
    }
    
    return Math.round((totalSeconds / 3600) * 100) / 100
}