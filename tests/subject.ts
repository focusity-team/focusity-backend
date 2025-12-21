import request from 'supertest'
import { app } from '../src'
import { TEST_USER, login } from './auth'
import { supabase } from '../src/db/db'

export async function createSubject(name : string){
    const login_resp = await login(TEST_USER)
    const token = login_resp.body.accessToken
    
    return await request(app).post('/subject/add').set('Authorization', `Bearer ${token}`).send({
        name
    })
}

export async function createTopic(name : string, id_subject: number){
    const login_resp = await login(TEST_USER)
    const token = login_resp.body.accessToken
    
    return await request(app).post('/subject/addTopic').set('Authorization', `Bearer ${token}`).send({
        name,
        id_subject
    })
}

export const subjectSuite = ()=>{
    describe("Subject flow", ()=>{
       describe("POST /subject/add && POST /subject/addTopic", ()=>{
            
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
                
                const create_topic2_resp = await createTopic("serie", create_subject_resp.body.id_subject)
                expect(create_topic2_resp.status).toBe(200)
                expect(create_topic2_resp.body).toHaveProperty("id_topic")
                
            })
        })


        describe("POST /subject/edit edit_name", ()=>{
            it("should edit the subject and return 200", async ()=>{
                const create_subject_res = await createSubject("pirupiru")

                const login_resp = await login(TEST_USER)
                const edit_resp = await request(app).post("/subject/edit").set('Authorization', `Bearer ${login_resp.body.accessToken}`).send({
                    id_subject: create_subject_res.body.id_subject,
                    name: "pirupiru_editato"
                })

                expect(edit_resp.status).toBe(200)

                const read_supa = await supabase?.from('subject').select().eq('id_subject', create_subject_res.body.id_subject)
                expect(read_supa?.error).toBeNull()
                expect(read_supa?.data?.[0].name).toBe("pirupiru_editato")

            })
        })

        describe("POST /subject/editTopic edit_name", ()=>{
            it("should edit the topic and return 200", async ()=>{
                const create_subject_res = await createSubject("filosofia")
                const create_topic_res = await createTopic("marx", create_subject_res.body.id_subject)

                const login_resp = await login(TEST_USER)
                const edit_resp = await request(app).post("/subject/editTopic").set('Authorization', `Bearer ${login_resp.body.accessToken}`).send({
                    id_topic: create_topic_res.body.id_topic,
                    name: "pirupiru_editato"
                })

                expect(edit_resp.status).toBe(200)

                const read_supa = await supabase?.from('topic').select().eq('id_topic', create_topic_res.body.id_topic)
                expect(read_supa?.error).toBeNull()
                expect(read_supa?.data?.[0].name).toBe("pirupiru_editato")

            })
        })
        
    })
}