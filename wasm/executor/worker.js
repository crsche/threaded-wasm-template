// @vite-ignore
// @ts-ignore
// The purpose of this file is two-fold:
// First: Expose a function to start a web worker. This function must
// not be inlined into the Rust lib, as otherwise bundlers could not
// bundle it -- huh.
export function startWorker(module, memory, state, opts, helper) {
  const worker = new Worker(
    new URL("./worker.js", import.meta.url),
    /* @vite-ignore */ opts
  );
  worker.postMessage([module, memory, state, helper.mainJS()]);

  return new Promise((res, rej) => {
    worker.onmessage = (ev) => {
      if (ev.data === "started") res();
    };
    worker.onerror = rej;
  });
}

// Second: Entry script for the actual web worker.
if ("WorkerGlobalScope" in self && self instanceof WorkerGlobalScope) {
  // Initialize wasm module, and memory. `state` is the shared state,
  // to be used with `worker_entry_point`.
  self.onmessage = async (event) => {
    let [module, memory, state, mainJS] = event.data;
    // This crate only works with bundling via webpack or not
    // using a bundler at all:
    // When bundling with webpack, this file is relative to the wasm
    // module file (or package.json) located in `../..` generated by
    // wasm-pack.
    // When using it without any bundlers, the module that
    // provided the `helper` object below is loaded; in other words
    // the main wasm module.
    const importFrom =
      typeof __webpack_require__ === "function"
        ? import("../..")
        : import( /* @vite-ignore */  mainJS);
    try {
      const { default: init, worker_entry_point } = await importFrom;
      await init(module, memory);

      worker_entry_point(state);
      postMessage("started");
      // There shouldn't be any additional messages after the first.
      self.onmessage = (event) => {
        console.error("Unexpected message", event);
      };
    } catch (err) {
      // Propagate to main `onerror`:
      setTimeout(() => {
        throw err;
        //Terminate the worker
        close();
      });
      throw err;
    }
  };
}
