// PrimeVerse Live Search & Filters Controller
const SearchManager = {
    // Generate article card HTML template
    createCardHTML(article) {
        const initials = article.author.split(' ').map(n => n[0]).join('');
        const difficultyClass = `badge-${article.difficulty.toLowerCase()}`;
        const isBookmarked = BookmarksManager.isBookmarked(article.id);
        const isLiked = BookmarksManager.isLiked(article.id);
        
        const bookmarkIcon = isBookmarked ? "bi bi-bookmark-fill text-primary" : "bi bi-bookmark";
        const likeIcon = isLiked ? "bi bi-heart-fill text-danger animate-pulse" : "bi bi-heart";
        const currentLikes = isLiked ? article.likes + 1 : article.likes;

        return `
            <div class="col-md-6 col-lg-4 mb-4 article-card-wrapper" data-category="${article.category}" data-difficulty="${article.difficulty}" data-views="${article.views}" data-likes="${article.likes}" data-date="${new Date(article.publishDate).getTime()}">
                <div class="glass-panel article-card h-100" data-aos="fade-up">
                    <div class="card-img-wrapper">
                        <img src="${article.coverImage}" alt="${article.title}" loading="lazy">
                        <span class="position-absolute top-0 end-0 m-3 badge badge-difficulty ${difficultyClass}">${article.difficulty}</span>
                    </div>
                    <div class="card-content d-flex flex-column">
                        <span class="badge-category align-self-start mb-2">${article.category}</span>
                        <h3 class="card-title"><a href="${article.url}">${article.title}</a></h3>
                        <p class="card-desc flex-grow-1">${article.description}</p>
                        
                        <div class="d-flex align-items-center mb-3">
                            <div class="avatar me-2 rounded-circle d-flex align-items-center justify-content-center text-white" style="width: 36px; height: 36px; background: var(--accent-gradient); font-size: 0.8rem; font-weight: 700;">
                                ${initials}
                            </div>
                            <div>
                                <small class="d-block fw-bold" style="color: var(--text-primary); font-size: 0.85rem;">${article.author}</small>
                                <small class="text-muted" style="font-size: 0.75rem;">${article.publishDate} &bull; ${article.readingTime}</small>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center border-top pt-3 card-meta mt-auto">
                            <div>
                                <span class="meta-item"><i class="bi bi-eye"></i> ${article.views}</span>
                            </div>
                            <div class="d-flex gap-1 align-items-center">
                                <button class="btn-icon btn-like-toggle" data-id="${article.id}" data-base-likes="${article.likes}" title="Like Article">
                                    <i class="${likeIcon}"></i> <span class="like-count ms-1">${currentLikes}</span>
                                </button>
                                <button class="btn-icon btn-bookmark-toggle" data-id="${article.id}" title="Bookmark Article">
                                    <i class="${bookmarkIcon}"></i>
                                </button>
                                <a href="${article.url}" class="btn btn-sm btn-premium ms-2 rounded-pill px-3">Read</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // Render articles in targeted element
    renderArticles(articles, container) {
        if (!container) return;
        
        if (articles.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
                    <h4 class="mt-3 text-secondary">No articles found</h4>
                    <p class="text-muted">Try adjusting your filters or search terms.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = articles.map(article => this.createCardHTML(article)).join('');
        
        // Re-initialize AOS to animate the newly inserted cards
        if (typeof AOS !== 'undefined') {
            AOS.refreshHard();
        }
    },

    // Filter and Sort database articles
    filterAndSort(query = "", category = "all", sortBy = "latest") {
        let results = [...PrimeVerseArticles];

        // 1. Filter by category
        if (category && category !== "all") {
            results = results.filter(a => a.category.toLowerCase() === category.toLowerCase());
        }

        // 2. Filter by search query (title, author, description, category)
        if (query) {
            const q = query.toLowerCase().trim();
            results = results.filter(a => 
                a.title.toLowerCase().includes(q) || 
                a.description.toLowerCase().includes(q) || 
                a.author.toLowerCase().includes(q) || 
                a.category.toLowerCase().includes(q)
            );
        }

        // 3. Sort results
        if (sortBy === "latest") {
            results.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        } else if (sortBy === "popular") {
            results.sort((a, b) => b.views - a.views);
        } else if (sortBy === "likes") {
            results.sort((a, b) => b.likes - a.likes);
        } else if (sortBy === "difficulty") {
            const difficultyWeight = { "Easy": 1, "Medium": 2, "Hard": 3 };
            results.sort((a, b) => difficultyWeight[b.difficulty] - difficultyWeight[a.difficulty]);
        }

        return results;
    }
};

// Bind elements on Catalog Page
document.addEventListener("DOMContentLoaded", () => {
    const catalogContainer = document.getElementById("articlesCatalogGrid");
    if (!catalogContainer) return; // Only execute on pages with this container (articles.html)

    const searchInput = document.getElementById("catalogSearchInput");
    const categoryFilterSelect = document.getElementById("catalogCategorySelect");
    const sortSelect = document.getElementById("catalogSortSelect");
    
    // Parse URL parameters for initial filters (e.g. from homepage search)
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get("q") || "";
    const initialCategory = urlParams.get("cat") || "all";

    if (searchInput) searchInput.value = initialQuery;
    
    // Setup initial Category pill active state if category filters exist as pills
    const categoryPills = document.querySelectorAll(".category-pill");
    let currentCategory = initialCategory;

    if (categoryPills.length > 0) {
        categoryPills.forEach(pill => {
            const catVal = pill.dataset.category || "all";
            if (catVal.toLowerCase() === currentCategory.toLowerCase()) {
                pill.classList.add("active");
            } else {
                pill.classList.remove("active");
            }
        });
    }

    // Perform initial render
    function runFiltering() {
        const query = searchInput ? searchInput.value : "";
        const sortBy = sortSelect ? sortSelect.value : "latest";
        
        const filtered = SearchManager.filterAndSort(query, currentCategory, sortBy);
        SearchManager.renderArticles(filtered, catalogContainer);
    }

    // Bind event listeners
    if (searchInput) {
        searchInput.addEventListener("input", runFiltering);
    }
    
    if (sortSelect) {
        sortSelect.addEventListener("change", runFiltering);
    }

    if (categoryPills.length > 0) {
        categoryPills.forEach(pill => {
            pill.addEventListener("click", (e) => {
                e.preventDefault();
                categoryPills.forEach(p => p.classList.remove("active"));
                pill.classList.add("active");
                currentCategory = pill.dataset.category || "all";
                runFiltering();
                
                // Update URL parameters without reloading
                const url = new URL(window.location);
                url.searchParams.set("cat", currentCategory);
                window.history.pushState({}, '', url);
            });
        });
    }

    // Set initial run
    runFiltering();

    // Re-sync UI state when bookmarks/likes update in storage
    window.addEventListener("bookmarksUpdated", runFiltering);
    window.addEventListener("likesUpdated", runFiltering);
});
