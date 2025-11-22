// sub modal
let modal = document.getElementById('subscribe-modal');
let modalTitle = document.getElementById('subscribe-modal-title');
let modalText = document.getElementById('subscribe-modal-text');
let closeBtn = modal.querySelector('.modal-close');
let form = modal.querySelector('.modal-form');
let emailInput = modal.querySelector('input[type="email"]');
let lastFocusedElement = null;


function closeModal() {
modal.classList.remove('is-open');
document.body.classList.remove('no-scroll');
if (lastFocusedElement) lastFocusedElement.focus();
}

// Open modal on subscription buttons
document.querySelectorAll('#subs .plan .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        let card = btn.closest('.plan');
        let planName = card.querySelector('h3')?.textContent.trim() || 'this plan';
        let price = card.querySelector('.price')?.textContent.trim() || '';
        openModal(planName, price);
    });
});
function openModal(planName, price) {
    lastFocusedElement = document.activeElement;

    modalTitle.textContent = 'Subscribe to ' + planName;
    modalText.textContent =
        'Leave your email and we’ll contact you about the ' +
        planName +
        (price ? ' (' + price + ')' : '') +
        '.';

    modal.classList.add('is-open');
    document.body.classList.add('no-scroll');
    emailInput.focus();
}
// Close actions
closeBtn.addEventListener('click', closeModal);

modal.addEventListener('click', function (e) {
if (e.target === modal) closeModal();
});

document.addEventListener('keydown', function (e) {
if (e.key === 'Escape' && modal.classList.contains('is-open')) {
    closeModal();
}
});

form.addEventListener('submit', function (e) {
e.preventDefault();
alert('Thanks! We will contact you shortly.');
form.reset();
closeModal();
});
