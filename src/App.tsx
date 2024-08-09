import { onMount } from 'solid-js'
import init, * as wasm from "../wasm/pkg";

import './App.css'

function App() {
  onMount(async () => {
    await init();
    wasm.test();
  });

  return (
    <>
      <p class="text-blue-600">TEST - Check Console</p>
    </>
  )
}

export default App
