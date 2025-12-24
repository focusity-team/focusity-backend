import request, {Response} from 'supertest'
import { app, server } from '../src/index'
import { getRefreshTokens, clearRefreshTokens } from '../src/db/users'
import { supabase } from '../src/db/db'

export const TEST_USER = 
{
	"username": "aaabbb",
	"password": "@A123456",
	"description": "Descrizione del fantasma di gario",
	"pfp": 10,
	"name": "aaa",
	"email": "aaa@gmail.com",
	"accessToken": null,
	"refreshToken": null
}

export const authenticatedRequest = async (
	user : typeof TEST_USER,
	method: 'get' | 'post' | 'put' | 'delete',
	url: string,
	data: object = {}
) => {
	const sendRequest = (token: string) => {
		const req = request(app)[method](url).set('Authorization', `Bearer ${token}`);
		return method === 'get' ? req : req.send(data);
	};
	
	if (!user.accessToken || !user.refreshToken) await login(user)
	
	let res = await sendRequest(user.accessToken!);
	
	// Check if server returned 401 with the specific expiration message
	if (res.status === 401 && res.body.error === 'invalid access code') {
		
		// 1. Request a new token
		const refreshRes = await request(app)
		.post('/auth/token')
		.send({ refreshToken: user.refreshToken });
		
		if (refreshRes.status === 200) {
			user.accessToken = refreshRes.body.accessToken;
			
			// 2. Retry the original request with the new token
			res = await sendRequest(user.accessToken!);
		} else {
			throw new Error('Refresh token expired or invalid. Manual login required.');
		}
	}
	
	return res;
};


export async function login(user: typeof TEST_USER){
	const resp = await request(app).post("/auth/login").send({
		"username": user.username,
		"password": user.password
	})
	user.accessToken = resp.body.accessToken
	user.refreshToken = resp.body.refreshToken
	
	return resp
}

export async function getNewAccessToken(refreshToken : string){
	return await request(app).post("/auth/token").send({
		"refreshToken": refreshToken
	})
}

export async function register(user: typeof TEST_USER){
	return await request(app).post("/auth/register").send(user)
}

export const authSuite = () => {
	
	describe("Auth flow", ()=>{
		
		describe('POST /auth/register', ()=>{
			it('should create the user and return 200', async ()=>{
				const reg_res = await register(TEST_USER)
				expect(reg_res.status).toBe(200)
			})
		})
		
		describe('POST /auth/login', ()=>{
			it('should return status code 200 with accessToken and refreshToken', async ()=>{
				const res = await login(TEST_USER)
				
				expect(res.status).toBe(200)
				expect(res.body).toHaveProperty("accessToken")
				expect(res.body).toHaveProperty("refreshToken")
			})
			
			it('should return status code 401 if incorrect username or password', async ()=>{
				const res = await login({...TEST_USER, password: "sdfklmnbvcx"})
				expect(res.status).toBe(401)
			})
			
		})
		
		describe("DELETE /auth/logout", ()=>{
			it("should return 200 and remove refreshToken", async ()=>{
				clearRefreshTokens()	
				const res = await login(TEST_USER)
				
				
				expect(res.body.refreshToken).toBeDefined()
				const token = res.body.refreshToken
				
				expect(getRefreshTokens()).toContain(token)
				
				const logout_res = await request(app).post("/auth/logout").send({
					"refreshToken": token
				})
				
				
				expect(logout_res.status).toBe(200)
				expect(getRefreshTokens()).not.toContain(token)	
				
			})
		})
		
		
		describe("POST /auth/token", ()=>{
			it("should return new accessToken if logged in", async ()=>{
				const login_res = await login(TEST_USER)
				const token_res = await	getNewAccessToken(login_res.body.refreshToken)
				expect(token_res.body.accessToken).toBeDefined()
				
			})
			
			it("should return new 401 if not logged in", async ()=>{
				const token_res = await	getNewAccessToken("")
				expect(token_res.status).toBe(401)
				expect(token_res.body.accessToken).toBeUndefined()
				
			})
			
		})
		
	})
}