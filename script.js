document.getElementById('searchBtn').addEventListener('click', searchOfficer);

async function searchOfficer() {
    const nameInput = document.getElementById('nameInput').value.toUpperCase().trim();
    const shieldInput = document.getElementById('shieldInput').value.trim();
    const statusText = document.getElementById('statusText');
    const modal = document.getElementById('officerModal');
    const modalBody = document.getElementById('modalBody');

    // NYC Open Data - NYPD Active Officers Endpoint
    // Note: Dataset IDs can change; '833y-7zab' is a common one for NYPD payroll/active
    const apiEndpoint = `https://data.cityofnewyork.us/resource/833y-7zab.json`;
    
    // Building the query string
    const query = `?first_name=${nameInput}&shield_no=${shieldInput}`;

    statusText.innerText = "Searching...";

    try {
        const response = await fetch(apiEndpoint + query);
        const data = await response.json();

        if (data.length > 0) {
            const officer = data[0];
            statusText.innerText = "Record Found!";
            
            // Populating the Modal (Pop-up)
            modalBody.innerHTML = `
                <h2 style="color: #2ecc71;">Officer Found</h2>
                <hr>
                <p><strong>Name:</strong> ${officer.first_name} ${officer.last_name}</p>
                <p><strong>Shield:</strong> ${officer.shield_no}</p>
                <p><strong>Rank:</strong> ${officer.rank_incident_grade || 'N/A'}</p>
                <p><strong>Command:</strong> ${officer.command_descr || 'N/A'}</p>
                <p><strong>Status:</strong> Active</p>
            `;
            modal.style.display = "block";
        } else {
            statusText.innerText = "No live records found. Check spelling/shield.";
        }
    } catch (error) {
        console.error("Error fetching data:", error);
        statusText.innerText = "Error connecting to NYC Data.";
    }
}

// Close Modal Logic
document.querySelector('.close-btn').onclick = function() {
    document.getElementById('officerModal').style.display = "none";
}

window.onclick = function(event) {
    if (event.target == document.getElementById('officerModal')) {
        document.getElementById('officerModal').style.display = "none";
    }
}
