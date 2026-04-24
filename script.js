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

    // 2. LIVE DATASET: NYPD Officer Profile - Members of Service (ID: pmsy-ewrc)
    const apiEndpoint = `https://data.cityofnewyork.us/resource/pmsy-ewrc.json`;
    
    // Query logic: Searches for name anywhere in the string and exact shield match
    const query = `?$where=name LIKE '%${nameInput}%' AND shield='${shieldInput}'`;

    try {
        const response = await fetch(apiEndpoint + query);
        
        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const officer = data[0];
            statusText.innerText = "Officer Found!";
            statusText.style.color = "#2ecc71";

            // Inject data into the Pop-up
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
        statusText.innerText = "System Error: Check connection.";
        statusText.style.color = "#e74c3c";
    }
} // <--- This was likely the missing bracket!

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
