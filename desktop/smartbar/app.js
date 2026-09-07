const status = document.getElementById('status');
async function act(action, text = '') {
  try {
    await window.akiliiSmartbar.act(action, text);
    status.textContent = '';
  } catch (error) {
    status.textContent = error.message;
  }
}
document.getElementById('capture').onsubmit = (event) => {
  event.preventDefault();
  const text = document.getElementById('thought').value.trim();
  if (!text) {
    document.getElementById('thought').focus();
    return;
  }
  act('capture', text);
};
for (const button of document.querySelectorAll('[data-action]'))
  button.onclick = () => act(button.dataset.action);
document.getElementById('dismiss').onclick = () => act('dismiss');
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') act('dismiss');
});
