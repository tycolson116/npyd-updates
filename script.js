document.getElementById('searchBtn').addEventListener('click', function() {
    const query = document.getElementById('officerInput').value;
    const resultsArea = document.getElementById('resultsArea');

    // Simulate an API Fetch to NYC Open Data
    if (query) {
        showLoading();
        setTimeout(() => {
            renderOfficer(query);
        }, 600); // Simulated delay
    }
});

function renderOfficer(shield) {
    const resultsArea = document.getElementById('resultsArea');
    resultsArea.classList.remove('hidden');
    
    // Example Mock Data Object
    const mockData = {
        name: "Officer John Doe",
        precinct: "75th Precinct (Brooklyn)",
        complaints: 14,
        status: "High Risk",
        lawsuits: "$120,000 Payout History"
    };

    resultsArea.innerHTML = `
        <div class="officer-result high-risk">
            <h2>${mockData.name}</h2>
            <p><strong>Assignment:</strong> ${mockData.precinct}</p>
            <p><strong>CCRB Complaints:</strong> ${mockData.complaints}</p>
            <p><strong>Legal History:</strong> ${mockData.lawsuits}</p>
            <small>Data Source: NYC OpenData 2024-2026</small>
        </div>
    `;
}

function showLoading() {
    document.getElementById('resultsArea').innerHTML = "<p>Querying NYC Database...</p>";
    document.getElementById('resultsArea').classList.remove('hidden');
}
