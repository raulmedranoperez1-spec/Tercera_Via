import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = 'https://fagililzingryplvnjtd.supabase.co'
export const supabaseAnonKey = 'sb_publishable_aR4QujoqD6kA-HA3-wif7w_eQpbq0_P'

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
