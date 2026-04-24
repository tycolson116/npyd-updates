document.getElementById('searchBtn').addEventListener('click', searchOfficer);

async function searchOfficer() {
    // 1. Clean and Format Inputs
    const nameInput = document.getElementById('nameInput').value.trim().toUpperCase();
    const shieldInput = document.getElementById('shieldInput').value.trim();
    
    const statusText = document.getElementById('statusText');
    const modal = document.getElementById('officerModal');
    const modalBody = document.getElementById('modalBody');

    // Reset UI
    statusText.innerText = "Searching Live NYPD Records...";
    
    // 2. THE FIX: Live 2026 Dataset (Members of Service)
    const apiEndpoint = `https://data.cityofnewyork.us/resource/pmsy-ewrc.json`;
    
    // This dataset uses 'name' and 'shield'. 
    // We use a query that looks for the name anywhere in the 'name' field.
    const query = `?$where=name LIKE '%${nameInput}%' AND shield='${shieldInput}'`;

    try {
        const response = await fetch(apiEndpoint + query);
        
        if (!response.ok) throw new Error("API Connection Failed");

        const data = await response.json();
        console.log("Data received:", data); // Check your console for this!

        if (data && data.length > 0) {
            const officer = data[0];
            statusText.innerText = "Officer Found!";

            // 3. Populate the Pop-up (Modal) with 2026 Data Fields
            modalBody.innerHTML = `
                <h2 style="color: #58a6ff; margin-bottom: 5px;">Officer Found</h2>
                <p style="color: #8b949e; font-size: 0.8rem; margin-bottom: 15px;">NYC Open Data Profile</p>
                <hr style="border: 0; border-top: 1px solid #30363d; margin-bottom: 15px;">
                
                <div style="text-align: left; line-height: 1.6;">
                    <p><strong>Name:</strong> ${officer.name}</p>
                    <p><strong>Shield:</strong> ${officer.shield}</p>
                    <p><strong>Rank:</strong> ${officer.rank || 'N/A'}</p>
                    <p><strong>Command:</strong> ${officer.command || 'N/A'}</p>
                    <p><strong>Arrests:</strong> ${officer.arrests_total || '0'}</p>
                    <p><strong>Recognitions:</strong> ${officer.department_recognitions || '0'}</p>
                    <p><strong>Appointed:</strong> ${officer.appointment_date ? officer.appointment_date.split('T')[0] : 'N/A'}</p>
                </div>
            `;
            
            // Trigger the Pop-up
            modal.style.display = "block";
        } else {
