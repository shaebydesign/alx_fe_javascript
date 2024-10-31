let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Do not wait to strike till the iron is hot, but make it hot by striking.", category: "Action" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Inspiration" }
];

const API_URL = "https://jsonplaceholder.typicode.com/posts";

function loadQuotes() {
    const storedQuotes = localStorage.getItem('quotes');
    if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
    }
}

function saveQuotes() {
    localStorage.setItem('quotes', JSON.stringify(quotes));
}

function populateCategories() {
    const categoryFilter = document.getElementById("categoryFilter");
    const categories = [...new Set(quotes.map(quote => quote.category))]; // Extract unique categories

    categories.forEach(category => {
        const option = document.createElement("option");
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
    });

    const lastCategory = localStorage.getItem('lastCategory') || 'all';
    categoryFilter.value = lastCategory;
}

function showRandomQuote() {
    const filteredQuotes = filterByCategory();
    if (filteredQuotes.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
        const quote = filteredQuotes[randomIndex];
        const quoteDisplay = document.getElementById("quoteDisplay");
        quoteDisplay.innerHTML = `"${quote.text}" - <strong>${quote.category}</strong>`;
    } else {
        document.getElementById("quoteDisplay").innerHTML = "No quotes available for this category.";
    }
}

function filterQuotes() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    localStorage.setItem('lastCategory', selectedCategory); // Save last selected category
    showRandomQuote(); // Update displayed quote
}

function filterByCategory() {
    const selectedCategory = document.getElementById("categoryFilter").value;
    return selectedCategory === 'all' ? quotes : quotes.filter(quote => quote.category === selectedCategory);
}

function createAddQuoteForm() {
    const formContainer = document.getElementById("newQuoteForm");
    const quoteInput = document.createElement("input");
    quoteInput.id = "newQuoteText";
    quoteInput.type = "text";
    quoteInput.placeholder = "Enter a new quote";

    const categoryInput = document.createElement("input");
    categoryInput.id = "newQuoteCategory";
    categoryInput.type = "text";
    categoryInput.placeholder = "Enter quote category";

    const addButton = document.createElement("button");
    addButton.innerText = "Add Quote";
    addButton.onclick = addQuote;
    formContainer.appendChild(quoteInput);
    formContainer.appendChild(categoryInput);
    formContainer.appendChild(addButton);
}


async function addQuote() {
    const newQuoteText = document.getElementById("newQuoteText").value;
    const newQuoteCategory = document.getElementById("newQuoteCategory").value;

    if (newQuoteText && newQuoteCategory) {
        const newQuote = { text: newQuoteText, category: newQuoteCategory };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newQuote)
            });

            if (response.ok) {
                quotes.push(newQuote);
                saveQuotes(); // Save to local storage
                document.getElementById("newQuoteText").value = '';
                document.getElementById("newQuoteCategory").value = '';
                showRandomQuote();
                alert('Quote added successfully!');
            } else {
                alert('Failed to add quote. Please try again.');
            }
        } catch (error) {
            console.error("Error adding quote:", error);
            alert('Failed to add quote. Please check your connection.');
        }

    } else {
        alert("Please enter both quote and category.");
    }

}

function exportQuotes() {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotes.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
    const fileReader = new FileReader();
    fileReader.onload = function(event) {
        const importedQuotes = JSON.parse(event.target.result);
        quotes.push(...importedQuotes);
        saveQuotes(); // Save updated quotes to local storage
        alert('Quotes imported successfully!');
        showRandomQuote(); // Show a new random quote
    };
    fileReader.readAsText(event.target.files[0]);
}

async function fetchQuotesFromServer() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        const fetchedQuotes = data.map(item => ({
            text: item.title,
            category: item.userId.toString() // Simulating categories with userId
        }));
        syncQuotes(fetchedQuotes);
    } catch (error) {
        console.error("Error fetching quotes:", error);
    }
}

function syncQuotes(fetchedQuotes) {
    const localQuotesSet = new Set(quotes.map(q => JSON.stringify(q)));
    const newQuotes = [];

    fetchedQuotes.forEach(fetchedQuote => {
        if (!localQuotesSet.has(JSON.stringify(fetchedQuote))) {
            newQuotes.push(fetchedQuote);
        }
    });

    if (newQuotes.length > 0) {
        quotes.push(...newQuotes);
        saveQuotes();
        showConflictNotification(newQuotes);
    }
}

function showConflictNotification(newQuotes) {
    const notification = document.createElement("div");
    notification.innerText = `${newQuotes.length} new quotes added from the server.`;
    notification.style.backgroundColor = "#f0c36d";
    notification.style.padding = "10px";
    notification.style.margin = "10px 0";
    document.body.prepend(notification);
}

setInterval(fetchQuotesFromServer, 30000);

function syncQuotes(fetchedQuotes) {
    const localQuotesSet = new Set(quotes.map(q => JSON.stringify(q)));
    const newQuotes = [];

    fetchedQuotes.forEach(fetchedQuote => {
        if (!localQuotesSet.has(JSON.stringify(fetchedQuote))) {
            newQuotes.push(fetchedQuote);
        }
    });

    if (newQuotes.length > 0) {
        quotes.push(...newQuotes);
        saveQuotes();
        showConflictNotification(newQuotes);
        alert('Quotes synced with server!'); // Notify user about the sync
    }
}

// Show notification for new quotes
function showConflictNotification(newQuotes) {
    const notification = document.createElement("div");
    notification.innerText = `${newQuotes.length} new quotes added from the server.`;
    notification.style.backgroundColor = "#f0c36d";
    notification.style.padding = "10px";
    notification.style.margin = "10px 0";
    document.body.prepend(notification);

    // Automatically remove the notification after a few seconds
    setTimeout(() => {
        notification.remove();
    }, 5000); // Notification will disappear after 5 seconds
}


document.getElementById("newQuote").addEventListener("click", showRandomQuote);
document.getElementById("exportButton").addEventListener("click", exportQuotes);
document.getElementById("importFile").addEventListener("change", importFromJsonFile);

loadQuotes();
createAddQuoteForm();
populateCategories();
showRandomQuote();
