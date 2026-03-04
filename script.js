import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabase = createClient('https://lcfezxfcljjztutbuonk.supabase.co', 'sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO')
const NYC_DATA_URL = "https://data.cityofnewyork.us/resource/2fir-qns4.json"

async function findOfficer() {
  const nameInput = document.getElementById('searchName').value;
  const badgeInput = document.getElementById('searchBadge').value;
  const resultsDiv = document.getElementById('results');

  // Start building the query
  let query = supabase
    .from('civilian_complaint_review_board_police_officers')
    .select('*');

  // If name is typed, search by last name
  if (nameInput) {
    query = query.ilike('officer_last_name', `%${nameInput}%`);
  }

  // If badge is typed, search for exact shield number match
  if (badgeInput) {
    query = query.eq('shield_no', badgeInput);
  }

  const { data, error } = await query;

  if (error) {
    resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
    return;
  }

  // Display the data cleanly
  if (data.length > 0) {
    resultsDiv.innerHTML = data.map(officer => `
      <div class="officer-card">
        <h3>${officer.officer_first_name} ${officer.officer_last_name}</h3>
        <p><strong>Rank:</strong> ${officer.current_rank_abbreviation}</p>
        <p><strong>Badge:</strong> ${officer.shield_no}</p>
        <p><strong>Command:</strong> ${officer.current_command}</p>
      </div>
    `).join('');
  } else {
    resultsDiv.innerHTML = '<p>No officer found with that information.</p>';
  }
}

document.getElementById('searchBtn').addEventListener('click', findOfficer);
