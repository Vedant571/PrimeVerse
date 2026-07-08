// PrimeVerse Theme Controller
(function () {
    const THEME_KEY = "primeverse_theme";

    // Get preferred theme (stored, then system default)
    function getPreferredTheme() {
        const storedTheme = localStorage.getItem(THEME_KEY);
        if (storedTheme) {
            return storedTheme;
        }
        return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    }

    // Apply the selected theme to documentElement
    function applyTheme(theme) {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem(THEME_KEY, theme);
        updateThemeToggleUI(theme);
    }

    // Update the toggle UI representation
    function updateThemeToggleUI(theme) {
        const toggles = document.querySelectorAll(".theme-toggle-btn");
        toggles.forEach(toggle => {
            const icon = toggle.querySelector("i");
            if (theme === "light") {
                if (icon) {
                    icon.className = "bi bi-sun-fill";
                }
            } else {
                if (icon) {
                    icon.className = "bi bi-moon-stars-fill";
                }
            }
        });
    }

    // Initialize theme immediately on script load to prevent flashing
    const initialTheme = getPreferredTheme();
    applyTheme(initialTheme);

    // Set up events on DOM load
    document.addEventListener("DOMContentLoaded", () => {
        // Sync UI toggles initially
        updateThemeToggleUI(initialTheme);

        // Bind clicks to all toggle buttons (including mobile)
        document.addEventListener("click", (e) => {
            const toggle = e.target.closest(".theme-toggle-btn");
            if (toggle) {
                const currentTheme = document.documentElement.getAttribute("data-theme");
                const nextTheme = currentTheme === "light" ? "dark" : "light";
                applyTheme(nextTheme);
            }
        });
    });
})();
