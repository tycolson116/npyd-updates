// 1. Initialize Supabase correctly for Modules
// This ensures 'createClient' is extracted from the global supabase object
const { createClient } = supabase;

const supabaseUrl = 'https://lcfezxfcljjztutbuonk.supabase.co';
const supabaseKey = 'sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO';
const supabaseClient = createClient(supabaseUrl, supabaseKey);

// 2. NYC Open Data App Token
const appToken = '9p0TgBMkCYRPZL3TktXvecvWb';

// 3. Set up Event Listener inside DOMContentLoaded
// This ensures the button exists before we try to attach the click event
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', handleSearch);
    }
});

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
        // 4. Construct the API URL using $where for better filtering
        // NYC Open Data is case-sensitive, so we use upper() for names
        let apiURL = `https://data.cityofnewyork.us/resource/2fir-qns4.json`;
        
        if (searchBadge) {
            apiURL += `?$where=shield_no='${searchBadge}'`;
        } else if (searchName) {
            apiURL += `?$where=upper(last_name)='${searchName}'`;
        }

        // 5. Fetch from NYC Open Data
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
        console.log("API Data Received:", officerData); // <-- Add this!

        if (!officerData || officerData.length === 0) {
            resultsDiv.innerHTML = `<p>No live records found for your search.</p>`;
            return;
        }

        const liveOfficer = officerData[0];

        // 6. Fetch Historical Complaints from Supabase
        // Note: The NYC API returns 'officer_id', which we match to your 'Tax ID'
        const { data: complaints, error: complaintsError } = await supabaseClient
            .from('ccrb_complaints_nyc')
            .select('*')
const taxId = liveOfficer.officer_id || liveOfficer.tax_id; // Check both common names
const { data: complaints, error: complaintsError } = await supabaseClient
    .from('ccrb_complaints_nyc')
    .select('*')
    .eq('Tax ID', taxId);
        if (complaintsError) console.warn("Supabase Error:", complaintsError.message);

        renderResults(liveOfficer, complaints || []);

    } catch (err) {
        resultsDiv.innerHTML = `<p class='error'>System Note: ${err.message}</p>`;
        console.error("Full Error:", err);
    }
}

function renderResults(officer, complaints) {
    const resultsDiv = document.getElementById('results');
    
    // Ensure we are pulling the right fields from the NYC API response
    const fName = officer.first_name || "N/A";
    const lName = officer.last_name || "N/A";
    const badge = officer.shield_no || "N/A";

    resultsDiv.innerHTML = `
        <div class="officer-result">
            <h3>${officer.rank_now || 'Officer'} ${fName} ${lName}</h3>
            <p><strong>Badge:</strong> #${badge}</p>
            <p><strong>Command:</strong> ${officer.current_command || 'Unknown'}</p>
            <hr>
            <p><strong>Complaint Records:</strong> ${complaints ? complaints.length : 0}</p>
        </div>
    `;
}
