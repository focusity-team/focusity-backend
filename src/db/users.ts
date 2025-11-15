import jwt from "jsonwebtoken"

export interface User{
    id: number, 
    username: string,
    password: string
}

export var users : User[] = []
export function findUserByUsername(username : string){
    return users.find((user)=> user.username == username)
}
export function findUserById(id : number){
    return users.find((user)=> user.id == id)
}
export function addUser(user : User){
    users.push(user)
}
export function getNewUserId(){
    return users.length
}
export function getUsersArray(){
    return users
}

var refreshTokens : string[] = []
export function addRefreshToken(token : string){
    if (!refreshTokens.includes(token)) refreshTokens.push(token)
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