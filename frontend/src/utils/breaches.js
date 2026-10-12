export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const HIBP_URL = 'https://haveibeenpwned.com/'

export function formatBreachDate(date) {
  if (!date) {
    return 'Date not known'
  }

  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// "About 436,000 accounts" reads more easily than "436K".
export function formatAccounts(value) {
  const number = Number(value || 0)

  if (number >= 1_000_000) {
    const millions = number / 1_000_000
    const shown = millions >= 10 ? Math.round(millions) : Math.round(millions * 10) / 10
    return `About ${shown.toLocaleString('en-AU')} million accounts`
  }

  if (number >= 10_000) {
    return `About ${(Math.round(number / 1000) * 1000).toLocaleString('en-AU')} accounts`
  }

  return `${number.toLocaleString('en-AU')} ${number === 1 ? 'account' : 'accounts'}`
}
