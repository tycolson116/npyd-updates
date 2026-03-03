// 1. Initialize Supabase
const supabaseUrl = 'https://lcfezxfcljjztutbuonk.supabase.co';
const supabaseKey = 'sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO';
const supabase = supabasejs.createClient(supabaseUrl, supabaseKey);

document.getElementById('searchBtn').addEventListener('click', async function() {
    const shieldQuery = document.getElementById('officerInput').value;
    
    if (shieldQuery) {
        showLoading();
        // 2. Fetch from your Supabase Database
        const { data: officer, error } = await supabase
            .from('officers')
            .select('*')
            .eq('shield_no', shieldQuery)
            .single(); // Get one specific officer

        if (error || !officer) {
            document.getElementById('resultsArea').innerHTML = "<p>Officer not found in 2026 Registry.</p>";
        } else {
            renderOfficer(officer);
        }
    }
});

function renderOfficer(officer) {
    const resultsArea = document.getElementById('resultsArea');
    resultsArea.classList.remove('hidden');

    // Logic for dynamic CSS classes based on risk
    const riskClass = officer.risk_level === 'High' ? 'high-risk' : 'standard-risk';

    resultsArea.innerHTML = `
        <div class="officer-result ${riskClass}">
            <h2>${officer.full_name} (Shield: ${officer.shield_no})</h2>
            <p><strong>Precinct:</strong> ${officer.precinct}</p>
            <p><strong>CCRB Complaints:</strong> ${officer.complaint_count}</p>
            <p><strong>Legal History:</strong> ${officer.lawsuit_history}</p>
            <hr>
            <h3>🛡️ Your Rights in this Precinct:</h3>
            <p>You are in the ${officer.precinct}. Under the NYC Right to Know Act, you can request this officer's business card.</p>
        </div>
    `;
}

function showLoading() {
    document.getElementById('resultsArea').innerHTML = "<p>Searching NYC Database...</p>";
}
