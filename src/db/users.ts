import jwt from "jsonwebtoken"
import { createClient, SupabaseClient } from '@supabase/supabase-js'

var supabase : SupabaseClient | null = null
export function connect(){
    const supabaseUrl = process.env.SUPABASE_URL ?? ''
    const supabaseKey : string = process.env.SUPABASE_KEY ?? ''
    supabase = createClient(supabaseUrl, supabaseKey)
}

export interface User{
    id: number, 
    username: string,
    password: string
}

export var users : User[] = []
export async function findUserByUsername(username : string){
    const res = await supabase?.from('users').select('*').eq('username', username)
    // return users.find((user)=> user.username == username)
    return res?.data?.[0]
}

export async function findUserById(id : number){
    const res = await supabase?.from('users').select('*').eq('id', id)
    // return users.find((user)=> user.username == username)
    return res?.data?.[0]
}

export async function addUser(user : User){
    return await supabase?.from('users').insert({
        username: user.username,
        password: user.password
    })
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