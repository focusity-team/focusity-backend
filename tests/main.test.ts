import { supabase } from "../src/db/db";
import { server } from "../src/index";
import { authSuite } from "./auth";
import { sessionSuite } from "./session";
import { subjectSuite } from "./subject";

describe('Full System Integration Flow', () => {
    afterAll(async ()=>{
	    const res_reset = await supabase?.from('userinfo').delete().neq('id_user', 0);
	    server.close()
    })

    authSuite()
    subjectSuite()
    sessionSuite()
});