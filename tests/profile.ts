import request from 'supertest'
import { app } from '../src'
import { TEST_USER, login } from './auth'
import { supabase } from '../src/db/db'


export const profileSuite = ()=>{
    describe("POST /profile/editDescription", ()=>{
        it("should edit the existing description and return 200", async ()=>{
            const login_resp = await login(TEST_USER)
            const token = login_resp.body.accessToken
            const edit_resp = await request(app).post('/profile/editDescription').set('Authorization', `Bearer ${token}`).send({
                newDescription: "edited_description"         
            })

            expect(edit_resp.status).toBe(200)

            const getprofile_resp = await request(app).get('/profile/current').set('Authorization', `Bearer ${token}`)
            expect(getprofile_resp.status).toBe(200)
            expect(getprofile_resp.body.description).toBe("edited_description")
        })
    })
}