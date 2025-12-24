import { supabase } from "../src/db/db";
import request from "supertest";
import { authenticatedRequest, login, register, TEST_USER} from "./auth";
import { app } from '../src/index'
import { createSubject, createTopic } from "./subject";


async function createSession(title: string){
    return await authenticatedRequest(TEST_USER, "post", "/session/create", {
        title
    })
}

async function createSegment(id_session: number, id_topic : number){
    return await authenticatedRequest(TEST_USER, "post", "/session/createSegment", {
        id_topic,
        id_session
    })
}

export const sessionSuite = ()=>{
    describe("Session flow", ()=>{
        
        describe("POST /session/create", ()=>{
            it("should create a new session for the client and return the new session's id", async () => {
                
                const create_session_resp = await createSession("test_title")
                
                expect(create_session_resp.status).toBe(200) 
                expect(create_session_resp.body).toHaveProperty("id_session")
                
                const create_session2_resp = await createSession("test_title2")
                
                expect(create_session2_resp.status).toBe(200) 
                expect(create_session2_resp.body).toHaveProperty("id_session")
            })
        })
        
        
        
        
        
        describe("POST /session/createSegment", ()=>{
            it("should create a segment and return its id with status 200", async ()=>{
                const create_subject_resp = await createSubject("italiano")
                const create_topic_resp = await createTopic("integrali quadrupli", create_subject_resp.body.id_subject)
                
                const create_session_resp = await createSession("studio serale del 19/12")
                
                const create_segment_resp = await createSegment(create_session_resp.body.id_session, create_topic_resp.body.id_topic)
                
                expect(create_segment_resp.status).toBe(200)
                expect(create_segment_resp.body).toHaveProperty("id_session_segment")
            })
        })
        
    })
}