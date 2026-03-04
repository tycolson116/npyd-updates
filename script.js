import { createClient } from '@supabase/supabase-js'

const supabase = createClient('https://lcfezxfcljjztutbuonk.supabase.co', 'sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO')
const NYC_DATA_URL = "https://data.cityofnewyork.us/resource/2fir-qns4.json"

async function syncNYPDData() {
  // 1. Fetch the latest officer data
  const response = await fetch(`${NYC_DATA_URL}?$limit=5000`);
  const nypdData = await response.json();

  // 2. Map NYC fields to your Supabase columns
  const formattedData = nypdData.map(officer => ({
    tax_id: officer.tax_id,
    officer_first_name: officer.officer_first_name,
    officer_last_name: officer.officer_last_name,
    officer_rank_abbreviation: officer.current_rank_abbreviation,
    command: officer.current_command,
    shield_no: officer.shield_no,
    last_updated: new RegExp('as_of_date') // Tracking updates
  }));

  // 3. Upsert into Supabase (Matches on tax_id)
  const { error } = await supabase
    .from('nypd_officers')
    .upsert(formattedData, { onConflict: 'tax_id' });

  if (error) console.error('Sync Error:', error);
  else console.log('Successfully updated officer records!');
}
