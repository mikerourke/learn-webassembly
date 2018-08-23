/**
 * Web Worker associated with an instantiated Wasm module.
 * @class
 */
export default class WasmWorker {
  constructor(workerUrl) {
    this.worker = new Worker(workerUrl);
    this.handlersByType = {};
    this.addListeners();
  }

  // Add a handler associated with the `type` value from the
  // Worker message:
  addActionHandler(type, actionHandler) {
    this.handlersByType[type] = actionHandler;
  }

  // Add event listeners for error and message handling.
  addListeners() {
    this.worker.addEventListener('error', event => {
      console.error(`%cError: ${event.message}`, 'color: red;');
    }, false);

    // If a handler was specified using the `addActionHandler` method,
    // fire that method if the `type` matches:
    this.worker.addEventListener('message', event => {
      if (
        event.data instanceof Object &&
        event.data.hasOwnProperty('type') &&
        event.data.hasOwnProperty('payload')
      ) {
        const { type, payload } = event.data;
        if (this.handlersByType[type]) {
          this.handlersByType[type](payload);
        }
      } else {
        console.log(event.data);
      }
    }, false);
  }

  // Fetches the Wasm file, compiles it, and passes the compiled result
  // to the corresponding worker:
  initialize(name) {
    return fetch(`assets/${name}.wasm`)
      .then(response => response.arrayBuffer())
      .then(bytes => WebAssembly.compile(bytes))
      .then(wasmModule => {
        this.worker.postMessage({
          type: 'COMPILE_WASM_REQUEST',
          payload: wasmModule
        });
        return Promise.resolve();
      });
  }

  // Posts a message to the worker thread to call the `calculate`
  // method from the Wasm instance:
  calculate(firstVal, secondVal) {
    this.worker.postMessage({
      type: 'CALC_REQUEST',
      payload: {
        firstVal,
        secondVal
      }
    });
  }
}
