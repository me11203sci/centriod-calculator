use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
use serde::{Serialize, Deserialize};
use serde_wasm_bindgen::to_value;

#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone)]
pub struct ShapeBuilder {
    lines: Vec<Vec<(f64, f64)>>,
}

#[wasm_bindgen]
impl ShapeBuilder {
    // Create new instance
    pub fn new() -> ShapeBuilder {
        ShapeBuilder {lines: Vec::new()}
    }

    // Add a line to the Shape 
    pub fn add_line(&mut self, start_x: f64, start_y: f64, end_x: f64, end_y: f64) {
        self.lines.push(vec![(start_x, start_y), (end_x, end_y)]);
    }

    // Calculate the centroid for closed shapes
    pub fn calculate_centroid(&self) -> JsValue {
        let num_points = self.lines.len();
        if num_points < 3 {
            return JsValue::NULL; // Cannot calculate centroid for less than 3 points.
        }

        // Flatten all points from lines
        let points: Vec<(f64, f64)> = self.lines.iter().flat_map(|line| line.iter()).cloned().collect();
        
        // Calculate the average x and y for the centroid of the shape 
        let (sum_x, sum_y) = points.iter().fold((0.0, 0.0), |(sum_x, sum_y), &(x, y)| {
            (sum_x + x, sum_y + y)
        });
        
        let centroid = (sum_x / points.len() as f64, sum_y / points.len() as f64);
        
        to_value(&centroid).unwrap() // Serialize the centroid to JsValue
    }

    // Retrieve the lines (for visualization)
    pub fn get_lines(&self) -> JsValue {
        to_value(&self.lines).unwrap_or(JsValue::NULL)
    }

    // Clear the stored lines 
    pub fn clear(&mut self) {
        self.lines.clear();
    }
}





