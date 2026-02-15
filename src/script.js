// theam swither
function toggleTheme() {
    // Your theme toggling logic here
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        updateButtonText(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateButtonText(false);
    }

    // 2. Function to toggle the theme
    function toggleTheme() {
        const html = document.documentElement;

        if (html.classList.contains('dark')) {
            html.classList.remove('dark');
            localStorage.theme = 'light'; // Save preference
            updateButtonText(false);
        } else {
            html.classList.add('dark');
            localStorage.theme = 'dark'; // Save preference
            updateButtonText(true);
        }
    }

    // 3. Helper to update button text
    function updateButtonText(isDark) {
        const btnText = document.getElementById('btn-text');
        btnText.textContent = isDark ? "Switch to Light" : "Switch to Dark";
    }
}

