// 1. Initialize Supabase
const supabaseUrl = 'https://lcfezxfcljjztutbuonk.supabase.co';
const supabaseKey = 'sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. NYC Open Data App Token
const appToken = '9p0TgBMkCYRPZL3TktXvecvWb';

// 3. Wait for the page to load before linking the button
window.onload = function() {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
        console.log("System Ready.");
    }
};

// 4. THE SEARCH FUNCTION
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

    resultsDiv.innerHTML = "<div class='loader'>Connecting to NYC Open Data...</div>";

    try {
        // Build the URL carefully to avoid 400 errors
        let apiURL = `https://data.cityofnewyork.us/resource/2fir-qns4.json`;
        
        // Use standard query parameters for better stability
        if (searchBadge) {
            apiURL += `?shield_no=${encodeURIComponent(searchBadge)}`;
        } else if (searchName) {
            apiURL += `?last_name=${encodeURIComponent(searchName)}`;
        }

        const response = await fetch(apiURL, {
            method: 'GET',
            headers: {
                'X-App-Token': appToken,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("API Error Detail:", errorText);
            throw new Error(`NYC Data Error (${response.status})`);
        }

        const officerData = await response.json();

        if (!officerData || officerData.length === 0) {
            resultsDiv.innerHTML = `<p>No live records found for your search.</p>`;
            return;
        }

        const liveOfficer = officerData[0];

        // Fetch history from Supabase
        const { data: complaints, error: complaintsError } = await supabaseClient
            .from('ccrb_complaints_nyc')
            .select('*')
            .eq('Tax ID', liveOfficer.officer_id);

        // TRIGGER THE RENDER (This is where your error was!)
        renderResults(liveOfficer, complaints || []);

    } catch (err) {
        resultsDiv.innerHTML = `<p style='color: #ff4757;'>⚠️ ${err.message}</p>`;
        console.error("Search failed:", err);
    }
}

// 5. THE RENDER FUNCTION (Must be outside handleSearch)
function renderResults(officer, complaints) {
    const resultsDiv = document.getElementById('results');
    
    const fName = officer.first_name || "";
    const lName = officer.last_name || "Officer";
    const rank = officer.rank_now || "NYPD";

    resultsDiv.innerHTML = `
        <div class="officer-result" style="border-left: 8px solid #3b82f6; padding: 20px; background: #1e293b; border-radius: 12px; margin-top: 20px;">
            <h2 style="margin: 0; color: #f8fafc;">${rank} ${fName} ${lName}</h2>
            <p style="color: #94a3b8;"><strong>Shield:</strong> #${officer.shield_no || 'N/A'}</p>
            <p style="color: #94a3b8;"><strong>Command:</strong> ${officer.current_command || 'N/A'}</p>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 15px 0;">
            <p style="margin: 0; color: #f8fafc;"><strong>Historical Complaints:</strong> ${complaints.length}</p>
        </div>
    `;
}
