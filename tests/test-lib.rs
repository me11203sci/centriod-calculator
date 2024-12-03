// Import necessary dependencies for testing and handling JavaScript values
use wasm_bindgen_test::wasm_bindgen_test;
use wasm_bindgen_test::console_log;
use wasm_bindgen::JsValue;
use serde_wasm_bindgen::from_value;
use centroid_calculator::ShapeBuilder; // ShapeBuilder is responsible for managing shapes
use centroid_calculator::get_intersection; // Function to calculate intersection of lines

// Configures the testing utility to run the tests in a browser environment
wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);

// Test case: Add a single line to the shape
#[wasm_bindgen_test]
async fn test_add_line() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance

    // Add a line from (0.0, 0.0) to (10.0, 10.0)
    shape_builder.add_line(0.0, 0.0, 10.0, 10.0);

    // Retrieve the current lines from the shape as a JavaScript value
    let lines_jsvalue: JsValue = shape_builder.get_lines();
    
    // Deserialize the lines from the JavaScript value into a Rust vector
    let lines: Vec<Vec<(f64, f64)>> = from_value(lines_jsvalue).expect("Failed to deserialize lines");

    // Sort the line points by x-coordinate to make sure the order doesn't affect the test
    let mut line = lines[0].clone();
    line.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap());

    // Assert that the shape has exactly one line and it matches the expected coordinates
    assert_eq!(lines.len(), 1);
    assert_eq!(line, vec![(0.0, 0.0), (10.0, 10.0)]);
}

// Test case: Add multiple lines to the shape
#[wasm_bindgen_test]
async fn test_add_multiple_lines() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance

    // Add two lines to the shape
    shape_builder.add_line(0.0, 0.0, 5.0, 0.0);
    shape_builder.add_line(0.0, 1.0, 5.0, 1.0);

    // Retrieve the current lines from the shape as a JavaScript value
    let lines_jsvalue: JsValue = shape_builder.get_lines();
    
    // Deserialize the lines from the JavaScript value into a Rust vector
    let lines: Vec<Vec<(f64, f64)>> = from_value(lines_jsvalue).expect("Failed to deserialize lines");
    
    // Sort the first line by x-coordinate for consistency in the test
    let mut line = lines[0].clone();
    line.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap());

    // Assert that two lines have been added and the first line is as expected
    assert_eq!(lines.len(), 2);
    assert_eq!(line, vec![(0.0, 0.0), (5.0, 0.0)]);

    // Retrieve the second line and sort it as well
    let line2_jsvalue: JsValue = shape_builder.get_lines();
    let line2: Vec<Vec<(f64, f64)>> = from_value(line2_jsvalue).expect("Failed to deserialize lines");
    let mut line = line2[1].clone();
    line.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap());

    // Assert that the second line is as expected
    assert_eq!(line, vec![(0.0, 1.0), (5.0, 1.0)]);
}

// Test case: Check behavior when two parallel lines do not intersect
#[wasm_bindgen_test]
async fn test_parallel_lines_no_intersection() {
    let mut cx = 0.0; // x-coordinate of intersection
    let mut cy = 0.0; // y-coordinate of intersection

    // Calculate the intersection of two parallel lines
    get_intersection(0.0, 0.0, 1.0, 1.0, 0.0, 2.0, 1.0, 3.0, &mut cx, &mut cy);

    // Assert that the intersection point is unchanged (no intersection)
    assert_eq!(cx, 0.0);
    assert_eq!(cy, 0.0);
}

// Test case: Check behavior with collinear (overlapping) lines
#[wasm_bindgen_test]
async fn test_collinear_lines() {
    let mut cx = 0.0; // x-coordinate of intersection
    let mut cy = 0.0; // y-coordinate of intersection

    // Calculate the intersection of collinear lines (lines overlap)
    get_intersection(0.0, 0.0, 2.0, 2.0, 1.0, 1.0, 3.0, 3.0, &mut cx, &mut cy);

    // For collinear lines, intersection point should be NEG_INFINITY (indicating overlap)
    assert_eq!(cx, f64::NEG_INFINITY);
    assert_eq!(cy, f64::NEG_INFINITY);
}

// Test case: Check behavior with two intersecting lines
#[wasm_bindgen_test]
async fn test_intersecting_lines() {
    let mut cx = 0.0; // x-coordinate of intersection
    let mut cy = 0.0; // y-coordinate of intersection

    // Calculate the intersection of two intersecting lines
    get_intersection(0.0, 0.0, 2.0, 2.0, 0.0, 2.0, 2.0, 0.0, &mut cx, &mut cy);

    // Assert that the intersection occurs at (1.0, 1.0)
    assert_eq!(cx, 1.0);
    assert_eq!(cy, 1.0);
}

// Test case: Check behavior with two non-intersecting lines (not parallel)
#[wasm_bindgen_test]
async fn test_non_intersecting_lines() {
    let mut cx = 0.0; // x-coordinate of intersection
    let mut cy = 0.0; // y-coordinate of intersection

    // Calculate the intersection of two non-intersecting lines
    get_intersection(0.0, 0.0, 1.0, 1.0, 0.0, 2.0, 2.0, 2.0, &mut cx, &mut cy);

    // The intersection should remain unchanged because the lines do not intersect
    assert_eq!(cx, 0.0);
    assert_eq!(cy, 0.0);
}

// Test case: Add lines and merge collinear lines when the first one is added
#[wasm_bindgen_test]
async fn test_add_line_collinearity_merge_first() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance

    // Add two collinear lines
    shape_builder.add_line(1.0, 0.0, 4.0, 0.0);
    shape_builder.add_line(1.0, 0.0, 2.0, 0.0);

    // Retrieve the current lines from the shape as a JavaScript value
    let lines_jsvalue: JsValue = shape_builder.get_lines();
    
    // Deserialize the lines from the JavaScript value into a Rust vector
    let lines: Vec<Vec<(f64, f64)>> = from_value(lines_jsvalue).expect("Failed to deserialize lines");

    // Sort the first line by x-coordinate for consistency in the test
    let mut line = lines[0].clone();
    line.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap());

    // Assert that the two collinear lines are merged into one line
    assert_eq!(lines.len(), 1);
    assert_eq!(line, vec![(1.0, 0.0), (2.0, 0.0)]);
}

// Test case: Add lines and merge collinear lines when the second one is added
#[wasm_bindgen_test]
async fn test_add_line_collinearity_merge_second() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance

    // Add two collinear lines
    shape_builder.add_line(1.0, 0.0, 2.0, 0.0);
    shape_builder.add_line(1.0, 0.0, 4.0, 0.0);

    // Retrieve the current lines from the shape as a JavaScript value
    let lines_jsvalue: JsValue = shape_builder.get_lines();
    
    // Deserialize the lines from the JavaScript value into a Rust vector
    let lines: Vec<Vec<(f64, f64)>> = from_value(lines_jsvalue).expect("Failed to deserialize lines");

    // Sort the first line by x-coordinate for consistency in the test
    let mut line = lines[0].clone();
    line.sort_by(|a, b| a.0.partial_cmp(&b.0).unwrap());

    // Assert that the two collinear lines are merged into one line
    assert_eq!(lines.len(), 1);
    assert_eq!(line, vec![(1.0, 0.0), (4.0, 0.0)]);
}

// Test case: Add two lines and check their intersection (results in 4 lines)
#[wasm_bindgen_test]
async fn test_add_line_intersection() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance

    // Add two intersecting lines
    shape_builder.add_line(0.0, 1.0, 0.0, -1.0);
    shape_builder.add_line(-1.0, 0.0, 1.0, 0.0);

    // Retrieve the current lines from the shape as a JavaScript value
    let lines_jsvalue: JsValue = shape_builder.get_lines();
    
    // Deserialize the lines from the JavaScript value into a Rust vector
    let lines: Vec<Vec<(f64, f64)>> = from_value(lines_jsvalue).expect("Failed to deserialize lines");

    // Assert that four lines were created due to intersection
    assert_eq!(lines.len(), 4);
    assert_eq!(lines[0], vec![(0.0, 1.0), (0.0, 0.0)]);
    assert_eq!(lines[1], vec![(0.0, 0.0), (0.0, -1.0)]);
    assert_eq!(lines[2], vec![(-1.0, 0.0), (0.0, 0.0)]);
    assert_eq!(lines[3], vec![(0.0, 0.0), (1.0, 0.0)]);
}

// Test case: Add a rectangle to the shape and check the lines
#[wasm_bindgen_test]
async fn test_add_rect() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance

    // Add a rectangle with specified corner points
    shape_builder.add_rect(0.0, 5.0, 5.0, 0.0);

    // Retrieve the current lines from the shape as a JavaScript value
    let lines_jsvalue: JsValue = shape_builder.get_lines();
    
    // Deserialize the lines from the JavaScript value into a Rust vector
    let lines: Vec<Vec<(f64, f64)>> = from_value(lines_jsvalue).expect("Failed to deserialize lines");

    // Assert that the rectangle is represented by 4 lines
    assert_eq!(lines.len(), 4);
    assert_eq!(lines[0], vec![(5.0, 5.0), (5.0, 0.0)]);
    assert_eq!(lines[1], vec![(0.0, 5.0), (5.0, 5.0)]);
    assert_eq!(lines[2], vec![(5.0, 0.0), (0.0, 0.0)]);
    assert_eq!(lines[3], vec![(0.0, 0.0), (0.0, 5.0)]);
}

// Test case: Calculate the centroid when there are fewer than three points
#[wasm_bindgen_test]
async fn test_centroid_with_less_than_three_points() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance
    
    // Add only two points (not enough to calculate a centroid)
    shape_builder.add_line(0.0, 0.0, 1.0, 1.0);
    shape_builder.add_line(2.0, 2.0, 3.0, 3.0);
    
    // Attempt to calculate the centroid of the shape
    let centroid_jsvalue: JsValue = shape_builder.calculate_centroid();
    
    // The centroid should be NULL when there are fewer than 3 points
    assert_eq!(centroid_jsvalue, JsValue::NULL);
}

// Test case: Calculate the centroid of a triangle
#[wasm_bindgen_test]
async fn test_centroid_of_triangle() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance
    
    // Add points forming a triangle
    shape_builder.add_line(0.0, 0.0, 1.0, 0.0);
    shape_builder.add_line(1.0, 0.0, 0.5, 1.0);
    shape_builder.add_line(0.5, 1.0, 0.0, 0.0);
    
    // Attempt to calculate the centroid of the triangle
    let centroid_jsvalue: JsValue = shape_builder.calculate_centroid();
    
    // The centroid of the triangle should be at (0.5, 0.333...)
    let expected_centroid = (0.5, 0.3333333333333333);
    
    // Deserialize the centroid value and check that it matches the expected centroid
    let centroid: (f64, f64) = serde_wasm_bindgen::from_value(centroid_jsvalue).expect("Failed to deserialize centroid");
    
    // Check that the calculated centroid matches the expected value within a small tolerance
    assert!((centroid.0 - expected_centroid.0).abs() < 1e-6);
    assert!((centroid.1 - expected_centroid.1).abs() < 1e-6);
}

// Test case: Calculate the centroid of a square
#[wasm_bindgen_test]
async fn test_centroid_of_square() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance
    
    // Add points forming a square (four points)
    shape_builder.add_line(0.0, 0.0, 0.0, 1.0);
    shape_builder.add_line(0.0, 1.0, 1.0, 1.0);
    shape_builder.add_line(1.0, 1.0, 1.0, 0.0);
    shape_builder.add_line(1.0, 0.0, 0.0, 0.0);
    
    // Attempt to calculate the centroid of the square
    let centroid_jsvalue: JsValue = shape_builder.calculate_centroid();
    
    // The centroid of the square should be at (0.5, 0.5)
    let expected_centroid = (0.5, 0.5);
    
    // Deserialize the centroid value and check that it matches the expected centroid
    let centroid: (f64, f64) = serde_wasm_bindgen::from_value(centroid_jsvalue).expect("Failed to deserialize centroid");
    
    // Check that the calculated centroid matches the expected value within a small tolerance
    assert!((centroid.0 - expected_centroid.0).abs() < 1e-6);
    assert!((centroid.1 - expected_centroid.1).abs() < 1e-6);
}

// Test case: Calculate the centroid of a polygon with multiple lines (square)
#[wasm_bindgen_test]
async fn test_centroid_with_multiple_lines() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance
    
    // Add points forming a polygon (square shape)
    shape_builder.add_line(0.0, 0.0, 3.0, 0.0);
    shape_builder.add_line(3.0, 0.0, 3.0, 3.0);
    shape_builder.add_line(3.0, 3.0, 0.0, 3.0);
    shape_builder.add_line(0.0, 3.0, 0.0, 0.0);
    
    // Attempt to calculate the centroid of the polygon
    let centroid_jsvalue: JsValue = shape_builder.calculate_centroid();
    
    // The centroid for this square-shaped polygon should be at (1.5, 1.5)
    let expected_centroid = (1.5, 1.5);
    
    // Deserialize the centroid value and check that it matches the expected centroid
    let centroid: (f64, f64) = serde_wasm_bindgen::from_value(centroid_jsvalue).expect("Failed to deserialize centroid");
    
    // Check that the calculated centroid matches the expected value within a small tolerance
    assert!((centroid.0 - expected_centroid.0).abs() < 1e-6);
    assert!((centroid.1 - expected_centroid.1).abs() < 1e-6);
}

// Test case: Delete an existing line from the shape
#[wasm_bindgen_test]
async fn test_delete_existing_line() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance

    // Add two lines: Line 1 from (0, 0) to (1, 0) and Line 2 from (0, 1) to (1, 1)
    shape_builder.add_line(0.0, 0.0, 1.0, 0.0);
    shape_builder.add_line(0.0, 1.0, 1.0, 1.0);

    // Delete one of the lines (0, 0) -> (1, 0)
    shape_builder.delete_line(0.0, 0.0, 1.0, 0.0);

    // Get the current lines in the shape
    let lines_jsvalue: JsValue = shape_builder.get_lines();
    let lines: Vec<Vec<(f64, f64)>> = from_value(lines_jsvalue).expect("Failed to deserialize lines");

    // Assert that only one line remains: (0.0, 1.0) -> (1.0, 1.0)
    assert_eq!(lines.len(), 1);
    assert_eq!(lines[0], vec![(0.0, 1.0), (1.0, 1.0)]);
}

// Test case: Attempt to delete a non-existing line from the shape
#[wasm_bindgen_test]
async fn test_delete_non_existing_line() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance

    // Add one line: Line from (0, 0) to (1, 1)
    shape_builder.add_line(0.0, 0.0, 1.0, 1.0);

    // Attempt to delete a line that doesn't exist: Line from (2, 2) to (3, 3)
    shape_builder.delete_line(2.0, 2.0, 3.0, 3.0);

    // Get the current lines in the shape
    let lines_jsvalue: JsValue = shape_builder.get_lines();
    let lines: Vec<Vec<(f64, f64)>> = from_value(lines_jsvalue).expect("Failed to deserialize lines");

    // Assert that the line has not been removed and only one line remains: (0, 0) -> (1, 1)
    assert_eq!(lines.len(), 1);
    assert_eq!(lines[0], vec![(0.0, 0.0), (1.0, 1.0)]);
}

// Test case: Delete all lines from the shape
#[wasm_bindgen_test]
async fn test_delete_all_lines() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance

    // Add three lines: (0, 0) -> (1, 1), (0, 1) -> (1, 2), (0,2) -> (1, 3)
    shape_builder.add_line(0.0, 0.0, 1.0, 1.0);
    shape_builder.add_line(0.0, 1.0, 1.0, 2.0);
    shape_builder.add_line(0.0, 2.0, 1.0, 3.0);

    // Delete all lines
    shape_builder.delete_line(0.0, 0.0, 1.0, 1.0);
    shape_builder.delete_line(0.0, 1.0, 1.0, 2.0);
    shape_builder.delete_line(0.0, 2.0, 1.0, 3.0);

    // Get the current lines in the shape
    let lines_jsvalue: JsValue = shape_builder.get_lines();
    let lines: Vec<Vec<(f64, f64)>> = from_value(lines_jsvalue).expect("Failed to deserialize lines");

    // Assert that no lines remain
    assert_eq!(lines.len(), 0);
}

// Test case: Clear an empty shape (should not cause any errors)
#[wasm_bindgen_test]
async fn test_clear_empty_shape() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance

    // Clear the empty shape (should not cause any errors)
    shape_builder.clear();

    // Get the current lines in the shape
    let lines_jsvalue: JsValue = shape_builder.get_lines();
    let lines: Vec<Vec<(f64, f64)>> = from_value(lines_jsvalue).expect("Failed to deserialize lines");

    // Assert that the shape is still empty (no lines)
    assert_eq!(lines.len(), 0);
}

// Test case: Clear a shape that contains one line
#[wasm_bindgen_test]
async fn test_clear_shape_with_one_line() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance

    // Add one line: Line from (0, 0) to (1, 1)
    shape_builder.add_line(0.0, 0.0, 1.0, 1.0);

    // Clear the shape
    shape_builder.clear();

    // Get the current lines in the shape
    let lines_jsvalue: JsValue = shape_builder.get_lines();
    let lines: Vec<Vec<(f64, f64)>> = from_value(lines_jsvalue).expect("Failed to deserialize lines");

    // Assert that the shape is empty (no lines)
    assert_eq!(lines.len(), 0);
}

// Test case: Clear a shape that contains multiple lines
#[wasm_bindgen_test]
async fn test_clear_shape_with_multiple_lines() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance

    // Add multiple lines
    shape_builder.add_line(0.0, 0.0, 1.0, 1.0);
    shape_builder.add_line(1.0, 1.0, 2.0, 2.0);
    shape_builder.add_line(2.0, 2.0, 3.0, 3.0);

    // Clear the shape
    shape_builder.clear();

    // Get the current lines in the shape
    let lines_jsvalue: JsValue = shape_builder.get_lines();
    let lines: Vec<Vec<(f64, f64)>> = from_value(lines_jsvalue).expect("Failed to deserialize lines");

    // Assert that the shape is empty (no lines)
    assert_eq!(lines.len(), 0);
}

// Test case: Clear the shape and check that it is empty
#[wasm_bindgen_test]
async fn test_clear_and_check_empty() {
    let mut shape_builder = ShapeBuilder::new(); // Initialize a new ShapeBuilder instance

    // Add some lines to the shape
    shape_builder.add_line(0.0, 0.0, 1.0, 1.0);
    shape_builder.add_line(1.0, 1.0, 2.0, 2.0);

    // Clear the shape
    shape_builder.clear();

    // Get the current lines in the shape
    let lines_jsvalue: JsValue = shape_builder.get_lines();
    let lines: Vec<Vec<(f64, f64)>> = from_value(lines_jsvalue).expect("Failed to deserialize lines");

    // Assert that the shape is empty (no lines)
    assert_eq!(lines.len(), 0);
}

