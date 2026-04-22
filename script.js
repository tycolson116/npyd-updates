// 1. Standard initialization (no window. or curly braces needed)
const supabaseUrl = 'https://lcfezxfcljjztutbuonk.supabase.co';
const supabaseKey = 'sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

const appToken = '9p0TgBMkCYRPZL3TktXvecvWb';

// 2. Wrap everything in a check to make sure the page is loaded
window.onload = () => {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.onclick = handleSearch;
    }
};

async function handleSearch() {
    const searchName = document.getElementById('searchName').value.trim().toUpperCase();
    const searchBadge = document.getElementById('searchBadge').value.trim();
    const resultsDiv = document.getElementById('results');

    resultsDiv.innerHTML = "Searching NYC Open Data...";

    try {
        // Use encodeURIComponent to handle special characters or spaces
        let apiURL = `https://data.cityofnewyork.us/resource/2fir-qns4.json`;
        
        if (searchBadge) {
            apiURL += `?shield_no=${searchBadge}`;
        } else if (searchName) {
            apiURL += `?last_name=${encodeURIComponent(searchName)}`;
        }

        const response = await fetch(apiURL, {
            headers: { 'X-App-Token': appToken }
        });

        const officerData = await response.json();
        console.log("API Response:", officerData); // Keep this to check your console!

        if (!officerData || officerData.length === 0) {
            resultsDiv.innerHTML = "No live records found.";
            return;
        }

        const liveOfficer = officerData[0];
        
        // Fetch complaints from Supabase
        const { data: complaints, error: complaintsError } = await supabaseClient
            .from('ccrb_complaints_nyc')
            .select('*')
            .eq('Tax ID', liveOfficer.officer_id);

        renderResults(liveOfficer, complaints || []);
    } catch (err) {
        resultsDiv.innerHTML = `Error: ${err.message}`;
    }
}
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
