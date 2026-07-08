// PrimeVerse Global Application Controller
document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize AOS Animation Library
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            once: true,
            easing: 'ease-out-cubic'
        });
    }

    // 2. Throttled Sticky Navbar and Scroll Progress
    const navbar = document.querySelector(".navbar");
    const progressBar = document.getElementById("readingProgressBar");
    const backToTopBtn = document.getElementById("backToTop");

    let lastScrollY = 0;
    let scrollTicking = false;

    function updateScrollElements() {
        const scrollTop = lastScrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        // Sticky Navbar styling - check before mutating classes
        if (navbar) {
            if (scrollTop > 50) {
                if (!navbar.classList.contains("shadow")) {
                    navbar.classList.add("shadow", "py-2");
                    navbar.classList.remove("py-3");
                }
            } else {
                if (navbar.classList.contains("shadow")) {
                    navbar.classList.remove("shadow", "py-2");
                    navbar.classList.add("py-3");
                }
            }
        }

        // Reading progress percentage
        if (progressBar && docHeight > 0) {
            const scrollPercent = Math.min((scrollTop / docHeight) * 100, 100);
            progressBar.style.width = scrollPercent + "%";
        }

        // Back to Top button visibility - check before mutating classes
        if (backToTopBtn) {
            if (scrollTop > 400) {
                if (!backToTopBtn.classList.contains("show")) {
                    backToTopBtn.classList.add("show");
                }
            } else {
                if (backToTopBtn.classList.contains("show")) {
                    backToTopBtn.classList.remove("show");
                }
            }
        }
        
        scrollTicking = false;
    }

    window.addEventListener("scroll", () => {
        lastScrollY = window.scrollY;
        if (!scrollTicking) {
            window.requestAnimationFrame(updateScrollElements);
            scrollTicking = true;
        }
    }, { passive: true });

    // Smooth scroll back to top
    if (backToTopBtn) {
        backToTopBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }

    // 3. Stats Counter Animation via requestAnimationFrame
    const statsSection = document.getElementById("statisticsSection");
    if (statsSection) {
        const counters = statsSection.querySelectorAll(".counter-value");
        const animationDuration = 1200; // 1.2 seconds

        const animateCounters = () => {
            let startTime = null;

            const step = (timestamp) => {
                if (!startTime) startTime = timestamp;
                const progress = Math.min((timestamp - startTime) / animationDuration, 1);

                counters.forEach(counter => {
                    const target = parseInt(counter.dataset.target, 10);
                    const currentVal = Math.floor(progress * target);
                    counter.innerText = currentVal.toLocaleString() + (counter.dataset.suffix || "");
                });

                if (progress < 1) {
                    window.requestAnimationFrame(step);
                } else {
                    // Make sure target is exactly reached at completion
                    counters.forEach(counter => {
                        const target = parseInt(counter.dataset.target, 10);
                        counter.innerText = target.toLocaleString() + (counter.dataset.suffix || "");
                    });
                }
            };

            window.requestAnimationFrame(step);
        };

        // Scroll listener to start counters when visible
        let animated = false;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    animateCounters();
                    animated = true;
                }
            });
        }, { threshold: 0.3 });

        observer.observe(statsSection);
    }

    // 4. Newsletter Form Submission
    const newsletterForm = document.getElementById("newsletterForm");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector("input[type='email']");
            if (emailInput && emailInput.value) {
                // Show a modern custom alert instead of standard alert
                showToast(`Thank you for subscribing, ${emailInput.value}! Welcome to PrimeVerse!`, "success");
                emailInput.value = "";
            }
        });
    }

    // 5. Share Button (Clipboard copy)
    document.addEventListener("click", (e) => {
        const shareBtn = e.target.closest(".btn-share-link");
        if (shareBtn) {
            e.preventDefault();
            const textToCopy = shareBtn.dataset.url || window.location.href;
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast("Link copied to clipboard!", "success");
            }).catch(err => {
                console.error("Could not copy link: ", err);
            });
        }
    });

    // 6. Article Details: Local Storage Comments System
    const commentsSection = document.getElementById("commentsSection");
    if (commentsSection) {
        const articleId = commentsSection.dataset.articleId;
        const commentForm = document.getElementById("commentForm");
        const commentsListContainer = document.getElementById("commentsList");

        if (articleId && commentForm && commentsListContainer) {
            const COMMENTS_STORAGE_PREFIX = "primeverse_comments_";

            const loadComments = () => {
                const data = localStorage.getItem(COMMENTS_STORAGE_PREFIX + articleId);
                return data ? JSON.parse(data) : [];
            };

            const saveComments = (comments) => {
                localStorage.setItem(COMMENTS_STORAGE_PREFIX + articleId, JSON.stringify(comments));
            };

            const renderComments = () => {
                const comments = loadComments();
                if (comments.length === 0) {
                    commentsListContainer.innerHTML = `
                        <div class="text-center py-4 text-muted">
                            <i class="bi bi-chat-left-text" style="font-size: 2rem;"></i>
                            <p class="mt-2 mb-0">No comments yet. Be the first to share your thoughts!</p>
                        </div>
                    `;
                    return;
                }

                commentsListContainer.innerHTML = comments.map(c => `
                    <div class="comment-card glass-panel p-3 mb-3" style="border-radius: 12px;">
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <div class="d-flex align-items-center">
                                <div class="avatar rounded-circle d-flex align-items-center justify-content-center text-white bg-primary me-2" style="width: 32px; height: 32px; font-size: 0.8rem; font-weight: bold;">
                                    ${c.author.charAt(0).toUpperCase()}
                                </div>
                                <h6 class="mb-0 fw-bold">${c.author}</h6>
                            </div>
                            <small class="text-muted" style="font-size: 0.75rem;">${c.date}</small>
                        </div>
                        <p class="mb-0 text-secondary" style="font-size: 0.9rem; padding-left: 40px;">${c.message}</p>
                    </div>
                `).join('');
            };

            // Form Submit Event
            commentForm.addEventListener("submit", (e) => {
                e.preventDefault();
                const nameInput = document.getElementById("commentName");
                const messageInput = document.getElementById("commentMessage");

                if (nameInput.value.trim() && messageInput.value.trim()) {
                    const comments = loadComments();
                    comments.unshift({
                        author: nameInput.value.trim(),
                        message: messageInput.value.trim(),
                        date: new Date().toLocaleDateString(undefined, { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
                    });
                    
                    saveComments(comments);
                    renderComments();
                    
                    // Reset fields
                    nameInput.value = "";
                    messageInput.value = "";
                    
                    showToast("Comment posted successfully!", "success");
                }
            });

            // Initial Comments Render
            renderComments();
        }
    }

    // 7. Track History (Recently Viewed Articles)
    const currentArticleElement = document.getElementById("currentArticleMarker");
    if (currentArticleElement) {
        const id = currentArticleElement.dataset.id;
        if (id) {
            BookmarksManager.addRecent(id);
        }
    }

    // Render recently viewed articles if a container exists
    const recentArticlesContainer = document.getElementById("recentArticlesList");
    if (recentArticlesContainer) {
        const renderRecent = () => {
            const recentIds = BookmarksManager.getRecent();
            // Filter out current if on an article detail page
            const currentId = currentArticleElement ? currentArticleElement.dataset.id : null;
            const filteredIds = recentIds.filter(id => id !== currentId).slice(0, 3);

            if (filteredIds.length === 0) {
                recentArticlesContainer.innerHTML = `<p class="text-muted text-center py-2" style="font-size: 0.85rem;">No recent articles viewed.</p>`;
                return;
            }

            recentArticlesContainer.innerHTML = filteredIds.map(id => {
                const article = PrimeVerseArticles.find(a => a.id === id);
                if (!article) return "";
                return `
                    <div class="mb-3 d-flex align-items-center">
                        <img src="${article.coverImage}" alt="${article.title}" class="rounded me-3" style="width: 50px; height: 50px; object-fit: cover;" loading="lazy">
                        <div class="overflow-hidden">
                            <h6 class="mb-0 text-truncate" style="font-size: 0.85rem; font-weight: 600;">
                                <a href="${article.url}" class="text-decoration-none text-light-hover" style="color: var(--text-primary);">${article.title}</a>
                            </h6>
                            <small class="text-muted" style="font-size: 0.75rem;">${article.category} &bull; ${article.readingTime}</small>
                        </div>
                    </div>
                `;
            }).join('');
        };

        renderRecent();
        window.addEventListener("recentUpdated", renderRecent);
    }
});

// Toast / Notification Utility (replaces generic alert)
function showToast(message, type = "success") {
    // Check if toast container exists
    let toastContainer = document.querySelector(".primeverse-toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.className = "primeverse-toast-container position-fixed bottom-0 end-0 p-3";
        toastContainer.style.zIndex = "9999";
        document.body.appendChild(toastContainer);
    }

    const toastId = "toast_" + Date.now();
    const bgClass = type === "success" ? "bg-gradient text-white border-0" : "bg-danger text-white border-0";
    const accentColor = type === "success" ? "var(--primary)" : "#ef4444";

    const toastHTML = `
        <div id="${toastId}" class="toast align-items-center show" role="alert" aria-live="assertive" aria-atomic="true" style="background: var(--card-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--border-color) !important; border-left: 4px solid ${accentColor} !important; border-radius: 10px; color: var(--text-primary); min-width: 250px; box-shadow: var(--shadow);">
            <div class="d-flex">
                <div class="toast-body d-flex align-items-center">
                    <i class="bi ${type === 'success' ? 'bi-check-circle-fill text-success' : 'bi-exclamation-triangle-fill text-danger'} me-2" style="font-size: 1.1rem;"></i>
                    <span>${message}</span>
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close" style="filter: invert(var(--theme-invert, 0));"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML("beforeend", toastHTML);
    const element = document.getElementById(toastId);
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
        if (element) {
            element.classList.remove("show");
            setTimeout(() => element.remove(), 300);
        }
    }, 4000);
}
