// 1. Initialize Supabase
const supabaseUrl = 'https://lcfezxfcljjztutbuonk.supabase.co';
const supabaseKey = 'sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. NYC Open Data App Token
const appToken = '9p0TgBMkCYRPZL3TktXvecvWb';

/**
 * 3. RENDER FUNCTION
 * Defined at the top so it is ready before handleSearch is called.
 */
function renderResults(officer, complaints) {
    const resultsDiv = document.getElementById('results');
    
    // Mapping keys from NYC Dataset 2fir-qns4
    const fName = officer.officer_first_name || "";
    const lName = officer.officer_last_name || "Officer";
    const rank = officer.current_rank || "NYPD";
    const command = officer.current_command || "N/A";
    const shield = officer.shield_no || "N/A";
    const taxId = officer.tax_id || "N/A";

    const isHighRisk = complaints.length > 5;

    resultsDiv.innerHTML = `
        <div class="officer-result" style="border-left: 10px solid ${isHighRisk ? '#ff4757' : '#2ed573'}; padding: 20px; background: #1e293b; border-radius: 12px; margin-top: 20px;">
            <h2 style="margin: 0; color: #f8fafc;">${rank} ${fName} ${lName}</h2>
            <p style="color: #94a3b8; margin: 8px 0;"><strong>Badge:</strong> #${shield} | <strong>Tax ID:</strong> ${taxId}</p>
            <p style="color: #94a3b8; margin: 0;"><strong>Command:</strong> ${command}</p>
            <hr style="border: 0; border-top: 1px solid #334155; margin: 15px 0;">
            <p style="color: #f8fafc; font-size: 1.1rem;"><strong>Historical CCRB Complaints:</strong> ${complaints.length}</p>
            ${complaints.length > 0 ? 
                `<p style="font-size: 0.9rem; color: #94a3b8; margin-top: 10px;">Latest Allegation: ${complaints[0].Allegation || 'N/A'}</p>` 
                : '<p style="color: #2ed573; font-size: 0.9rem; margin-top: 10px;">No
