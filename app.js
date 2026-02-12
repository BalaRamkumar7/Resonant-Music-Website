console.log('app.js loading...');

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Email Modal Functions
function openEmailModal() {
    const modal = document.getElementById('emailModal');
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeEmailModal() {
    const modal = document.getElementById('emailModal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
    
    // Reset form
    document.getElementById('emailForm').reset();
    document.getElementById('successMessage').classList.add('hidden');
    document.getElementById('errorMessage').classList.add('hidden');
}

// Email Form Submission with Formspree
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('emailForm');
    
    // Check if form exists before adding event listener
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const emailInput = document.getElementById('emailInput');
            const email = emailInput.value.trim();
            const errorMessage = document.getElementById('errorMessage');
            const successMessage = document.getElementById('successMessage');
        
        // Basic validation
        if (!email || !email.includes('@')) {
            errorMessage.textContent = 'Please enter a valid email address';
            errorMessage.classList.remove('hidden');
            return;
        }
        
        errorMessage.classList.add('hidden');
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';
        
        try {
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (response.ok) {
                console.log('Email submitted successfully!');
                form.classList.add('hidden');
                successMessage.classList.remove('hidden');
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            console.error('Error:', error);
            errorMessage.textContent = 'Something went wrong. Please try again.';
            errorMessage.classList.remove('hidden');
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });
    }
});

// Auth Modal Functions
function openAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    document.getElementById('authForm').reset();
    document.getElementById('authSuccess').classList.add('hidden');
    document.getElementById('authError').classList.add('hidden');
}

function signOutUser() {
    if (window.firebaseAuth) {
        window.firebaseAuth.signOut().then(() => {
            updateAuthUI(null);
        });
    }
}

function updateAuthUI(user) {
    console.log('Auth state changed:', user ? user.email : 'null');
    const authButtons = document.getElementById('authButtons');
    const userInfo = document.getElementById('userInfo');
    const userEmail = document.getElementById('userEmail');
    
    if (user) {
        authButtons.classList.add('hidden');
        userInfo.classList.remove('hidden');
        userEmail.textContent = user.email;
        
        // Redirect to dashboard if on index page and user is logged in
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            window.location.href = 'dashboard.html';
        }
    } else {
        authButtons.classList.remove('hidden');
        userInfo.classList.add('hidden');
    }
}

// Make updateAuthUI available globally
window.updateAuthUI = updateAuthUI;

// Auth Form Submission
document.addEventListener('DOMContentLoaded', function() {
    // ...existing email form code...

    const authForm = document.getElementById('authForm');
    
    // Check if auth form exists before adding event listener
    if (authForm) {
        authForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('authEmail').value.trim();
            const password = document.getElementById('authPassword').value;
            const errorDiv = document.getElementById('authError');
            const successDiv = document.getElementById('authSuccess');
        
        errorDiv.classList.add('hidden');
        successDiv.classList.add('hidden');
        
        try {
            const userCredential = await signInWithEmailAndPassword(window.firebaseAuth, email, password);
            
            updateAuthUI(userCredential.user);
            closeAuthModal();
        } catch (error) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    });
    }
});

// Profile Modal Functions
function openProfileModal() {
    document.getElementById('profileModal').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    loadUserProfile();
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.add('hidden');
    document.body.style.overflow = 'auto';
    document.getElementById('profileForm').reset();
    document.getElementById('profileSuccess').classList.add('hidden');
    document.getElementById('profileError').classList.add('hidden');
}

async function loadUserProfile() {
    const user = window.firebaseAuth.currentUser;
    if (!user) return;
    
    try {
        const docRef = window.doc(window.db, 'users', user.uid);
        const docSnap = await window.getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            document.getElementById('profileName').value = data.name || '';
            document.getElementById('profileStatus').value = data.status || '';
            document.getElementById('profileArtist').value = data.favoriteArtist || '';
            document.getElementById('profileSong').value = data.favoriteSong || '';
        }
    } catch (error) {
        console.error('Error loading profile:', error);
    }
}

async function saveUserProfile() {
    const user = window.firebaseAuth.currentUser;
    if (!user) return;
    
    const name = document.getElementById('profileName').value.trim();
    const status = document.getElementById('profileStatus').value.trim();
    const artist = document.getElementById('profileArtist').value.trim();
    const song = document.getElementById('profileSong').value.trim();
    
    try {
        await window.setDoc(window.doc(window.db, 'users', user.uid), {
            name,
            status,
            favoriteArtist: artist,
            favoriteSong: song,
            email: user.email
        });
        document.getElementById('profileSuccess').classList.remove('hidden');
        setTimeout(closeProfileModal, 2000);
    } catch (error) {
        document.getElementById('profileError').textContent = error.message;
        document.getElementById('profileError').classList.remove('hidden');
    }
}

// Add to DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
    // ...existing code...
    
    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveUserProfile();
        });
    }
});

console.log('Resonant website loaded');