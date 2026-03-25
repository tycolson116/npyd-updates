// 1. Use the EXACT ID from your HTML ('searchBtn')
const searchButton = document.getElementById('searchBtn');

// 2. Add a check to make sure the button was found
if (searchButton) {
    searchButton.addEventListener('click', () => {
        console.log("Button clicked! Connecting to database...");
        handleSearch(); 
    });
} else {
    // This will help you debug if the ID is still wrong
    console.error("Error: Could not find the button with ID 'searchBtn'");
}

function handleSearch() {
    const name = document.getElementById('searchName').value;
    const badge = document.getElementById('searchBadge').value;
    
    // This is where you'll see your inputs in the console
    console.log(`Searching database for Officer: ${name}, Badge: ${badge}`);
}
