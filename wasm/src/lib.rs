use wasm_bindgen::prelude::*;
#[macro_use]
extern crate log;
use wasm_futures_executor::ThreadPool;

#[wasm_bindgen(start)]
pub fn start() {
    console_error_panic_hook::set_once();
    console_log::init_with_level(log::Level::Debug).expect("could not initialize logger");
}



#[wasm_bindgen]
pub async fn test() -> Result<(), JsValue> {
    let mut pool = ThreadPool::max_threads().await?;
    let result = pool
        .spawn(async move {
            let mut sum = 0;
            for i in 0..100 {
                sum += i;
            }
            sum
        })
        .await
        .map_err(|e| JsValue::from_str(&format!("{:?}", e)))?;
    info!("Result: {}", result);
    Ok(())
}

