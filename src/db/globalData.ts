import { supabase } from "./db";




export async function getSubjectsNames(){
    const res = await supabase?.from('subject').select('*')
    return res?.data
}

