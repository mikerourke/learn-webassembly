import WasmWorker from './WasmWorker.js';

/**
 * If you add ?blob=true to the end of the URL (e.g.
 * http://localhost:8080/index.html?blob=true), the worker will be
 * created from a Blob rather than a URL. This returns the
 * URL to use for the Worker either as a string or created from a Blob.
 */
const getWorkerUrl = async () => {
  var url = new URL(window.location);
  var isBlob = url.searchParams.get('blob');
  var workerUrl = 'worker.js';

  // Create a Blob instance from the text contents of `worker.js`:
  if (isBlob === 'true') {
    var response = await fetch('worker.js');
    var results = await response.text();
    var workerBlob = new Blob([results]);
    workerUrl = window.URL.createObjectURL(workerBlob);
  }

  return Promise.resolve(workerUrl);
};

/**
 * Instantiates the Wasm module associated with the specified worker
 * and adds event listeners to the "Add" and "Subtract" buttons.
 */
const initializeWorker = async (wasmWorker, name) => {
  await wasmWorker.initialize(name);
  wasmWorker.addActionHandler('CALC_RESPONSE', payload => {
    document.querySelector('#result').value = payload;
  });

  document.querySelector(`#${name}`).addEventListener('click', () => {
    const inputs = document.querySelectorAll('input');
    var [firstInput, secondInput] = inputs.values();
    wasmWorker.calculate(+firstInput.value, +secondInput.value);
  });
};

/**
 * Spawns (2) workers: one associated with add.wasm and another with
 * subtract.wasm. Adds an event listener to the "Reset" button to clear
 * all the input values.
 */
const loadPage = async () => {
  const workerUrl = await getWorkerUrl();
  var addWorker = new WasmWorker(workerUrl);
  await initializeWorker(addWorker, 'add');

  var subtractWorker = new WasmWorker(workerUrl);
  await initializeWorker(subtractWorker, 'subtract');

  document.querySelector('#reset').addEventListener('click', () => {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => (input.value = 0));
  });
};

loadPage()
  .then(() => console.log('%cPage loaded!', 'color: green;'))
  .catch(error => console.error(error));
