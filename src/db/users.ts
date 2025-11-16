import jwt from "jsonwebtoken"
import { supabase } from './db'

export interface User{
    id: number, 
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

export async function addUser(user : User, profile : Profile){
    const userinfoInsertRes = await supabase?.from('userinfo').insert({
        username: user.username,
        password: user.password,
        email: user.email,
        fcm_token: "",
        created_on: new Date().toISOString()
    })
    console.log("Userinfo res", userinfoInsertRes)

    if (userinfoInsertRes?.status == 201){
        const userNewIdRes = await supabase?.from('userinfo').select('id_user').eq('username', user.username)
        const new_id = userNewIdRes?.data?.[0]?.id_user
        const profileInsertRes = await supabase?.from('profile').insert({
            name: profile.name,
            description: profile.description,
            pfp: profile.pfp,
            id_user: new_id,
        })

        console.log("userNewID res", userNewIdRes)
        console.log("profileInsert res", profileInsertRes)

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

export function generateRefreshToken(user : User){
    const user_info = {id : user.id}
    return jwt.sign(user_info, process.env.JWT_SECRET || '', { expiresIn: "7d" })
}

export function generateAccessToken(user : User){
    const user_info = {id : user.id}
    return jwt.sign(user_info, process.env.JWT_SECRET || '', { expiresIn: "15s" })
}