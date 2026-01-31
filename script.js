document.addEventListener('DOMContentLoaded', function () {
    // DOM Elements
    const urlInput = document.getElementById('urlInput');
    const shortenBtn = document.getElementById('shortenBtn');
    const resultContainer = document.getElementById('resultContainer');
    const shortUrlDisplay = document.getElementById('shortUrlDisplay');
    const shortUrlContainer = document.getElementById('shortUrlContainer');
    const shortUrlLink = document.getElementById('shortUrlLink');
    const visitBtn = document.getElementById('visitBtn');
    const copyBtn = document.getElementById('copyBtn');
    const errorMessage = document.getElementById('errorMessage');
    const successMessage = document.getElementById('successMessage');
    const errorText = document.getElementById('errorText');
    const successText = document.getElementById('successText');
    const loadingSpinner = document.getElementById('loadingSpinner');
    const scissorsIcon = document.getElementById('scissorsIcon');
    const buttonText = document.getElementById('buttonText');
    const originalUrl = document.getElementById('originalUrl');

    // Configuration - UPDATE THIS WITH YOUR BACKEND API ENDPOINT
    const API_ENDPOINT = 'https://url-shortener-80dc.onrender.com'; // Replace with your actual API endpoint

    // URL validation regex
    const urlPattern = /^(https?:\/\/)[\w.-]+\.[a-zA-Z]{2,}(\/\S*)?$/;

    // Function to validate URL
    function validateUrl(url) {
        if (!url) return false;
        return urlPattern.test(url);
    }

    // Function to show error
    function showError(message) {
        errorText.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
        urlInput.style.borderColor = '#ef4444';

        // Add error animation
        errorMessage.style.animation = 'none';
        setTimeout(() => {
            errorMessage.style.animation = 'shake 0.5s ease-in-out';
        }, 10);
    }

    // Function to show success
    function showSuccess(message) {
        successText.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
        urlInput.style.borderColor = '#10b981';

        // Add success animation
        successMessage.style.animation = 'none';
        setTimeout(() => {
            successMessage.style.animation = 'slideIn 0.5s ease-out';
        }, 10);
    }

    // Function to hide messages
    function hideMessages() {
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        urlInput.style.borderColor = '#e2e8f0';
    }

    // Function to show loading state
    function showLoading() {
        loadingSpinner.style.display = 'inline-block';
        scissorsIcon.style.display = 'none';
        buttonText.textContent = 'Shortening...';
        shortenBtn.disabled = true;
        shortenBtn.style.opacity = '0.8';
    }

    // Function to hide loading state
    function hideLoading() {
        loadingSpinner.style.display = 'none';
        scissorsIcon.style.display = 'inline-block';
        buttonText.textContent = 'Shorten URL';
        shortenBtn.disabled = false;
        shortenBtn.style.opacity = '1';
    }

    // Function to shorten URL - REPLACE THIS WITH YOUR ACTUAL API CALL
    async function shortenUrl(longUrl) {
        try {
            const response = await fetch(
                `${API_ENDPOINT}?long_url=${encodeURIComponent(longUrl)}`,
                { method: 'POST' }
            );

            if (!response.ok) {
                const text = await response.text();
                throw new Error(text || 'Failed to shorten URL');
            }

            const data = await response.json();

            // backend returns: { "short_url": "https://..." }
            return data.short_url;

        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }


    // Function to display shortened URL
    function displayShortUrl(originalUrlValue, shortUrlValue) {
        shortUrlDisplay.style.display = 'none';
        shortUrlContainer.style.display = 'flex';
        shortUrlLink.textContent = shortUrlValue;
        shortUrlLink.href = shortUrlValue;
        visitBtn.href = shortUrlValue;
        originalUrl.textContent = `Original: ${originalUrlValue}`;
        resultContainer.classList.add('show');
    }

    // Function to reset display
    function resetDisplay() {
        shortUrlDisplay.style.display = 'block';
        shortUrlContainer.style.display = 'none';
        resultContainer.classList.remove('show');
        shortUrlDisplay.textContent = 'Your shortened URL will appear here';
        originalUrl.textContent = '';
    }

    // Function to copy URL to clipboard
    async function copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);

            // Visual feedback
            const originalContent = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.style.background = 'linear-gradient(135deg, #059669 0%, #10b981 100%)';

            setTimeout(() => {
                copyBtn.innerHTML = originalContent;
                copyBtn.style.background = 'var(--success-gradient)';
            }, 2000);

            // Show success message
            showSuccess('URL copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            showError('Failed to copy to clipboard. Please copy manually.');
        }
    }

    // Event listener for URL input validation
    urlInput.addEventListener('input', function () {
        hideMessages();
        if (validateUrl(this.value)) {
            urlInput.style.borderColor = '#667eea';
        } else {
            urlInput.style.borderColor = '#e2e8f0';
        }
    });

    // Event listener for shorten button
    shortenBtn.addEventListener('click', async function () {
        const longUrl = urlInput.value.trim();

        // Validate input
        if (!validateUrl(longUrl)) {
            showError('Please enter a valid URL starting with http:// or https://');
            return;
        }

        hideMessages();
        showLoading();
        resetDisplay();

        try {
            // Call the API to shorten URL
            const shortUrl = await shortenUrl(longUrl);

            // Display the result
            displayShortUrl(longUrl, shortUrl);
            showSuccess('URL shortened successfully!');
            hideLoading();

            // Clear input
            urlInput.value = '';

        } catch (error) {
            hideLoading();
            showError(error.message || 'Failed to shorten URL. Please try again.');
        }
    });

    // Event listener for copy button
    copyBtn.addEventListener('click', function () {
        const urlToCopy = shortUrlLink.textContent;
        copyToClipboard(urlToCopy);
    });

    // Event listener for visit button
    visitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        const url = visitBtn.href;
        if (url && url !== '#') {
            window.open(url, '_blank');
        }
    });

    // Allow submitting with Enter key
    urlInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
            shortenBtn.click();
        }
    });

    // Initialize with welcome message
    setTimeout(() => {
        // Show welcome message
        shortUrlDisplay.textContent = "Paste your long URL above and click 'Shorten URL' to get a clean, shareable link.";
        resultContainer.classList.add('show');

        // Focus the input
        urlInput.focus();

        // Add pulse animation to button
        setTimeout(() => {
            shortenBtn.style.animation = 'pulse 2s infinite';
        }, 1000);
    }, 1000);

    // Add CSS for pulse animation
    const style = document.createElement('style');
    style.textContent = `
                @keyframes pulse {
                    0% { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); }
                    50% { transform: translateY(-5px); box-shadow: 0 12px 30px rgba(102, 126, 234, 0.6); }
                    100% { transform: translateY(-3px); box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4); }
                }
            `;
    document.head.appendChild(style);
});