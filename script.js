async function handleSearch() {
    const badge = document.getElementById('searchBadge').value.trim();
    const resultsDiv = document.getElementById('results');
    
    // Initial validation
    if (!badge) {
        resultsDiv.innerHTML = "<p class='error-msg'>⚠️ Please enter a Badge Number.</p>";
        return;
    }

    resultsDiv.innerHTML = "<div class='loader'>Searching NYPD & CCRB Records...</div>";

    try {
        // 1. Fetch Officer Profile
        const { data: officer, error: officerError } = await supabase
            .from('civilian_complaint_review_board_police_officers')
            .select('*')
            .eq('shield_no', badge)
            .maybeSingle(); // Returns null instead of error if not found

        if (officerError) throw officerError;
        
        if (!officer) {
            resultsDiv.innerHTML = `<p class='error-msg'>No officer found with Badge #${badge}.</p>`;
            return;
        }

        // 2. Fetch All CCRB Complaints using Tax ID
        const { data: complaints, error: complaintsError } = await supabase
            .from('ccrb_complaints_nyc')
            .select('*')
            .eq('Tax ID', officer.tax_id)
            .order('As Of Date', { ascending: false });

        if (complaintsError) throw complaintsError;

        // 3. Display Data
        renderComprehensiveTable(officer, complaints);

    } catch (err) {
        console.error("Database Error:", err.message);
        resultsDiv.innerHTML = `
            <div class='error-container'>
                <p><strong>Connection Error:</strong> Could not reach the database.</p>
                <p><small>${err.message}</small></p>
            </div>`;
    }
}

function renderComprehensiveTable(officer, complaints) {
    const resultsDiv = document.getElementById('results');
    
    let html = `
        <div class="officer-header">
            <h2>${officer.current_rank} ${officer.officer_first_name} ${officer.officer_last_name}</h2>
            <p><strong>Tax ID:</strong> ${officer.tax_id} | <strong>Current Command:</strong> ${officer.current_command}</p>
        </div>
        
        <h3>CCRB Detailed History</h3>
        <table class="ccrb-table">
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Complaint ID</th>
                    <th>FADO Type</th>
                    <th>Allegation</th>
                    <th>Board Disposition</th>
                    <th>NYPD Disposition</th>
                    <th>Command at Incident</th>
                </tr>
            </thead>
            <tbody>
    `;

    if (complaints && complaints.length > 0) {
        complaints.forEach(c => {
            // Using bracket notation for NYC Open Data headers with spaces
            html += `
                <tr>
                    <td>${c['As Of Date'] || 'N/A'}</td>
                    <td>${c['Complaint Id']}</td>
                    <td>${c['FADO Type']}</td>
                    <td>${c['Allegation']}</td>
                    <td class="status">${c['CCRB Allegation Disposition']}</td>
                    <td>${c['NYPD Allegation Disposition']}</td>
                    <td>${c['Officer Command At Incident']}</td>
                </tr>
            `;
        });
    } else {
        html += "<tr><td colspan='7'>No CCRB complaints found for this officer.</td></tr>";
    }

    html += `</tbody></table>`;
    resultsDiv.innerHTML = html;
}
