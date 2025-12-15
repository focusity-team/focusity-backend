import { getLastStatsUpdateDate } from "../db/appData"
import { UpdateStats } from "./stats";
import cron from 'node-cron'

const DailyUpdateStatsTask = () => {
    UpdateStats().then((res)=>{
        console.log(res);
        
    })
};

export async function ServerSetup(){
    const res = await getLastStatsUpdateDate()
    const lastUpdateDateString : string = res?.data?.[0]?.last_stat_calc
    if (!lastUpdateDateString) { console.log("Error reading LastStatsUpdate"); return }
    
    const lastUpdateDate = new Date(lastUpdateDateString)
    const today = new Date();
    const delta_date = today.getDate() - lastUpdateDate.getDate()


        DailyUpdateStatsTask()
    if (delta_date > 0){
        if (today.getHours() > 4 || delta_date >= 2) {
            DailyUpdateStatsTask()
        }
    }

    cron.schedule('0 4 * * *', DailyUpdateStatsTask, {
        timezone: 'Europe/Rome'
    });

}