// ===== CLASH ROYALE WHITELIST - FINAL VERSION =====

// DOM Elements
const hamburgerMenu = document.getElementById('hamburgerMenu');
const navMenu = document.getElementById('navMenu');
const whitelistForm = document.getElementById('whitelistForm');
const submitBtn = document.getElementById('submitBtn');
const loadingState = document.getElementById('loadingState');
const successMessage = document.getElementById('successMessage');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');

// Initialize particles
function initParticles() {
    const particlesContainer = document.getElementById('particles');
    if (!particlesContainer) return;
    
    const particleCount = 50;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            background: ${Math.random() > 0.5 ? 'rgba(255, 215, 0, 0.3)' : 'rgba(255, 255, 255, 0.2)'};
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${Math.random() * 20 + 10}s infinite linear;
            animation-delay: ${Math.random() * 5}s;
        `;
        particlesContainer.appendChild(particle);
    }
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0% { transform: translateY(0) translateX(0) rotate(0deg); }
            25% { transform: translateY(-20px) translateX(20px) rotate(90deg); }
            50% { transform: translateY(-40px) translateX(0) rotate(180deg); }
            75% { transform: translateY(-20px) translateX(-20px) rotate(270deg); }
            100% { transform: translateY(0) translateX(0) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
}

// Play sound effect
function playSound(soundId) {
    try {
        const sound = document.getElementById(soundId);
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(() => {});
        }
    } catch (e) {}
}

// Hamburger Menu Toggle
hamburgerMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburgerMenu.classList.toggle('active');
    navMenu.classList.toggle('active');
    playSound('clickSound');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburgerMenu.contains(e.target) && !navMenu.contains(e.target)) {
        hamburgerMenu.classList.remove('active');
        navMenu.classList.remove('active');
    }
});

// Form Validation
function validateForm() {
    let isValid = true;
    clearErrors();
    
    // Email validation
    const email = document.getElementById('email').value.trim();
    if (!email) {
        showError('email', 'Email address is required for the Kingdom');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Twitter validation
    const twitter = document.getElementById('twitter').value.trim();
    if (!twitter) {
        showError('twitter', 'Twitter/X handle is required');
        isValid = false;
    } else if (!isValidTwitter(twitter)) {
        showError('twitter', 'Please enter a valid Twitter/X handle');
        isValid = false;
    }
    
    // Wallet validation (optional)
    const wallet = document.getElementById('wallet').value.trim();
    if (wallet && !isValidWallet(wallet)) {
        showError('wallet', 'Please enter a valid Ethereum wallet address (starts with 0x)');
        isValid = false;
    }
    
    // Checkbox validation
    if (!document.getElementById('followTwitter').checked) {
        showError('follow', 'You must follow @larrynfts to join the Kingdom');
        isValid = false;
    }
    
    if (!document.getElementById('terms').checked) {
        showError('terms', 'You must agree to the Kingdom Terms & Conditions');
        isValid = false;
    }
    
    return isValid;
}

// Show error for field
function showError(fieldId, message) {
    const errorElement = document.getElementById(`${fieldId}Error`);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.add('show');
        // Add shake animation
        const input = document.getElementById(fieldId);
        if (input) {
            input.style.animation = 'none';
            setTimeout(() => {
                input.style.animation = 'shake 0.5s ease';
            }, 10);
        }
    }
}

// Clear all errors
function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => {
        el.textContent = '';
        el.classList.remove('show');
    });
}

// Validation functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidTwitter(twitter) {
    const twitterRegex = /^@?[A-Za-z0-9_]{1,15}$/;
    return twitterRegex.test(twitter.replace('@', ''));
}

function isValidWallet(wallet) {
    const walletRegex = /^0x[a-fA-F0-9]{40}$/;
    return walletRegex.test(wallet);
}

// Auto-format Twitter handle
const twitterInput = document.getElementById('twitter');
if (twitterInput) {
    twitterInput.addEventListener('blur', (e) => {
        let value = e.target.value.trim();
        if (value && !value.startsWith('@')) {
            value = '@' + value.replace(/^@+/g, '');
            e.target.value = value;
        }
    });
}

// Update stats
function updateStats() {
    const submissions = JSON.parse(localStorage.getItem('larryWhitelistSubmissions') || '[]');
    const count = submissions.length;
    
    // Update counters
    const warriorsCount = document.getElementById('warriorsCount');
    const spotsLeft = document.getElementById('spotsLeft');
    const timeLeft = document.getElementById('timeLeft');
    
    if (warriorsCount) {
        animateCounter(warriorsCount, count);
    }
    
    if (spotsLeft) {
        const totalSpots = 500;
        const remaining = Math.max(totalSpots - count, 0);
        animateCounter(spotsLeft, remaining);
    }
    
    if (timeLeft) {
        const firstSubmission = submissions.length > 0 
            ? new Date(submissions[0].timestamp) 
            : new Date();
        const deadline = new Date(firstSubmission.getTime() + (48 * 60 * 60 * 1000));
        const now = new Date();
        const hoursLeft = Math.max(Math.ceil((deadline - now) / (1000 * 60 * 60)), 0);
        animateCounter(timeLeft, hoursLeft);
    }
}

// Animate counter with Clash Royale style
function animateCounter(element, target) {
    const current = parseInt(element.textContent) || 0;
    if (current === target) return;
    
    const diff = target - current;
    const steps = Math.min(Math.abs(diff), 100);
    const stepValue = diff / steps;
    let currentValue = current;
    
    let step = 0;
    const timer = setInterval(() => {
        currentValue += stepValue;
        step++;
        
        if (step >= steps) {
            currentValue = target;
            clearInterval(timer);
            // Add victory effect
            element.style.transform = 'scale(1.2)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 300);
        }
        
        element.textContent = Math.round(currentValue);
    }, 20);
}

// Form submission handler
whitelistForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
        playSound('clickSound');
        return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    loadingState.classList.add('active');
    playSound('clickSound');
    
    try {
        // Prepare form data for Formcarry
        const formData = new FormData(whitelistForm);
        
        // Submit to Formcarry
        const response = await fetch('https://formcarry.com/s/0L_nD4BhwNx', {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const result = await response.json();
        
        if (result.status === 200 || result.code === 200) {
            // Success
            playSound('successSound');
            showSuccessMessage();
            
            // Track submission
            trackSubmission();
            updateStats();
            
            // Reset form
            whitelistForm.reset();
            clearSavedForm();
            
        } else {
            // Formcarry error
            throw new Error(result.message || 'Submission failed. Please try again.');
        }
        
    } catch (error) {
        console.error('Form submission error:', error);
        showErrorMessage(error.message || 'Battle failed! Please try again.');
    } finally {
        // Reset loading state
        submitBtn.disabled = false;
        loadingState.classList.remove('active');
    }
});

// Track submission
function trackSubmission() {
    const submissions = JSON.parse(localStorage.getItem('larryWhitelistSubmissions') || '[]');
    
    const submission = {
        email: document.getElementById('email').value.trim(),
        twitter: document.getElementById('twitter').value.trim(),
        wallet: document.getElementById('wallet').value.trim() || '',
        timestamp: new Date().toISOString()
    };
    
    submissions.push(submission);
    localStorage.setItem('larryWhitelistSubmissions', JSON.stringify(submissions));
}

// Show success message
function showSuccessMessage() {
    successMessage.classList.add('active');
    playSound('successSound');
}

// Show error message
function showErrorMessage(message) {
    errorText.textContent = message;
    errorMessage.classList.add('active');
}

// Close message
function closeMessage(messageId) {
    const message = document.getElementById(messageId);
    if (message) {
        message.classList.remove('active');
        playSound('clickSound');
    }
}

// Form persistence
function saveFormState() {
    const formData = {
        email: document.getElementById('email').value,
        twitter: document.getElementById('twitter').value,
        wallet: document.getElementById('wallet').value,
        followTwitter: document.getElementById('followTwitter').checked,
        terms: document.getElementById('terms').checked
    };
    
    localStorage.setItem('larryWhitelistDraft', JSON.stringify(formData));
}

function loadFormState() {
    const saved = localStorage.getItem('larryWhitelistDraft');
    if (saved) {
        const formData = JSON.parse(saved);
        document.getElementById('email').value = formData.email || '';
        document.getElementById('twitter').value = formData.twitter || '';
        document.getElementById('wallet').value = formData.wallet || '';
        document.getElementById('followTwitter').checked = formData.followTwitter || false;
        document.getElementById('terms').checked = formData.terms || false;
    }
}

function clearSavedForm() {
    localStorage.removeItem('larryWhitelistDraft');
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Initialize particles
    initParticles();
    
    // Load saved form state
    loadFormState();
    
    // Update stats
    updateStats();
    
    // Auto-update stats every 30 seconds
    setInterval(updateStats, 30000);
    
    // Auto-save form
    const formInputs = document.querySelectorAll('#whitelistForm input');
    formInputs.forEach(input => {
        input.addEventListener('input', saveFormState);
        input.addEventListener('change', saveFormState);
    });
    
    // Add shake animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
            20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
    `;
    document.head.appendChild(style);
    
    // Add initial animation to title
    setTimeout(() => {
        const title = document.querySelector('.main-title');
        if (title) {
            title.style.animation = 'none';
            setTimeout(() => {
                title.style.animation = 'crownFloat 3s ease-in-out infinite';
            }, 10);
        }
    }, 1000);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        whitelistForm.dispatchEvent(new Event('submit'));
    }
    
    // Escape to close messages
    if (e.key === 'Escape') {
        closeMessage('successMessage');
        closeMessage('errorMessage');
    }
});

// Export function (for debugging)
if (window.location.hash === '#debug') {
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '📊 EXPORT SUBMISSIONS';
    exportBtn.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: linear-gradient(145deg, #ffd700, #ffed4e);
        color: #000;
        border: none;
        padding: 12px 24px;
        border-radius: 15px;
        cursor: pointer;
        z-index: 1000;
        font-family: 'Supercell Magic', sans-serif;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 8px 32px rgba(255, 215, 0, 0.3);
    `;
    exportBtn.onclick = () => {
        const submissions = JSON.parse(localStorage.getItem('larryWhitelistSubmissions') || '[]');
        const csv = 'Email,Twitter,Wallet,Timestamp\n' +
            submissions.map(s => 
                `"${s.email}","${s.twitter}","${s.wallet}","${s.timestamp}"`
            ).join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `larry-whitelist-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };
    document.body.appendChild(exportBtn);
}
