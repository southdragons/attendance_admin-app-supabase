import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://flwwmfehxdmtomgkcdxm.supabase.co'
const supabaseKey = 'sb_publishable_bYtNE2S6GQ4p6B1blPJhnw_GeTRyp4a'

export const supabase = createClient(supabaseUrl, supabaseKey)
