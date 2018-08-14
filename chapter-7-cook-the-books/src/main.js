import App from './components/App.js';
import { store, initializeStore } from './store/store.js';

// This allows us to use the <vue-numeric> component globally:
Vue.use(VueNumeric.default);

// Create a globally accessible store (without having to pass it down
// as props):
window.$store = store;

function initialRender(component) {
  new Vue({
    render: h => h(component),
    el: '#app'
  });
}

// After fetching the transactions and initializing the Wasm module,
// render the app. If there's an error, show the error page component:
initializeStore()
  .then(() => {
    initialRender(App);
  })
  .catch(err => {
    console.error(err);
  });
