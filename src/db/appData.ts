import { supabase } from "./db";

export async function getLastStatsUpdateDate(){
    const res = await supabase?.from('app_data').select('last_stat_calc').eq('id', 1)
    return res
}

export async function setLastStatsUpdateDate(date : Date){
    const res = await supabase?.from('app_data').update({ last_stat_calc: date.toISOString() }).eq('id', 1)
    return res
}

