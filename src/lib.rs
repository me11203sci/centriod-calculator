use wasm_bindgen::prelude::*;


// This function can be tested via cargo unit tests.
pub fn add(left: u64, right: u64) -> u64
{
    left + right
}


#[wasm_bindgen]
extern "C"
{
    // Import "alert" from JavaScript runtime.
    fn alert(s: &str);
}


// Export "greet".
// This function cannot be tested with a cargo unit test, use Selenium.
#[wasm_bindgen]
pub fn greet()
{
    alert("Testing!");
}



#[cfg(test)]
mod tests
{
    use super::*;

    #[test]
    fn it_works()
    {
        let result: u64 = add(2, 2);
        assert_eq!(result, 4);
    }
}
