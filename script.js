const CATALOG_FILE = 'games_catalog.json';
const gameListContainer = document.getElementById('game-list-container');
const tagFilterContainer = document.getElementById('tag-filter-container');
let allGamesData = [];

// --- Core Functions ---

/**
 * Fetches the game data and initializes the page.
 */
async function loadGameCatalog() {
    try {
        const response = await fetch(CATALOG_FILE);
        if (!response.ok) {
            throw new Error(`Failed to load catalog: ${response.statusText}`);
        }
        allGamesData = await response.json();
        
        // Remove loading message
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) loadingMessage.remove();

        renderGameList(allGamesData);
        populateTagFilters(allGamesData);

    } catch (error) {
        console.error("Error loading games:", error);
        gameListContainer.innerHTML = `<p style="color:red;">Error: Could not load game catalog. Check console for details.</p>`;
    }
}

/**
 * Renders the list of game cards based on the provided data.
 * @param {Array} games - The array of game objects to render.
 */
function renderGameList(games) {
    gameListContainer.innerHTML = ''; // Clear existing content

    if (games.length === 0) {
        gameListContainer.innerHTML = `<p>No games found matching the selected filter.</p>`;
        return;
    }

    // Small inline SVG placeholder (data URL) used when thumbnail missing
    const placeholderSvg = encodeURI(`data:image/svg+xml;utf8,
      <svg xmlns='http://www.w3.org/2000/svg' width='800' height='400'>
        <rect width='100%' height='100%' fill='%232c394b'/>
        <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%23b0b0b0' font-family='Segoe UI, Arial' font-size='24'>No image</text>
      </svg>
    `);

    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.setAttribute('data-tags', (game.tags || []).join(',')); // Add tags for filtering

        // Build the tags HTML for display on the card (handle missing tags)
        const tagsHtml = (game.tags || []).map(tag => `<span>${tag}</span>`).join('');

        // Create image element with onerror fallback to placeholder
        const img = document.createElement('img');
        img.className = 'game-thumbnail';
        img.alt = game.title || 'Game thumbnail';
        img.src = game.thumbnail || placeholderSvg;
        img.onerror = function() {
            // If image fails to load, replace with placeholder
            this.onerror = null; // prevent infinite loop
            this.src = placeholderSvg;
        };

        const content = document.createElement('div');
        content.className = 'card-content';
        content.innerHTML = `
            <h3>${game.title || 'Untitled'}</h3>
            <p>${game.description || ''}</p>
            <div class="card-tags">${tagsHtml}</div>
        `;

        const btnGroup = document.createElement('div');
        btnGroup.className = 'button-group';
        const playBtn = document.createElement('a');
        playBtn.className = 'play-button';
        playBtn.href = game.link || '#';
        playBtn.target = '_blank';
        playBtn.innerHTML = `<i class="fas fa-gamepad"></i> PLAY NOW`;

        const srcBtn = document.createElement('a');
        srcBtn.className = 'source-button';
        srcBtn.href = game.github_url || '#';
        srcBtn.target = '_blank';
        srcBtn.innerHTML = `<i class="fab fa-github"></i> Code`;

        btnGroup.appendChild(playBtn);
        btnGroup.appendChild(srcBtn);

        card.appendChild(img);
        card.appendChild(content);
        card.appendChild(btnGroup);

        gameListContainer.appendChild(card);
    });
}

/**
 * Extracts all unique tags and creates filter buttons.
 * @param {Array} games - The array of all game objects.
 */
function populateTagFilters(games) {
    let uniqueTags = new Set();
    
    // Collect all unique tags from all games
    games.forEach(game => {
        game.tags.forEach(tag => uniqueTags.add(tag));
    });

    // Create a button for each unique tag
    uniqueTags.forEach(tag => {
        const button = document.createElement('button');
        button.className = 'tag-filter';
        button.textContent = tag;
        button.setAttribute('data-tag', tag.toLowerCase());
        tagFilterContainer.appendChild(button);
    });

    // Add event listeners to the buttons
    tagFilterContainer.addEventListener('click', handleTagFilterClick);
}

/**
 * Handles the filtering logic when a tag button is clicked.
 * @param {Event} event - The click event.
 */
function handleTagFilterClick(event) {
    if (!event.target.classList.contains('tag-filter')) return;

    const clickedButton = event.target;
    const selectedTag = clickedButton.getAttribute('data-tag');

    // Remove 'active' class from all buttons
    document.querySelectorAll('.tag-filter').forEach(btn => btn.classList.remove('active'));
    
    // Add 'active' class to the clicked button
    clickedButton.classList.add('active');

    // Filter logic
    let filteredGames = [];
    if (selectedTag === 'all') {
        filteredGames = allGamesData;
    } else {
        filteredGames = allGamesData.filter(game => 
            game.tags.map(t => t.toLowerCase()).includes(selectedTag)
        );
    }

    renderGameList(filteredGames);
}

// Start the application
document.addEventListener('DOMContentLoaded', loadGameCatalog);