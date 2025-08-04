// update-punishments.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function updatePunishments() {
  const { error: rpcError } = await supabase.rpc('insert_punishments');
  if (rpcError) throw rpcError;

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ today_solved: false })
    .neq('today_solved', false);
  if (updateError) throw updateError;

  console.log('✅ Punishments updated and todaySolved reset.');
}

updatePunishments().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
