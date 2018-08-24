import WasmTransactions from './WasmTransactions.js';
import {
  apiFetchTransactions,
  apiAddTransaction,
  apiEditTransaction,
  apiRemoveTransaction
} from './api.js';

/**
 * This object is assigned to "$store" on the window object, so it's
 * available globally throughout the application. In a production
 * application, you'd use a library like Vuex to achieve this
 * functionality.
 */
export const store = {
  wasm: null,
  state: {
    transactions: [],
    activeTransactionId: 0,
    balances: {
      initialRaw: 0,
      currentRaw: 0,
      initialCooked: 0,
      currentCooked: 0
    }
  },

  /**
   * Populate global state with the transactions from the API response.
   * This is only called once, when the application is initially loaded.
   */
  populateTransactions(transactions) {
    const sortedTransactions = _.sortBy(transactions, [
      'transactionDate',
      'id'
    ]);
    this.state.transactions = sortedTransactions;
    store.wasm.populateInWasm(sortedTransactions, this.getCategories());
    this.recalculateBalances();
  },

  addTransaction(newTransaction) {
    // We need to assign a new ID to the transaction, so this just adds
    // 1 to the current maximum transaction ID:
    newTransaction.id = _.maxBy(this.state.transactions, 'id').id + 1;
    store.wasm.addToWasm(newTransaction);
    apiAddTransaction(newTransaction).then(() => {
      this.state.transactions.push(newTransaction);
      this.hideTransactionModal();
    });
  },

  editTransaction(editedTransaction) {
    store.wasm.editInWasm(editedTransaction);
    apiEditTransaction(editedTransaction).then(() => {
      this.state.transactions = this.state.transactions.map(
        transaction => {
          if (transaction.id === editedTransaction.id) {
            return editedTransaction;
          }
          return transaction;
        }
      );
      this.hideTransactionModal();
    });
  },

  removeTransaction(transaction) {
    const transactionId = transaction.id;
    store.wasm.removeFromWasm(transactionId);

    // We're passing the whole transaction record into the API call
    // for the sake of consistency:
    apiRemoveTransaction(transaction).then(() => {
      this.state.transactions = this.state.transactions.filter(
        ({ id }) => id !== transactionId
      );
      this.hideTransactionModal();
    });
  },

  showTransactionModal(transactionId) {
    this.state.activeTransactionId = transactionId || 0;
    const transactModal = document.querySelector('#transactionModal');
    UIkit.modal(transactModal).show();
  },

  hideTransactionModal() {
    this.state.activeTransactionId = 0;
    const transactModal = document.querySelector('#transactionModal');
    UIkit.modal(transactModal).hide();
  },

  getActiveTransaction() {
    const { transactions, activeTransactionId } = this.state;
    return (
      transactions.find(({ id }) => id === activeTransactionId) || {
        id: 0
      }
    );
  },

  getCategories() {
    const categories = this.state.transactions.map(
      ({ category }) => category
    );
    // Since we looped through ALL of the transactions, we need to get
    // rid of the duplicates. Once duplicates are removed, sort the
    // names in ascending order:
    return _.uniq(categories).sort();
  },

  updateInitialBalance(amount, fieldName) {
    this.state.balances[fieldName] = amount;
  },

  /**
   * Update the "balances" object in global state based on the current
   * initial balances.
   */
  recalculateBalances() {
    const { initialRaw, initialCooked } = this.state.balances;
    const { currentRaw, currentCooked } = this.wasm.getCurrentBalances(
      initialRaw,
      initialCooked
    );
    this.state.balances = {
      initialRaw,
      currentRaw,
      initialCooked,
      currentCooked
    };
  }
};

/**
 * This function instantiates the Wasm module, fetches the transactions
 * from the API endpoint, and loads them into state and the Wasm
 * instance.
 */
export const initializeStore = () => {
  const wasmTransactions = new WasmTransactions();

  return new Promise((resolve, reject) =>
    wasmTransactions
      .initializeWasm()
      .then(wasm => {
        store.wasm = wasm;
        return apiFetchTransactions();
      })
      .then(transactions => {
        store.populateTransactions(transactions);
        return resolve();
      })
      .catch(reject)
  );
};
