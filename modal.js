// modal.js
export function openModal() {
    console.log('openModal called');
    const modal = document.getElementById('modal');
    if (modal) {

        modal.style.pointerEvents = 'auto';
        // Trigger reflow
        void modal.offsetWidth;
        modal.classList.remove('hidden');

    } else {
        console.error('Something went wrong with the modal');
    }
}

export function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) {
        modal.classList.add('hidden');
        // Wait for the transition to complete before hiding the modal
        setTimeout(() => {
            modal.style.pointerEvents = 'none';
        }, 500); // Should match the transition duration
    }
}

export function openUpdateModal() {
    console.log('openModal called');
    const modal = document.getElementById('updateModal');

    modal.style.pointerEvents = 'auto';

    void modal.offsetWidth;
    modal.classList.remove('hidden');
}

// Make functions available globally
window.openModal = openModal;
window.closeModal = closeModal;
window.openUpdateModal = openUpdateModal;
