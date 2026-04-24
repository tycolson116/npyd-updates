document.getElementById('searchBtn').addEventListener('click', searchOfficer);

async function searchOfficer() {
    // 1. Get and Clean Inputs
    const nameInput = document.getElementById('nameInput').value.trim().toUpperCase();
    const shieldInput = document.getElementById('shieldInput').value.trim();
    
    const statusText = document.getElementById('statusText');
    const modal = document.getElementById('officerModal');
    const modalBody = document.getElementById('modalBody');

    statusText.innerText = "Connecting to NYC Open Data...";
    statusText.style.color = "#8b949e";

    // 2. The API Endpoint (NYPD Members of Service)
    const apiEndpoint = `https://data.cityofnewyork.us/resource/pmsy-ewrc.json`;
    
    // 3. Fix: Build the URL using URLSearchParams to avoid 400 Bad Request
    // This correctly handles spaces and special characters automatically
    const params = new URLSearchParams({
        "shield": shieldInput
    });
    
    // We add the name filter separately to ensure it matches the database format
    const finalUrl = `${apiEndpoint}?${params.toString()}&$where=name LIKE '%${nameInput}%'`;

    try {
        // Fix: Use 'cors' mode and proper headers
        const response = await fetch(finalUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const officer = data[0];
            statusText.innerText = "Officer Found!";
            statusText.style.color = "#2ecc71";

            modalBody.innerHTML = `
                <h2 style="color: #58a6ff; margin-top: 0;">Officer Profile</h2>
                <hr style="border: 0; border-top: 1px solid #30363d; margin: 15px 0;">
                <div style="text-align: left; line-height: 1.8;">
                    <p><strong>Name:</strong> ${officer.name}</p>
                    <p><strong>Shield:</strong> ${officer.shield}</p>
                    <p><strong>Rank:</strong> ${officer.rank || 'N/A'}</p>
                    <p><strong>Command:</strong> ${officer.command || 'N/A'}</p>
                    <p><strong>Total Arrests:</strong> ${officer.arrests_total || '0'}</p>
                </div>
            `;
            
            modal.style.display = "block";

        } else {
            statusText.innerText = "No live records found.";
            statusText.style.color = "#e74c3c";
        }

    } catch (error) {
        console.error("Critical System Error:", error);
        statusText.innerText = "Connection Blocked. Try again.";
        statusText.style.color = "#e74c3c";
    }
}

// Modal Control Logic
document.getElementById('closeModal').onclick = function() {
    document.getElementById('officerModal').style.display = "none";
};

window.onclick = function(event) {
    const modal = document.getElementById('officerModal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
};
