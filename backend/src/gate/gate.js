document.getElementById('gate-form').addEventListener('submit', async (event) => {
  event.preventDefault()
  const input = document.getElementById('gate-password')
  const error = document.getElementById('gate-error')
  const button = event.target.querySelector('button')

  button.disabled = true
  error.hidden = true

  try {
    const response = await fetch('/api/gate/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ password: input.value }),
    })

    if (response.ok) {
      window.location.reload()
      return
    }

    const data = await response.json().catch(() => ({}))
    error.textContent = data.error || 'Incorrect password. Please try again.'
  } catch {
    error.textContent = 'Could not reach the server. Please try again.'
  }

  error.hidden = false
  input.value = ''
  input.focus()
  button.disabled = false
})
