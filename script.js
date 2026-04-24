document.getElementById('searchBtn').addEventListener('click', searchOfficer);

async function searchOfficer() {
    // 1. Get inputs and force them to UPPERCASE (NYC Data requirement)
    const nameInput = document.getElementById('nameInput').value.trim().toUpperCase();
    const shieldInput = document.getElementById('shieldInput').value.trim();
    
    const statusText = document.getElementById('statusText');
    const resultsArea = document.getElementById('resultsArea');

    // 2. Clear previous results and show loading state
    statusText.innerText = "Searching NYC Open Data...";
    
    // Using the NYPD Active Officers dataset ID (833y-7zab)
    // We use $where to search for records that START with the name or match the shield
    const apiEndpoint = `https://data.cityofnewyork.us/resource/833y-7zab.json`;
    const query = `?first_name=${nameInput}&shield_no=${shieldInput}`;

    try {
        const response = await fetch(apiEndpoint + query);
        const data = await response.json();

        // DEBUG: See what the city actually sent back in your console
        console.log("Data received:", data);

        if (data && data.length > 0) {
            const officer = data[0];
            statusText.innerText = "Officer Found!";

            // 3. Create the "Pop up" content inside your results box
            // Note: We use the exact API keys like 'first_name' and 'command_descr'
            resultsArea.innerHTML = `
                <div class="officer-card" style="border: 2px solid #3498db; padding: 15px; border-radius: 8px; background: #1a1f2b; margin-top: 10px; animation: fadeIn 0.5s;">
                    <h3 style="color: #2ecc71; margin-top: 0;">${officer.first_name} ${officer.last_name}</h3>
                    <p><strong>Shield #:</strong> ${officer.shield_no}</p>
                    <p><strong>Rank:</strong> ${officer.rank_incident_grade || 'N/A'}</p>
                    <p><strong>Command:</strong> ${officer.command_descr || 'N/A'}</p>
                    <p><strong>Appointed Date:</strong> ${officer.appointment_date ? officer.appointment_date.split('T')[0] : 'N/A'}</p>
                </div>
            `;
        } else {
            statusText.innerText = "No live records found.";
            resultsArea.innerHTML = `<p style="color: #e74c3c;">No officer matches "${nameInput}" with Shield "${shieldInput}".</p>`;
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        statusText.innerText = "Connection Error. Check internet/API link.";
    }
}
