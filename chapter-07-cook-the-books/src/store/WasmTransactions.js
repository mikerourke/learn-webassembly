// Since we can only pass numbers into a Wasm function, these flags
// represent the amount type we're trying to calculate:
window.AMOUNT_TYPE = {
  raw: 1,
  cooked: 2
};

/**
 * Returns an array of compiled (not instantiated!) Wasm modules.
 * We need the main.wasm file we created, as well as the memory.wasm file
 * that allows us to use C functions like malloc() and free().
 * @returns {Promise<(WebAssembly.Module)[]>}
 */
const fetchAndCompileModules = () =>
  Promise.all(
    ['../assets/main.wasm', '../assets/memory.wasm'].map(fileName =>
      fetch(fileName)
        .then(response => {
          if (response.ok) return response.arrayBuffer();
          throw new Error(`Unable to fetch WebAssembly file: ${fileName}`);
        })
        .then(bytes => WebAssembly.compile(bytes))
    )
  );

/**
 * Returns an instance of the compiled "main.wasm" file. This function
 * was moved outside of the class to make the code easier to read.
 * @param {WebAssembly.Module} compiledMain Compiled "main.wasm" Module
 * @param {WebAssembly.Instance} memoryInstance Instantiated "memory.wasm"
 *    file (instantiation was done in initializeWasm() class method)
 * @param {WebAssembly.Memory} wasmMemory Memory instance created in the
 *    initializeWasm() class method
 * @returns {Promise<WebAssembly.ResultObject>}
 */
const instantiateMain = (compiledMain, memoryInstance, wasmMemory) => {
  const memoryMethods = memoryInstance.exports;
  return WebAssembly.instantiate(compiledMain, {
    env: {
      memoryBase: 0,
      tableBase: 0,
      memory: wasmMemory,
      table: new WebAssembly.Table({
        initial: 16,
        element: 'anyfunc'
      }),
      abort: console.log,
      _consoleLog: value => console.log(value),
      _malloc: memoryMethods.malloc,
      _free: memoryMethods.free
    }
  });
};

/**
 * Class used to wrap the functionality from the Wasm module (rather
 * than access it directly from the Vue components or store).
 * @class
 */
export default class WasmTransactions {
  constructor() {
    this.instance = null;
    this.categories = [];
  }

  /**
   * Compiles and instantiates the "memory.wasm" and "main.wasm" files,
   * then sets the class's "instance" property to the result so the
   * "main.wasm" methods can be accessed.
   * @returns {Promise<WasmTransactions>}
   */
  initializeWasm() {
    const wasmMemory = new WebAssembly.Memory({ initial: 1024 });
    return fetchAndCompileModules().then(
      ([compiledMain, compiledMemory]) => {
        return WebAssembly.instantiate(compiledMemory, {
          env: {
            memory: wasmMemory
          }
        })
          .then(memoryInstance =>
            instantiateMain(compiledMain, memoryInstance, wasmMemory)
          )
          .then(mainInstance => {
            this.instance = mainInstance.exports;
            return this;
          });
      }
    );
  }

  getCategoryId(category) {
    return this.categories.indexOf(category);
  }

  /**
   * Ensures the raw and cooked amounts have the proper sign (withdrawals
   * are negative and deposits are positive).
   */
  getValidAmounts(transaction) {
    const { rawAmount, cookedAmount, type } = transaction;
    const getAmount = amount =>
      type === 'Withdrawal' ? -Math.abs(amount) : amount;
    return {
      validRaw: getAmount(rawAmount),
      validCooked: getAmount(cookedAmount)
    };
  }

  /**
   * Adds the specified transaction to the linked list in the Wasm module.
   */
  addToWasm(transaction) {
    const { id, category } = transaction;
    const { validRaw, validCooked } = this.getValidAmounts(transaction);
    const categoryId = this.getCategoryId(category);
    this.instance._addTransaction(id, categoryId, validRaw, validCooked);
  }

  /**
   * Updates the transaction node in the Wasm module to reflect the
   * updated values in the specified transaction.
   */
  editInWasm(transaction) {
    const { id, category } = transaction;
    const { validRaw, validCooked } = this.getValidAmounts(transaction);
    const categoryId = this.getCategoryId(category);
    this.instance._editTransaction(id, categoryId, validRaw, validCooked);
  }

  /**
   * Removes the transaction node from the linked list in the Wasm module
   * that corresponds to the specified ID.
   */
  removeFromWasm(transactionId) {
    this.instance._removeTransaction(transactionId);
  }

  /**
   * Populates the linked list in the Wasm module. This is only called
   * when the application is initially loaded. The categories are needed
   * to set the categoryId in the Wasm module.
   */
  populateInWasm(transactions, categories) {
    this.categories = categories;
    transactions.forEach(transaction => this.addToWasm(transaction));
  }

  /**
   * Returns the balance for raw and cooked transactions based on the
   * specified initial balances.
   */
  getCurrentBalances(initialRaw, initialCooked) {
    const currentRaw = this.instance._getFinalBalanceForType(
      AMOUNT_TYPE.raw,
      initialRaw
    );
    const currentCooked = this.instance._getFinalBalanceForType(
      AMOUNT_TYPE.cooked,
      initialCooked
    );
    return { currentRaw, currentCooked };
  }

  /**
   * Returns an object that has category totals for all income (deposit)
   * and expense (withdrawal) transactions.
   */
  getCategoryTotals() {
    // This is done to ensure the totals reflect the most recent
    // transactions:
    this.instance._recalculateForCategories();
    const categoryTotals = this.categories.map((category, idx) => ({
      category,
      id: idx,
      rawTotal: this.instance._getTotalForTypeAndCategory(
        AMOUNT_TYPE.raw,
        idx
      ),
      cookedTotal: this.instance._getTotalForTypeAndCategory(
        AMOUNT_TYPE.cooked,
        idx
      )
    }));

    const totalsByGroup = { income: [], expenses: [] };
    categoryTotals.forEach(categoryTotal => {
      if (categoryTotal.rawTotal < 0) {
        totalsByGroup.expenses.push(categoryTotal);
      } else {
        totalsByGroup.income.push(categoryTotal);
      }
    });
    return totalsByGroup;
  }
}
