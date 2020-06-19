const API_URL = 'http://localhost:4001';

/**
 * Wrapper for performing API calls. We don't want to call response.json()
 * each time we make a fetch call.
 * @param {string} endpoint Endpoint (e.g. "/transactions" to make API call to
 * @param {Object} init Fetch options object containing any custom settings
 * @returns {Promise<*>}
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
 */
const performApiFetch = (endpoint = '', init = {}) =>
  fetch(`${API_URL}${endpoint}`, {
    headers: {
      'Content-type': 'application/json'
    },
    ...init
  }).then(response => response.json());

export const apiFetchTransactions = () =>
  performApiFetch('/transactions');

export const apiEditTransaction = transaction =>
  performApiFetch(`/transactions/${transaction.id}`, {
    method: 'PUT',
    body: JSON.stringify(transaction)
  });

export const apiRemoveTransaction = transaction =>
  performApiFetch(`/transactions/${transaction.id}`, {
    method: 'DELETE'
  });

export const apiAddTransaction = transaction =>
  performApiFetch("/transactions", {
    method: 'POST',
    body: JSON.stringify(transaction)
  });
