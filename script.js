// Link the search button to the function
document.getElementById('searchBtn').addEventListener('click', searchOfficer);

async function searchOfficer() {
    // 1. Get and Clean Inputs
    const nameInput = document.getElementById('nameInput').value.trim().toUpperCase();
    const shieldInput = document.getElementById('shieldInput').value.trim();
    
    const statusText = document.getElementById('statusText');
    const modal = document.getElementById('officerModal');
    const modalBody = document.getElementById('modalBody');

    // Reset UI for new search
    statusText.innerText = "Connecting to NYC Open Data...";
    statusText.style.color = "#8b949e";

    // 2. 2026 LIVE DATASET: NYPD Officer Profile - Members of Service
    // ID: pmsy-ewrc (Updated weekly)
    const apiEndpoint = `https://data.cityofnewyork.us/resource/pmsy-ewrc.json`;
    
    // We search using the 'name' field and 'shield' field.
    // The LIKE operator helps find the name even if it's stored as "LAST, FIRST"
    const query = `?$where=name LIKE '%${nameInput}%' AND shield='${shieldInput}'`;

    try {
        const response = await fetch(apiEndpoint + query);
        
        // Error Handling: Check if the server actually responded
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}. Dataset may be undergoing maintenance.`);
        }

        const data = await response.json();

        // 3. Logic to handle the data results
        if (data && data.length > 0) {
            const officer = data[0];
            statusText.innerText = "Officer Found!";
            statusText.style.color = "#2ecc71";

            // Inject data into the Pop-up (Modal)
            modalBody.innerHTML = `
                <h2 style="color: #58a6ff; margin-top: 0;">Officer Profile</h2>
                <hr style="border: 0; border-top: 1px solid #30363d; margin: 15px 0;">
                
                <div style="text-align: left; line-height: 1.8;">
                    <p><strong>Name:</strong> ${officer.name}</p>
                    <p><strong>Shield:</strong> ${officer.shield}</p>
                    <p><strong>Current Rank:</strong> ${officer.rank || 'N/A'}</p>
                    <p><strong>Command:</strong> ${officer.command || 'N/A'}</p>
                    <p><strong>Total Arrests:</strong> ${officer.arrests_total || '0'}</p>
                    <p><strong>Recognitions:</strong> ${officer.department_recognitions || '0'}</p>
                    <p><strong>Appointed:</strong> ${officer.appointment_date ? officer.appointment_date.split('T')[0] : 'N/
