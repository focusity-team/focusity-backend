import { setLastStatsUpdateDate } from "../db/appData";
import { supabase } from "../db/db"

interface SessionStatInfo{
    id_profile: number,
    study_time: number,
    start_date_time: string,
}

interface Stats {
    id_stats: number,
    day_streak: number,
    daily_average: number,
    id_profile: number
}

interface ProfileID{
    id_profile: number
}

async function getAllUsers() : Promise<ProfileID[]>{
    const res_profile = await supabase?.from('profile').select("id_profile")
    return (res_profile?.data as ProfileID[] | null ) ?? []
}

async function getAllSessions() : Promise<SessionStatInfo[]>{
    const res_sessions = await supabase?.from('study_session').select("id_profile, study_time, start_date_time").order("start_date_time", { ascending: true })
    return (res_sessions?.data as SessionStatInfo[] | null) ?? []
}

async function getAllStats() : Promise<Stats[]>{
    const res_sessions = await supabase?.from('stats').select("id_profile, day_streak")
    return (res_sessions?.data as Stats[] | null) ?? []
}

export function CalculateDailyAverageHours(sessions : SessionStatInfo[] ) : number {
    const now = new Date()
    var study_hours_sum : number = 0
    var average = 0
    
    if (sessions.length > 0){
        var first = sessions[0]
        var last = sessions[sessions.length - 1]

        study_hours_sum = sessions.reduce((total : number, val : SessionStatInfo)=>{
            return total + val.study_time
        }, 0)

        var first_date = new Date(first?.start_date_time ?? "null")
        var last_date = new Date(last?.start_date_time ?? "null")
        var delta_date_milli = last_date.getTime() - first_date.getTime();

        if (!isNaN(delta_date_milli)){
            var total_days = (delta_date_milli / 86400000) //(/ 1000) / 3600 / 24
            if (total_days > 0) average = study_hours_sum / total_days
            else average = study_hours_sum
        }

    }

    return average
}

function CheckDayStreak(sessions : SessionStatInfo[]){
    if (sessions.length < 2) return true

    var second_last = sessions[sessions.length - 2]
    var last = sessions[sessions.length - 1]

    var second_last_date = new Date(second_last?.start_date_time ?? "null")
    var last_date = new Date(last?.start_date_time ?? "null")
    var delta_date_milli = last_date.getTime() - second_last_date.getTime()

    if (!isNaN(delta_date_milli)){
        var delta_days = delta_date_milli / 86400000
        if (delta_days < 2) return true
        else return false
    }

    return false
}

export async function UpdateStats(){
    const profiles : ProfileID[] = await getAllUsers()
    const sessions : SessionStatInfo[] = await getAllSessions()
    const current_stats : Stats[] = await getAllStats()

    const updated_stats : {[key: number]: Stats} = {}

    for (let i = 0; i < profiles.length ; i++){
        var curr_id = profiles[i]?.id_profile ?? -1
        if (curr_id > 0){
            var curr_sessions = sessions.filter((s)=> s.id_profile == curr_id)
            var curr_average = CalculateDailyAverageHours(curr_sessions)
            var curr_day_streak = CheckDayStreak(curr_sessions)


            // updated_stats[curr_id] = {
            //     id_stats: 0,
            //     id_profile: curr_id,
            //     daily_average: curr_average,
            // }

            console.log(`${ profiles[i]?.id_profile } : ${curr_average}`);
        }
    }

    console.log(updated_stats);
    

    // setLastStatsUpdateDate(now).then(data => {
    //     console.log("Writing:", data)
    // })
}



