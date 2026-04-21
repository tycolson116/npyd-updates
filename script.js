// 1. Initialize Supabase
const supabaseUrl = 'https://lcfezxfcljjztutbuonk.supabase.co';
const supabaseKey = 'sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. NYC Open Data App Token (PASTE YOUR TOKEN BELOW)
const appToken = '9p0TgBMkCYRPZL3TktXvecvWb'
// 3. Set up Event Listener
document.getElementById('searchBtn').addEventListener('click', handleSearch);

async function handleSearch() {
    const searchName = document.getElementById('searchName').value.trim().toUpperCase();
    const searchBadge = document.getElementById('searchBadge').value.trim();
    const resultsDiv = document.getElementById('results');

    if (!searchName && !searchBadge) {
        resultsDiv.innerHTML = "<p style='color: orange;'>⚠️ Please enter a Name or Badge Number.</p>";
        return;
    }

    resultsDiv.innerHTML = "<div class='loader'>Searching NYC Open Data...</div>";

    try {
        // 4. Construct the API URL
        let apiURL = `https://data.cityofnewyork.us/resource/2fir-qns4.json`;
        if (searchBadge) {
            apiURL += `?shield_no=${searchBadge}`;
        } else if (searchName) {
            apiURL += `?last_name=${searchName}`;
        }

        // 5. Fetch from NYC Open Data WITH App Token Headers
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'X-App-Token': appToken,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const officerData = await response.json();

        if (!officerData || officerData.length === 0) {
            resultsDiv.innerHTML = `<p>No live records found for your search.</p>`;
            return;
        }

        const liveOfficer = officerData[0];

        // 6. Fetch Historical Complaints from Supabase
        const { data: complaints, error: complaintsError } = await supabaseClient
            .from('ccrb_complaints_nyc')
            .select('*')
            .eq('Tax ID', liveOfficer.officer_id);

        if (complaintsError) console.warn("Supabase Error:", complaintsError.message);

        renderResults(liveOfficer, complaints || []);

    } catch (err) {
        resultsDiv.innerHTML = `<p class='error'>System Note: ${err.message}</p>`;
    }
}

function renderResults(officer, complaints) {
    const resultsDiv = document.getElementById('results');
    
    const fName = officer.first_name || "";
    const lName = officer.last_name || "Officer";
    const rank = officer.rank_now || "NYPD";
    const command = officer.current_command || "Unknown Command";

    // High risk logic: If more than 5 complaints, add a visual warning
    const isHighRisk = complaints.length > 5;

    resultsDiv.innerHTML = `
        <div class="officer-result ${isHighRisk ? 'high-risk' : ''}">
            <div class="header-container">
                <h2>${rank} ${fName} ${lName}</h2>
                <p><strong>Badge/Shield:</strong> #${officer.shield_no || 'N/A'}</p>
                <p><strong>Command:</strong> ${command}</p>
                <p><strong>Tax ID:</strong> ${officer.officer_id || 'N/A'}</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 15px 0;">
            <div class="history-section">
                <p><strong>Historical CCRB Complaints:</strong> ${complaints.length}</p>
                ${complaints.length > 0 ? 
                    `<p style="font-size: 0.9rem; color: #94a3b8;"><strong>Latest recorded allegation:</strong> ${complaints[0].Allegation || 'N/A'}</p>` 
                    : '<p style="color: #2ed573;">No historical complaints found in local archive.</p>'}
            </div>
        </div>
    `;
}
