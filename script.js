document.getElementById('searchBtn').addEventListener('click', searchOfficer);

async function searchOfficer() {
    // 1. Get and Format Inputs
    const nameInput = document.getElementById('nameInput').value.trim().toUpperCase();
    const shieldInput = document.getElementById('shieldInput').value.trim();
    
    const statusText = document.getElementById('statusText');
    const modal = document.getElementById('officerModal');
    const modalBody = document.getElementById('modalBody');

    // 2. Clear UI & Set Loading State
    statusText.innerText = "Searching NYC Database...";
    
    // UPDATED API ENDPOINT: Using the stable Payroll/Active dataset
    const apiEndpoint = `https://data.cityofnewyork.us/resource/59kj-x869.json`;
    
    // In this specific dataset, the field is 'shield', not 'shield_no'
    const query = `?first_name=${nameInput}&shield=${shieldInput}`;

    try {
        const response = await fetch(apiEndpoint + query);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Data received:", data); // Helpful for your console debugging

        if (data && data.length > 0) {
            const officer = data[0];
            statusText.innerText = "Officer Found!";

            // 3. Populate the Pop-up (Modal)
            // Note: Field names change slightly per dataset (e.g., agency_name)
            modalBody.innerHTML = `
                <h2 style="color: #58a6ff; margin-top: 0;">Officer Profile</h2>
                <hr style="border: 0; border-top: 1px solid #30363d; margin: 15px 0;">
                <p><strong>Full Name:</strong> ${officer.first_name} ${officer.last_name}</p>
                <p><strong>Shield Number:</strong> ${officer.shield}</p>
                <p><strong>Title/Rank:</strong> ${officer.title_description || 'N/A'}</p>
                <p><strong>Command:</strong> ${officer.agency_name || 'NYPD'}</p>
                <p><strong>Fiscal Year:</strong> ${officer.fiscal_year || 'Current'}</p>
            `;
            
            // Show the Pop-up
            modal.style.display = "block";
        } else {
            statusText.innerText = "No live records found.";
            alert(`No officer found matching Name: ${nameInput} and Shield: ${shieldInput}. Check the numbers and try again.`);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
        statusText.innerText = "Error: Dataset unavailable or network issue.";
    }
}

// Logic to close the pop-up
document.getElementById('closeModal').onclick = function() {
    document.getElementById('officer
