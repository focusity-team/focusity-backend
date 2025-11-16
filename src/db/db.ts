import { createClient, SupabaseClient } from '@supabase/supabase-js'

export var supabase : SupabaseClient | null = null
export function connect(){
    const supabaseUrl = process.env.SUPABASE_URL ?? ''
    const supabaseKey : string = process.env.SUPABASE_KEY ?? ''
    supabase = createClient(supabaseUrl, supabaseKey)
}