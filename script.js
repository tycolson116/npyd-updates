async function handleSearch() {
    // 1. Defensively select elements
    const searchBadge = document.getElementById('searchBadge');
    const resultsDiv = document.getElementById('results');
    
    // Safety Check: If the HTML elements are missing, stop immediately without an error
    if (!searchBadge || !resultsDiv) return;

    const badge = searchBadge.value.trim();
    
    if (!badge) {
        resultsDiv.innerHTML = "<p style='color: orange;'>⚠️ Please enter a Badge Number.</p>";
        return;
    }

    resultsDiv.innerHTML = "<div class='loader'>Connecting to Database...</div>";

    try {
        // 2. Fetch Officer Data
        const { data: officer, error: officerError } = await supabase
            .from('civilian_complaint_review_board_police_officers')
            .select('*')
            .eq('shield_no', badge)
            .maybeSingle(); // This prevents the 'null' error if badge is wrong

        if (officerError) throw officerError;
        
        if (!officer) {
            resultsDiv.innerHTML = `<p>No records found for Badge #${badge}.</p>`;
            return;
        }

        // 3. Fetch Complaints
        const { data: complaints, error: complaintsError } = await supabase
            .from('ccrb_complaints_nyc')
            .select('*')
            .eq('Tax ID', officer.tax_id);

        if (complaintsError) throw complaintsError;

        // 4. Render with "Null Checks" for headings
        renderResults(officer, complaints || []);

    } catch (err) {
        // This catches ANY unexpected error and displays a clean message
        resultsDiv.innerHTML = `<p class='error'>System Note: ${err.message}</p>`;
    }
}

function renderResults(officer, complaints) {
    const resultsDiv = document.getElementById('results');
    
    // Safety logic for headings: if a name is missing, use a fallback
    const fName = officer.officer_first_name || "";
    const lName = officer.officer_last_name || "Officer";
    const rank = officer.current_rank || "NYPD";

    resultsDiv.innerHTML = `
        <div class="header-container">
            <h2>${rank} ${fName} ${lName}</h2>
            <p><strong>Tax ID:</strong> ${officer.tax_id || 'N/A'}</p>
        </div>
        <div class="history-section">
            <p>Total CCRB Records Found: ${complaints.length}</p>
            </div>
    `;
}
