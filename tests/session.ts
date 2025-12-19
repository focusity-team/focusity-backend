import { supabase } from "../src/db/db";
import request from "supertest";
import { login, register, TEST_USER} from "./auth";
import { app } from '../src/index'


async function createSubject(name : string){
    const login_resp = await login(TEST_USER)
    const token = login_resp.body.accessToken
    
    return await request(app).post('/session/createSubject').set('Authorization', `Bearer ${token}`).send({
        name
    })
}

async function createTopic(name : string, id_subject: number){
    const login_resp = await login(TEST_USER)
    const token = login_resp.body.accessToken
    
    return await request(app).post('/session/createTopic').set('Authorization', `Bearer ${token}`).send({
        name,
        id_subject
    })
}

export const sessionSuite = ()=>{
    describe("Session flow", ()=>{
        
        describe("POST /session/create", ()=>{
            it("should create a new session for the client and return the new session's id", async () => {
                const login_resp = await login(TEST_USER)
                
                const token = login_resp.body.accessToken
                
                const create_session_resp = await request(app).post('/session/create').set('Authorization', `Bearer ${token}`).send({
                    title: "test_title"
                })
                
                expect(create_session_resp.status).toBe(200) 
                expect(create_session_resp.body).toHaveProperty("session_id")
                
            })
        })
        
        
        describe("POST /session/createTopic && POST session/createSubject", ()=>{

            it("should create a new subject and return its id with status 200", async ()=>{
                const create_subject_resp = await createSubject("italiano")

                expect(create_subject_resp.status).toBe(200)
                expect(create_subject_resp.body).toHaveProperty("id_subject")
            })
            
            it("should create a new topic and return its id with status 200", async ()=>{                
                const create_subject_resp = await createSubject("matematica")
                const create_topic_resp = await createTopic("integrali quadrupli", create_subject_resp.body.id_subject)

                expect(create_topic_resp.status).toBe(200)
                expect(create_topic_resp.body).toHaveProperty("id_topic")
            })
        })
        
    })
}