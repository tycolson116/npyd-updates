// 1. Reference the elements
const searchBtn = document.getElementById('searchBtn');
const nameInput = document.getElementById('searchName');
const badgeInput = document.getElementById('searchBadge');
const resultsDiv = document.getElementById('results');

// 2. Add the Event Listener
if (searchBtn) {
    searchBtn.addEventListener('click', () => {
        const name = nameInput.value;
        const badge = badgeInput.value;
        
        console.log("Button clicked! Searching for:", name, badge);
        
        // Trigger your database search function here
        fetchOfficerData(name, badge);
    });
}

// 3. Your Database Function
async function fetchOfficerData(name, badge) {
    resultsDiv.innerHTML = "Searching database...";
    
    // This is where you will add your Supabase or API call logic
    // Example: 
    // const { data, error } = await supabase.from('officers').select('*').eq('badge', badge);
}
