import request from 'supertest'
import { app, server } from '../src/index'
import { getRefreshTokens, clearRefreshTokens } from '../src/db/users'

afterAll(()=>{
	server.close()
})

async function login(username: string, password : string){
	return await request(app).post("/auth/login").send({
		"username": username,
		"password": password
	})
}

async function getNewAccessToken(refreshToken : string){
	return await request(app).post("/auth/token").send({
		"refreshToken": refreshToken
	})
}

describe('POST /auth/login', ()=>{
	it('should return status code 200 with accessToken and refreshToken', async ()=>{
		const res = await login("aaa", "@A123456")

		expect(res.status).toBe(200)
		expect(res.body).toHaveProperty("accessToken")
		expect(res.body).toHaveProperty("refreshToken")
	})

	it('should return status code 401 if incorrect username or password', async ()=>{
		const res = await login("aaa", "@A126")
		expect(res.status).toBe(401)
	})

})


describe("DELETE /auth/logout", ()=>{
	it("should return 200 and remove refreshToken", async ()=>{
		clearRefreshTokens()	
		const res = await login("aaa", "@A123456")
		

		expect(res.body.refreshToken).toBeDefined()
		const token = res.body.refreshToken

		expect(getRefreshTokens()).toContain(token)

		const logout_res = await request(app).delete("/auth/logout").send({
			"refreshToken": token
		})


		expect(logout_res.status).toBe(200)
		expect(getRefreshTokens()).not.toContain(token)	
		
	})
})

describe("DELETE /auth/logout", ()=>{
	it("should return 200 and remove refreshToken", async ()=>{
		clearRefreshTokens()	
		const res = await login("aaa", "@A123456")
		

		expect(res.body.refreshToken).toBeDefined()
		const token = res.body.refreshToken

		expect(getRefreshTokens()).toContain(token)

		const logout_res = await request(app).delete("/auth/logout").send({
			"refreshToken": token
		})


		expect(logout_res.status).toBe(200)
		expect(getRefreshTokens()).not.toContain(token)	
		
	})
})


describe("POST /auth/token", ()=>{
	it("should return new accessToken if logged in", async ()=>{
		const login_res = await login("aaa", "@A123456")
		const token_res = await	getNewAccessToken(login_res.body.refreshToken)
		expect(token_res.body.accessToken).toBeDefined()
		
	})
	
	it("should return new 401 if not logged in", async ()=>{
		const token_res = await	getNewAccessToken("")
		expect(token_res.status).toBe(401)
		expect(token_res.body.accessToken).toBeUndefined()
		
	})

})