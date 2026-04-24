document.getElementById('searchBtn').addEventListener('click', searchOfficer);

async function searchOfficer() {
    const nameInput = document.getElementById('nameInput').value.trim().toUpperCase();
    const shieldInput = document.getElementById('shieldInput').value.trim();
    
    const statusText = document.getElementById('statusText');
    const modal = document.getElementById('officerModal');
    const modalBody = document.getElementById('modalBody');

    statusText.innerText = "Connecting to NYC Open Data...";
    statusText.style.color = "#8b949e";

    const apiEndpoint = `https://data.cityofnewyork.us/resource/pmsy-ewrc.json`;
    
    // BUILD THE QUERY DYNAMICALLY
    // This avoids sending empty "shield=&" which causes the 400 error
    let queryParams = [];

    if (shieldInput) {
        queryParams.push(`shield=${encodeURIComponent(shieldInput)}`);
    }
    
    if (nameInput) {
        // Correctly formatted $where clause for Socrata
        queryParams.push(`$where=name LIKE '%25${encodeURIComponent(nameInput)}%25'`);
    }

    const finalUrl = `${apiEndpoint}?${queryParams.join('&')}`;

    try {
        const response = await fetch(finalUrl);
        
        if (!response.ok) {
            // If the city returns a 400, this will help us see the actual error message
            const errorDetails = await response.text();
            console.error("API Error Details:", errorDetails);
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
                    <p><strong>Shield:</strong> ${officer.shield || 'N/A'}</p>
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
        statusText.innerText = "Search Failed. Check inputs and try again.";
        statusText.style.color = "#e74c3c";
    }
}
