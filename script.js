// 1. Initialize Supabase
const supabaseUrl = 'https://lcfezxfcljjztutbuonk.supabase.co';
const supabaseKey = 'sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. NYC Open Data App Token
const appToken = '9p0TgBMkCYRPZL3TktXvecvWb';

/**
 * 3. RENDER FUNCTION
 * Placed at the top so the browser defines it before handleSearch is called.
 */
function renderResults(officer, complaints) {
    const resultsDiv = document.getElementById('results');
    
    // Mapping keys based on NYC Dataset 2fir-qns4
    const fName = officer.officer_first_name || "";
    const lName = officer.officer_last_name || "Officer";
    const rank = officer.current_rank || "NYPD";
    const command = officer.current_command || "N/A";
    const shield = officer.shield_no || "N/A";
    const taxId = officer.tax_id || "N/A";

    const isHighRisk = complaints.length > 5;

    resultsDiv.innerHTML = `
        <div class="officer-result ${isHighRisk ? 'high-risk' : ''}" 
             style="border-left: 10px solid ${isHighRisk ? '#ff4757' : '#2ed573'}; 
                    padding: 20px; background: #1e293b; border-radius: 12px; margin-top: 20px;">
            <div class="header-container">
                <h2 style="margin: 0; color: #f8fafc;">${rank} ${fName} ${lName}</h2>
                <p style="color: #94a3b8; margin: 8px 0;"><strong>Badge/Shield:</strong> #${shield}</p>
                <p style="color: #94a3b8; margin: 5px 0;"><strong>Command:</strong> ${command}</p>
                <p style="color: #94a3b8; margin: 5px 0;"><strong>Tax ID:</strong> ${taxId}</p>
            </div>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 15px 0;">
            <div class="history-section">
                <h3 style="margin-bottom: 5px; color: #f8fafc;">Historical CCRB Complaints</h3>
                <p style="font-size: 1.1rem; color: #f8fafc;">Total Records Found: <strong>${complaints.length}</strong></p>
                ${complaints.length > 0 ? 
                    `<p style="font-size: 0.9rem; color: #94a3b8; margin-top: 8px;">Latest Allegation: ${complaints[0].Allegation || 'N/A'}</p>` 
                    : '<p style="color: #2ed573; font-size: 0.9rem; margin-top: 8px;">No historical complaints found in database.</p>'}
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

    if (!searchName
