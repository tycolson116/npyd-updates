import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// IMPORTANT: Replace with your actual Supabase URL and Anon Key
https://lcfezxfcljjztutbuonk.supabase.co // Your Supabase Project URL
sb_publishable_3XzU5p7x061I67j5_A5ong_SpcSRAOO // Your Supabase Public Anon Key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Get references to DOM elements
const nameInput = document.getElementById('searchName');
const badgeInput = document.getElementById('searchBadge');
const resultsDiv = document.getElementById('results');
const searchButton = document.getElementById('searchBtn'); // Assuming your button has id="searchBtn"

// Function to find an officer
async function findOfficer() {
    resultsDiv.innerHTML = ''; // Clear previous results and any error messages

    const nameValue = nameInput.value.trim();
    const badgeValue = badgeInput.value.trim();

    // Basic client-side validation
    if (!nameValue && !badgeValue) {
        resultsDiv.innerHTML = '<p class="error-message">Please enter an officer\'s last name or badge number to search.</p>';
        console.error("Search attempted with no input.");
        return; // Stop the function if no input is provided
    }

    try {
        let query = supabase
            .from('civilian_complaint_review_board_officers') // Ensure this is your exact table name
            .select('*'); // Select all columns for initial debugging, then refine

        let conditions = [];

        if (nameValue) {
            // Case-insensitive search for last name
            // IMPORTANT: Verify 'officer_last_name' is the correct column name in your Supabase table
            conditions.push(`officer_last_name.ilike.%${nameValue}%`);
        }

        if (badgeValue) {
            // Exact match for badge number
            // IMPORTANT: Verify 'shield_no' is the correct column name in your Supabase table
            conditions.push(`shield_no.eq.${badgeValue}`);
        }

        // Combine conditions using 'and' for multiple filters, or 'or' if you prefer
        // For this scenario, an 'AND' is usually desired if both are provided
        if (conditions.length > 0) {
            query = query.filter(conditions.join(',')); // Supabase filter method
        }

        console.log("Supabase Query Being Sent:", query.url); // Log the constructed query URL

        const { data, error } = await query;

        if (error) {
            console.error("Supabase Query Error:", error);
            resultsDiv.innerHTML = `<p class="error-message">Error fetching officer data: ${error.message}. Please check your Supabase setup and network connection.</p>`;
            return;
        }

        if (data && data.length > 0) {
            console.log("Officer Data Received:", data); // Log the data received
            resultsDiv.innerHTML = data.map(officer => `
                <div class="officer-card">
                    <!-- IMPORTANT: Verify these column names against your Supabase table -->
                    <h3>${officer.officer_first_name || 'N/A'} ${officer.officer_last_name || 'N/A'}</h3>
                    <p><strong>Rank:</strong> ${officer.officer_current_rank_abbreviation || 'N/A'}</p>
                    <p><strong>Shield No:</strong> ${officer.shield_no || 'N/A'}</p>
                    <p><strong>Command:</strong> ${officer.officer_current_command || 'N/A'}</p>
                </div>
            `).join('');
        } else {
            resultsDiv.innerHTML = '<p class="info-message">No officer found with that information. Please check your spelling or badge number.</p>';
            console.log("No officer found for input:", { name: nameValue, badge: badgeValue });
        }
    } catch (e) {
        console.error("An unexpected error occurred:", e);
        resultsDiv.innerHTML = `<p class="error-message">An unexpected error occurred: ${e.message}</p>`;
    }
}

// Attach the event listener to the search button
searchButton.addEventListener('click', findOfficer);

// Optional: Add a small CSS style for error messages (you can add this to styles.css)
/*
.error-message {
    color: #ff4d4d;
    font-weight: bold;
    margin-top: 10px;
}
.info-message {
    color: #6daffc;
    margin-top: 10px;
}
*/
