import request from 'supertest'
import { app } from '../src'
import { TEST_USER, authenticatedRequest, login } from './auth'
import { supabase } from '../src/db/db'
import { isSubjectOwner } from '../src/routes/subject'
import { findProfileByUserId, Profile } from '../src/db/users'

export async function createSubject(name : string){
    return await authenticatedRequest(TEST_USER, "post", "/subjects/add", {
        name
    })
}

export async function createTopic(name : string, id_subject: number){
    return await authenticatedRequest(TEST_USER, "post", "/subjects/addTopic", {
        name,
        id_subject
    })
}

export const subjectSuite = ()=>{
    describe("Subject flow", ()=>{
       describe("POST /subjects/add && POST /subjects/addTopic", ()=>{
            
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


        describe("POST /subjects/edit edit_name", ()=>{
            it("should edit the subject and return 200", async ()=>{
                const create_subject_res = await createSubject("pirupiru")

                const edit_resp = await authenticatedRequest(TEST_USER, "post", "/subjects/edit", {
                    id_subject: create_subject_res.body.id_subject,
                    name: "pirupiru_editato"
                })

                expect(edit_resp.status).toBe(200)

                const {data, error} = await supabase.from('subject').select().eq('id_subject', create_subject_res.body.id_subject)
                expect(error).toBeNull()
                expect(data![0].name).toBe("pirupiru_editato")

            })
        })

        describe("POST /subjects/editTopic edit_name", ()=>{
            it("should edit the topic and return 200", async ()=>{
                const create_subject_res = await createSubject("filosofia")
                const create_topic_res = await createTopic("marx", create_subject_res.body.id_subject)


                const edit_resp = await authenticatedRequest(TEST_USER, "post", "/subjects/editTopic", {
                    id_topic: create_topic_res.body.id_topic,
                    name: "pirupiru_editato"
                })

                expect(edit_resp.status).toBe(200)

                const read_supa = await supabase?.from('topic').select().eq('id_topic', create_topic_res.body.id_topic)
                expect(read_supa?.error).toBeNull()
                expect(read_supa?.data?.[0].name).toBe("pirupiru_editato")

            })
        })


        describe("GET /subjects/getTopicsFromSubject", ()=>{
            it("should return an array of topics and status code 200", async ()=>{
                const {body: {id_subject}} = await createSubject("greco3")
                const topic1 = await createTopic("greco3 topic 1", id_subject)
                const topic2 = await createTopic("greco3 topic 2", id_subject)

                const get_topics_resp = await authenticatedRequest(TEST_USER, "get", `/subjects/getTopicsFromSubject/${id_subject}`)
                
                expect(get_topics_resp.status).toBe(200)
                expect(get_topics_resp.body).toHaveProperty("topics")
                expect(get_topics_resp.body.topics).toBeInstanceOf(Array)
                expect(get_topics_resp.body.topics).toHaveLength(2)


            })
            
            it("should return 401/400 if subject is not owned by user or doesn't exist", async ()=>{
                const get_topics_resp = await authenticatedRequest(TEST_USER, "get", `/subjects/getTopicsFromSubject/18237918237`)

                expect(get_topics_resp.status).not.toBe(200)
            })
        })
        
    })
}