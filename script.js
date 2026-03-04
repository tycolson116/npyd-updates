import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient('https://lcfezxfcljjztutbuonk.supabase.co', 'sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO')
const NYC_DATA_URL = "https://data.cityofnewyork.us/resource/2fir-qns4.json"

async function syncNYPDData() {
  // Fetch from NYC Open Data Officer Profile
  const response = await fetch("https://data.cityofnewyork.us/resource/2fir-qns4.json?$limit=50");
  const officers = await response.json();

  const formattedData = officers.map(off => ({
    tax_id: parseInt(off.tax_id),
    officer_first_name: off.first_name,
    officer_last_name: off.last_name,
    current_rank_abbreviation: off.rank_abbrev_now,
    current_rank: off.rank_now,
    current_command: off.command_now,
    shield_no: off.shield_no
  }));

  const { data, error } = await supabase
    .from('civilian_complaint_review_board_police_officers')
    .upsert(formattedData, { onConflict: 'tax_id' });

  if (error) {
    console.error("Precision Error:", error.message);
  } else {
    console.log("Success! Your Supabase table is now perfectly synced with NYC Open Data.");
  }
}

syncNYPDData();
