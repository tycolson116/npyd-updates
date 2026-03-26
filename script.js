async function handleSearch() {
    const badge = document.getElementById('searchBadge').value.trim();
    const resultsDiv = document.getElementById('results');
    
    if (!badge) {
        resultsDiv.innerHTML = "<p class='error-msg'>⚠️ Please enter a Badge Number.</p>";
        return;
    }

    resultsDiv.innerHTML = "<div class='loader'>Searching NYPD & CCRB Records...</div>";

    try {
        // 1. Fetch Officer Profile - Ensuring we get the names
        const { data: officer, error: officerError } = await supabase
            .from('civilian_complaint_review_board_police_officers')
            .select('officer_first_name, officer_last_name, current_rank, tax_id, current_command')
            .eq('shield_no', badge)
            .maybeSingle();

        if (officerError) throw officerError;
        
        if (!officer) {
            resultsDiv.innerHTML = `<p class='error-msg'>No officer found with Badge #${badge}.</p>`;
            return;
        }

        // 2. Fetch All CCRB Complaints using the Tax ID
        const { data: complaints, error: complaintsError } = await supabase
            .from('ccrb_complaints_nyc')
            .select('*')
            .eq('Tax ID', officer.tax_id)
            .order('As Of Date', { ascending: false });

        if (complaintsError) throw complaintsError;

        // 3. Pass both to the display function
        renderComprehensiveTable(officer, complaints);

    } catch (err) {
        console.error("Database Error:", err.message);
        resultsDiv.innerHTML = `
            <div class='error-container'>
                <p><strong>Connection Error:</strong> Could not retrieve data.</p>
                <p><small>${err.message}</small></p>
            </div>`;
    }
}

function renderComprehensiveTable(officer, complaints) {
    const resultsDiv = document.getElementById('results');
    
    // Formatting the name properly for the heading
    const firstName = officer.officer_first_name || "Unknown";
    const lastName = officer.officer_last_name || "Officer";
    const rank = officer.current_rank || "Member of Service";

    let html = `
        <div class="officer-profile-card">
            <header class="results-header">
                <h2>${rank} ${firstName} ${lastName}</h2>
                <div class="officer-meta">
                    <span><strong>Tax ID:</strong> ${officer.tax_id}</span> | 
                    <span><strong>Current Command:</strong> ${officer.current_command || 'N/A'}</span>
                </div>
            </header>
        </div>
        
        <div class="table-container">
            <h3>CCRB Allegation History (${complaints.length} Records)</h3>
            <table class="ccrb-table">
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Complaint ID</th>
                        <th>FADO Type</th>
                        <th>Allegation</th>
                        <th>CCRB Disposition</th>
                        <th>NYPD Disposition</th>
                    </tr>
                </thead>
                <tbody>
    `;

    if (complaints && complaints.length > 0) {
        complaints.forEach(c => {
            html += `
                <tr>
                    <td>${c['As Of Date'] || 'N/A'}</td>
                    <td>${c['Complaint Id'] || 'N/A'}</td>
                    <td>${c['FADO Type'] || 'N/A'}</td>
                    <td>${c['Allegation'] || 'N/A'}</td>
                    <td class="disposition-cell">${c['CCRB Allegation Disposition'] || 'Pending'}</td>
                    <td>${c['NYPD Allegation Disposition'] || 'N/A'}</td>
                </tr>
            `;
        });
    } else {
        html += "<tr><td colspan='6' class='no-results'>No formal CCRB complaints found for this Tax ID.</td></tr>";
    }

    html += `</tbody></table></div>`;
    resultsDiv.innerHTML = html;
}
