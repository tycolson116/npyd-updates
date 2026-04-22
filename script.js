// 1. Initialize Supabase
// This uses the 'supabase' object loaded from the CDN in your HTML
const supabaseUrl = 'https://lcfezxfcljjztutbuonk.supabase.co';
const supabaseKey = 'sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. NYC Open Data App Token
const appToken = '9p0TgBMkCYRPZL3TktXvecvWb';

/**
 * 3. RENDER FUNCTION
 * We define this at the top so the browser "knows" it exists 
 * before handleSearch tries to use it.
 */
function renderResults(officer, complaints) {
    const resultsDiv = document.getElementById('results');
    
    // Safety check for field names from NYC Open Data
    const fName = officer.first_name || "";
    const lName = officer.last_name || "Officer";
    const rank = officer.rank_now || "NYPD";
    const command = officer.current_command || "N/A";
    const shield = officer.shield_no || "N/A";

    // Change visual style based on complaint volume
    const statusColor = complaints.length > 5 ? '#ff4757' : '#2ed573';

    resultsDiv.innerHTML = `
        <div class="officer-result" style="border-left: 10px solid ${statusColor}; padding: 20px; background: #1e293b; border-radius: 12px; margin-top: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <div class="header">
                <h2 style="margin: 0; color: #f8fafc;">${rank} ${fName} ${lName}</h2>
                <p style="color: #94a3b8; margin: 8px 0;"><strong>Badge:</strong> #${shield} | <strong>Tax ID:</strong> ${officer.officer_id || 'N/A'}</p>
                <p style="color: #94a3b8; margin: 0;"><strong>Command:</strong> ${command}</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 15px 0;">
            <div class="history">
                <h3 style="margin-bottom: 10px; color: #f8fafc;">CCRB Archive Record</h3>
                <p style="font-size: 1.1rem; margin: 0; color: #f8fafc;">Total Complaints Found: <strong>${complaints.length}</strong></p>
                ${complaints.length > 0 ? 
                    `<p style="font-size: 0.9rem; color: #94a3b8; margin-top: 10px;"><em>Latest Allegation: ${complaints[0].Allegation || 'N/A'}</em></p>` 
                    : '<p style="color: #2ed573; margin-top: 10px;">No historical complaints in local database.</p>'}
            </div>
        </div>
    `;
}

/**
 * 4. SEARCH LOGIC
 */
async function handleSearch() {
    const nameInput = document.getElementById('searchName');
    const badgeInput = document.getElementById('searchBadge');
    const resultsDiv = document.getElementById('results');

    const searchName = nameInput ? nameInput.value.trim().toUpperCase() : "";
    const searchBadge = badgeInput ? badgeInput.value.trim() : "";

    if (!searchName && !searchBadge) {
        resultsDiv.innerHTML = "<p style='color: orange;'>⚠️ Please enter a Name or Badge Number.</p>";
        return;
    }

    resultsDiv.innerHTML = "<div class='loader'>Searching NYC Open Data...</div>";

    try {
        // Build the URL using encodeURIComponent to prevent 400 Bad Request errors
        let apiURL = `https://data.cityofnewyork.us/resource/2fir-qns4.json`;
        
        if (searchBadge) {
            apiURL += `?shield_no=${encodeURIComponent(searchBadge)}`;
        } else if (searchName) {
            apiURL += `?last_name=${encodeURIComponent(searchName)}`;
        }

        // Fetch Live Data
        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'X-App-Token': appToken,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("NYC API Error:", errorText);
            throw new Error(`NYC Data Error (${response.status})`);
        }

        const officerData = await response.json();

        if (!officerData || officerData.length === 0) {
            resultsDiv.innerHTML = `<p>No live records found for "${searchBadge || searchName}".</p>`;
            return;
        }

        const liveOfficer = officerData[0];

        // Fetch History from Supabase
        // Matching NYC's 'officer_id' to your 'Tax ID'
        const { data: complaints, error: complaintsError } = await supabaseClient
            .from('ccrb_complaints_nyc')
            .select('*')
            .eq('Tax ID', liveOfficer.officer_id);

        if (complaintsError) console.warn("Supabase Error:", complaintsError.message);

        // Display results
        renderResults(liveOfficer, complaints || []);

    } catch (err) {
        resultsDiv.innerHTML = `<p style='color: #ff4757;'>⚠️ ${err.message}</p>`;
        console.error("Search failed:", err);
    }
}

// 5. Initialize: Attach event listener when window loads
window.onload = function() {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
        console.log("System Ready: Search button linked.");
    }
};
