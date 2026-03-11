import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

https://lcfezxfcljjztutbuonk.supabase.co // Replace with your Supabase URL
sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO// Replace with your Supabase Anon Key
const NYC_DATA_URL = 'https://data.cityofnewyork.us/resource/f2fr-qn54.json'; // This URL seems to be for direct API access, your Supabase setup implies you've imported this data.

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const nameInput = document.getElementById('searchName');
const badgeInput = document.getElementById('searchBadge');
const resultsDiv = document.getElementById('results');
const searchButton = document.getElementById('searchBtn'); // Get the search button

async function findOfficer() {
    resultsDiv.innerHTML = ''; // Clear previous results

    const nameValue = nameInput.value.trim();
    const badgeValue = badgeInput.value.trim();

    if (!nameValue && !badgeValue) {
        resultsDiv.innerHTML = '<p>Please enter a last name or a badge number to search.</p>';
        return;
    }

    let query = supabase
        .from('civilian_complaint_review_board_officers')
        .select('*'); // Select all columns for now, you can refine this later

    if (nameValue) {
        // Assuming 'officer_last_name' is the column name for the last name
        query = query.ilike('officer_last_name', `%${nameValue}%`);
    }

    if (badgeValue) {
        // Assuming 'shield_no' is the column name for the badge number
        // If searching by both, it will add an AND condition
        query = query.eq('shield_no', badgeValue);
    }

    const { data, error } = await query;

    if (error) {
        resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
        return;
    }

    if (data && data.length > 0) {
        resultsDiv.innerHTML = data.map(officer => `
            <div class="officer-card">
                <h3>${officer.officer_first_name || 'N/A'} ${officer.officer_last_name || 'N/A'}</h3>
                <p><strong>Rank:</strong> ${officer.officer_current_rank_abbreviation || 'N/A'}</p>
                <p><strong>Shield No:</strong> ${officer.shield_no || 'N/A'}</p>
                <p><strong>Command:</strong> ${officer.officer_current_command || 'N/A'}</p>
            </div>
        `).join('');
    } else {
        resultsDiv.innerHTML = '<p>No officer found with that information.</p>';
    }
}
