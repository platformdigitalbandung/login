/**
 * Login Module Script
 * Handles login UI interactions
 */

document.addEventListener('DOMContentLoaded', () => {
    const loginInput = document.getElementById('loginInput');
    const nextBtn = document.getElementById('nextBtn');
    const backBtn = document.getElementById('backBtn');
    
    // Enable/Disable "Selanjutnya" button based on input
    if (loginInput && nextBtn) {
        loginInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();
            if (value.length > 0) {
                nextBtn.removeAttribute('disabled');
            } else {
                nextBtn.setAttribute('disabled', 'true');
            }
        });
    }

    // Back button navigation (go back to index or history)
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                console.log('Navigasi ke menu utama');
            }
        });
    }

    // Handle "Selanjutnya" button click
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            console.log('Lanjut proses login dengan:', loginInput.value);
        });
    }
});
