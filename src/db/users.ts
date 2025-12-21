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
    id: number,
    description: string,
    name: string,
    pfp: number,
    id_user: number
}



export var users : User[] = []
export async function findUserByUsername(username : string){
    const res = await supabase?.from('userinfo').select('*').eq('username', username)
    // return users.find((user)=> user.username == username)
    return res?.data?.[0]
}

export async function findUserById(id : number){
    const res = await supabase?.from('userinfo').select('*').eq('id_user', id)
    // return users.find((user)=> user.username == username)
    return res?.data?.[0]
}

export async function findProfileByUserId(id_user : number){
    const res = await supabase?.from('profile').select('*').eq('id_user', id_user)
    // return users.find((user)=> user.username == username)
    return res?.data?.[0]
}

export async function addUser(user : User, profile : Profile){
    const userinfoInsertRes = await supabase?.from('userinfo').insert({
        username: user.username,
        password: user.password,
        email: user.email,
        fcm_token: "",
        created_on: new Date().toISOString()
    })
    // console.log("Userinfo res", userinfoInsertRes)

    if (userinfoInsertRes?.status == 201){
        const userNewIdRes = await supabase?.from('userinfo').select('id_user').eq('username', user.username)
        const new_id = userNewIdRes?.data?.[0]?.id_user
        const profileInsertRes = await supabase?.from('profile').insert({
            name: profile.name,
            description: profile.description,
            pfp: profile.pfp,
            id_user: new_id,
        })

        // console.log("userNewID res", userNewIdRes)
        // console.log("profileInsert res", profileInsertRes)

        return profileInsertRes?.error == null
    }
    else{
        return false
    }
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

    return user_profile
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