// PrimeVerse Bookmarks, Likes & History Controller
const BookmarksManager = {
    BOOKMARKS_KEY: "primeverse_bookmarks",
    LIKES_KEY: "primeverse_likes",
    RECENT_KEY: "primeverse_recent",

    // --- Bookmarks ---
    getBookmarks() {
        const data = localStorage.getItem(this.BOOKMARKS_KEY);
        return data ? JSON.parse(data) : [];
    },

    isBookmarked(id) {
        return this.getBookmarks().includes(id);
    },

    toggleBookmark(id) {
        let list = this.getBookmarks();
        const index = list.indexOf(id);
        let bookmarked = false;

        if (index > -1) {
            list.splice(index, 1);
        } else {
            list.push(id);
            bookmarked = true;
        }

        localStorage.setItem(this.BOOKMARKS_KEY, JSON.stringify(list));
        
        // Dispatch custom event to notify other scripts
        window.dispatchEvent(new CustomEvent("bookmarksUpdated", { detail: { id, bookmarked } }));
        return bookmarked;
    },

    // --- Likes ---
    getLikes() {
        const data = localStorage.getItem(this.LIKES_KEY);
        return data ? JSON.parse(data) : [];
    },

    isLiked(id) {
        return this.getLikes().includes(id);
    },

    toggleLike(id) {
        let list = this.getLikes();
        const index = list.indexOf(id);
        let liked = false;

        if (index > -1) {
            list.splice(index, 1);
        } else {
            list.push(id);
            liked = true;
        }

        localStorage.setItem(this.LIKES_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent("likesUpdated", { detail: { id, liked } }));
        return liked;
    },

    // --- History (Recently Viewed) ---
    getRecent() {
        const data = localStorage.getItem(this.RECENT_KEY);
        return data ? JSON.parse(data) : [];
    },

    addRecent(id) {
        let list = this.getRecent();
        // Remove existing if any, to put at front
        list = list.filter(item => item !== id);
        list.unshift(id);
        
        // Limit to 4 recent entries
        if (list.length > 4) {
            list.pop();
        }
        
        localStorage.setItem(this.RECENT_KEY, JSON.stringify(list));
        window.dispatchEvent(new CustomEvent("recentUpdated", { detail: { list } }));
    }
};

// Auto-bind dynamic bookmarks & likes button actions in DOM
document.addEventListener("DOMContentLoaded", () => {
    // Global Event Listener for Bookmarks Toggling via Class
    document.addEventListener("click", (e) => {
        const bookmarkBtn = e.target.closest(".btn-bookmark-toggle");
        if (bookmarkBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = bookmarkBtn.dataset.id;
            if (id) {
                BookmarksManager.toggleBookmark(id);
            }
        }

        const likeBtn = e.target.closest(".btn-like-toggle");
        if (likeBtn) {
            e.preventDefault();
            e.stopPropagation();
            const id = likeBtn.dataset.id;
            if (id) {
                BookmarksManager.toggleLike(id);
            }
        }
    });

    // Helper to sync single buttons when loaded
    document.querySelectorAll(".btn-bookmark-toggle").forEach(btn => {
        const id = btn.dataset.id;
        if (id) {
            updateBookmarkButtonUI(btn, BookmarksManager.isBookmarked(id));
        }
    });

    document.querySelectorAll(".btn-like-toggle").forEach(btn => {
        const id = btn.dataset.id;
        if (id) {
            updateLikeButtonUI(btn, BookmarksManager.isLiked(id));
        }
    });

    // Sync all matching elements surgically when changes occur (supports duplicate buttons)
    window.addEventListener("bookmarksUpdated", (e) => {
        const { id, bookmarked } = e.detail;
        document.querySelectorAll(`.btn-bookmark-toggle[data-id="${id}"]`).forEach(btn => {
            updateBookmarkButtonUI(btn, bookmarked);
        });
    });

    window.addEventListener("likesUpdated", (e) => {
        const { id, liked } = e.detail;
        document.querySelectorAll(`.btn-like-toggle[data-id="${id}"]`).forEach(btn => {
            updateLikeButtonUI(btn, liked);
        });
    });
});


function updateBookmarkButtonUI(btn, isBookmarked) {
    const icon = btn.querySelector("i");
    if (icon) {
        if (isBookmarked) {
            icon.className = "bi bi-bookmark-fill text-primary";
        } else {
            icon.className = "bi bi-bookmark";
        }
    }
    // Tooltip update if applicable
    btn.setAttribute("title", isBookmarked ? "Remove Bookmark" : "Bookmark Article");
}

function updateLikeButtonUI(btn, isLiked) {
    const icon = btn.querySelector("i");
    const countSpan = btn.querySelector(".like-count");
    
    if (icon) {
        if (isLiked) {
            icon.className = "bi bi-heart-fill text-danger animate-pulse";
        } else {
            icon.className = "bi bi-heart";
        }
    }

    if (countSpan && btn.dataset.baseLikes) {
        const base = parseInt(btn.dataset.baseLikes, 10) || 0;
        countSpan.textContent = isLiked ? base + 1 : base;
    }
}
