document.getElementById('mainBtn').addEventListener('click', function() {
    const shield = document.getElementById('badgeSearch').value;
    const results = document.getElementById('results');

    // Input Validation (5 digits is typical for NYPD shields)
    if (shield.length !== 5) {
        alert("Please enter a valid 5-digit shield number.");
        return;
    }

    // UI Feedback: Start the 45-second countdown
    this.innerText = "QUERYING NYC DATABASE...";
    this.disabled = true;
    showLoading();

    // -------------------------------------------------------------------------
    // Technical Implementation: The SODA API Call
    // -------------------------------------------------------------------------
    
    // 1. Defining the Endpoint (This is a public sample CCRB MOS dataset)
    const endpoint = 'https://data.cityofnewyork.us/resource/9yv4-mdfy.json';
    
    // 2. Formulating the SODA Query (using 'shield_no' as the filter)
    // IMPORTANT: Actual API field names (e.g., 'shield_no') must match the dataset.
    const queryUrl = `${endpoint}?shield_no=${shield}`;

// 1. Select the element
const myButton = document.querySelector('#my-button');

// 2. Check if it actually exists before adding the listener
if (myButton) {
    myButton.addEventListener('click', () => {
        console.log("Button was clicked successfully!");
    });
} else {
    console.warn("Element #my-button was not found in the DOM.");
}


    
    // 3. The Fetch Request
    fetch(queryUrl)
        .then(response => {
            if (!response.ok) {
                // If the response is not 200 OK, handle the error
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            return response.json(); // Convert response to JSON
        })
        .then(data => {
            // Success handler: We have data from the live API.
            handleApiSuccess(data);
        })
        .catch(error => {
            // Error handler: Handle network or dataset issues.
            handleApiError(shield, error);
        })
        .finally(() => {
            // Reset the button, regardless of success or failure.
            document.getElementById('mainBtn').innerText = "SEARCH DATA";
            document.getElementById('mainBtn').disabled = false;
        });
});

// -----------------------------------------------------------------------------
// Helper Functions for Data Display & Error Handling
// -----------------------------------------------------------------------------

function handleApiSuccess(data) {
    const results = document.getElementById('results');
    results.classList.remove('hidden');

    // Scenario 1: Shield number not found in this specific dataset.
    if (data.length === 0) {
        results.innerHTML = `
            <div class="officer-card low-risk">
                <h3 style="margin-top:0; color:#2ed573">NO RECORD FOUND</h3>
                <p>This shield # does not appear in the limited CCRB dataset.</p>
                <small style="opacity:0.5">Note: This dataset is not real-time.</small>
            </div>
        `;
        return;
    }

    // Scenario 2: Data successfully found (mapping real API fields)
    const officer = data[0]; // Take the first result
    const hasComplaints = officer.allegations_count > 0;
    const riskStatus = hasComplaints ? "high-risk" : "low-risk";
    const statusColor = hasComplaints ? "#ff4757" : "#2ed573";
    const statusText = hasComplaints ? "ACTIVE CCRB HISTORY" : "NO KNOWN DISCIPLINARY RECORD";

    results.innerHTML = `
        <div class="officer-card ${riskStatus}">
            <h3 style="margin-top:0">DATA FOUND</h3>
            <p><strong>Name:</strong> ${officer.first_name} ${officer.last_name}</p>
            <p><strong>Status:</strong> <span style="color:${statusColor}">${statusText}</span></p>
            <p><strong>Command/Precinct:</strong> ${officer.current_command}</p>
            <p><strong>CCRB Complaints:</strong> ${officer.allegations_count}</p>
            <p><strong>Substantiated Allegations:</strong> ${officer.substantiated_count || 0}</p>
            <small style="opacity:0.5">Verified Source: NYC Open Data / CCRB MOS Records</small>
        </div>
    `;
}

function handleApiError(shield, error) {
    console.error("ShieldCheck Error:", error);
    const results = document.getElementById('results');
    results.classList.remove('hidden');
    results.innerHTML = `
        <div class="officer-card high-risk">
            <h3 style="margin-top:0">API CONNECTION ERROR</h3>
            <p>Could not connect to the NYC Open Data endpoint.</p>
            <p><small>${error.message}</small></p>
            <small style="opacity:0.5">Retry search in a moment.</small>
        </div>
    `;
}

function showLoading() {
    document.getElementById('results').innerHTML = `<p style="text-align:center; opacity:0.6;">Connecting to NYC Data...</p>`;
    document.getElementById('results').classList.remove('hidden');
} 
