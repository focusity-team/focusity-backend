import { supabase } from "../src/db/db";
import { server } from "../src/index";
import { authSuite, TEST_USER } from "./auth";
import { profileSuite } from "./profile";
import { sessionSuite } from "./session";
import { subjectSuite } from "./subject";

describe('Full System Integration Flow', () => {


    afterAll(async ()=>{
	    const res_reset = await supabase.from('userinfo').delete().eq('username', TEST_USER.username);
	    server.close()
    })

    authSuite()
    sessionSuite()
    profileSuite()
    subjectSuite()
});