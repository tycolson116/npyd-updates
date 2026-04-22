// 1. Initialize Supabase (Standard Script Mode)
// Using the global 'supabase' object loaded from your HTML script tag
const supabaseUrl = 'https://lcfezxfcljjztutbuonk.supabase.co';
const supabaseKey = 'sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. NYC Open Data App Token
const appToken = '9p0TgBMkCYRPZL3TktXvecvWb';

// 3. Ensure the page is fully loaded before attaching the click event
window.onload = function() {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
        console.log("App ready: Search button linked.");
    }
};

async function handleSearch() {
    // Get input values
    const nameInput = document.getElementById('searchName');
    const badgeInput = document.getElementById('searchBadge');
    const resultsDiv = document.getElementById('results');

    const searchName = nameInput ? nameInput.value.trim().toUpperCase() : "";
    const searchBadge = badgeInput ? badgeInput.value.trim() : "";

    // Validation
    if (!searchName && !searchBadge) {
        resultsDiv.innerHTML = "<p style='color: orange;'>⚠️ Please enter a Name or Badge Number.</p>";
        return;
    }

    resultsDiv.innerHTML = "<div class='loader'>Searching NYC Open Data...</div>";

    try {
        // 4. Construct the NYC Open Data API URL
        // We use simple query parameters to avoid the '400 Bad Request' errors
        let apiURL = `https://data.cityofnewyork.us/resource/2fir-qns4.json`;
        
        if (searchBadge) {
            // Remove spaces from badge number
            apiURL += `?shield_no=${searchBadge.replace(/\s/g, '')}`;
        } else if (searchName) {
            // Encode the name for the URL
            apiURL += `?last_name=${encodeURIComponent(searchName)}`;
        }

        console.log("Fetching from NYC API:", apiURL);

        // 5. Fetch Live Data from NYC Open Data
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'X-App-Token': appToken,
                'Content-Type': 'application/json'
            }
        });

        // Error handling for the API response
        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Detail:", errorText);
            throw new Error(`NYC Data Error (${response.status})`);
        }

        const officerData = await response.json();

        if (!officerData || officerData.length === 0) {
            resultsDiv.innerHTML = `<p>No live records found for "${searchBadge || searchName}".</p>`;
            return;
        }

        // Take the first matching officer
        const liveOfficer = officerData[0];
        console.log("Officer Found:", liveOfficer);

        // 6. Fetch Historical Complaints from your Supabase
        // We use officer_id from the API to match the 'Tax ID' in your database
        const { data: complaints, error: complaintsError } = await supabaseClient
            .from('ccrb_complaints_nyc')
            .select('*')
            .eq('Tax ID', liveOfficer.officer_id);

        if (complaintsError) {
            console.warn("Supabase History Error:", complaintsError.message);
        }

        // 7. Render the final combined data to the UI
        renderResults(liveOfficer, complaints || []);

    } catch (err) {
        resultsDiv.innerHTML = `<p class='error' style='color: #ff4757;'>⚠️ ${err.message}</p>`;
        console.error("Search failed:", err);
    }
}

function renderResults(officer, complaints) {
    const resultsDiv = document.getElementById('results');
    
    // Fallbacks for missing data
    const fName = officer.first_name || "";
    const lName = officer.last_name || "Officer";
    const rank = officer.rank_now || "NYPD";
    const command = officer.current_command || "N/A";
    const shield = officer.shield_no || "N/A";

    // CSS Class for high complaint counts
    const riskClass = complaints.length > 5 ? 'high-risk' : '';

    resultsDiv.innerHTML = `
        <div class="officer-result ${riskClass}" style="border-left: 8px solid ${complaints.length > 5 ? '#ff4757' : '#ffa502'}; padding: 15px; background: #1e293b; border-radius: 8px; margin-top: 20px;">
            <div class="header-container">
                <h2 style="margin: 0; color: #f8fafc;">${rank} ${fName} ${lName}</h2>
                <p style="color: #94a3b8; margin: 5px 0;"><strong>Badge/Shield:</strong> #${shield}</p>
                <p style="color: #94a3b8; margin: 5px 0;"><strong>Command:</strong> ${command}</p>
                <p style="color: #94a3b8; margin: 5px 0;"><strong>Tax ID:</strong> ${officer.officer_id || 'N/A'}</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 15px 0;">
            <div class="history-section">
                <h3 style="margin-bottom: 5px; color: #f8fafc;">CCRB Archive History</h3>
                <p style="margin: 0;">Total Records Found: <strong>${complaints.length}</strong></p>
                ${complaints.length > 0 ? 
                    `<p style="font-size: 0.85rem; color: #94a3b8; margin-top: 8px;">Latest Allegation: ${complaints[0].Allegation || 'N/A'}</p>` 
                    : '<p style="color: #2ed573; font-size: 0.9rem;">No historical records in your database.</p>'}
            </div>
        </div>
    `;
}
