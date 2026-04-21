// 1. Correctly grab the createClient function from the global window
const { createClient } = window.supabase;

const supabaseUrl = 'https://lcfezxfcljjztutbuonk.supabase.co';
const supabaseKey = 'sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// 2. NYC Open Data App Token
const appToken = '9p0TgBMkCYRPZL3TktXvecvWb';

// 3. Ensure the button is ready before attaching the event
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
});

async function handleSearch() {
    const searchNameInput = document.getElementById('searchName');
    const searchBadgeInput = document.getElementById('searchBadge');
    const resultsDiv = document.getElementById('results');

    const searchName = searchNameInput ? searchNameInput.value.trim().toUpperCase() : "";
    const searchBadge = searchBadgeInput ? searchBadgeInput.value.trim() : "";

    if (!searchName && !searchBadge) {
        resultsDiv.innerHTML = "<p style='color: orange;'>⚠️ Please enter a Name or Badge Number.</p>";
        return;
    }

    resultsDiv.innerHTML = "<div class='loader'>Searching NYC Open Data...</div>";

    try {
        // 4. Using $where for better API response
        let apiURL = `https://data.cityofnewyork.us/resource/2fir-qns4.json`;
        if (searchBadge) {
            apiURL += `?$where=shield_no='${searchBadge}'`;
        } else if (searchName) {
            apiURL += `?$where=upper(last_name)='${searchName}'`;
        }

        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'X-App-Token': appToken,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        const officerData = await response.json();

        if (!officerData || officerData.length === 0) {
            resultsDiv.innerHTML = `<p>No live records found for your search.</p>`;
            return;
        }

        const liveOfficer = officerData[0];

        // 5. Query Supabase using the ID from the API
        const { data: complaints, error: complaintsError } = await supabaseClient
            .from('ccrb_complaints_nyc')
            .select('*')
            .eq('Tax ID', liveOfficer.officer_id);

        if (complaintsError) console.warn("Supabase Error:", complaintsError.message);

        renderResults(liveOfficer, complaints || []);

    } catch (err) {
        resultsDiv.innerHTML = `<p class='error'>System Note: ${err.message}</p>`;
        console.error(err);
    }
}

function renderResults(officer, complaints) {
    const resultsDiv = document.getElementById('results');
    
    const fName = officer.first_name || "";
    const lName = officer.last_name || "Officer";
    const rank = officer.rank_now || "NYPD";

    resultsDiv.innerHTML = `
        <div class="officer-result ${complaints.length > 5 ? 'high-risk' : ''}">
            <div class="header-container">
                <h2>${rank} ${fName} ${lName}</h2>
                <p><strong>Badge/Shield:</strong> #${officer.shield_no || 'N/A'}</p>
                <p><strong>Command:</strong> ${officer.current_command || 'N/A'}</p>
            </div>
            <hr>
            <div class="history-section">
                <p><strong>Historical CCRB Complaints:</strong> ${complaints.length}</p>
            </div>
        </div>
    `;
}
