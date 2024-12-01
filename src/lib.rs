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
extern "C" {
    #[wasm_bindgen(js_namespace = console, js_name = log)]
        fn log(s: &str);
    
    #[wasm_bindgen(js_namespace = console, js_name = log)]
        fn log_usize(a: usize);

    #[wasm_bindgen(js_namespace = console, js_name = log)]
        fn log_f64(a: f64);
}

#[wasm_bindgen]
impl ShapeBuilder {    
    // Create new instance
    pub fn new() -> ShapeBuilder {
        ShapeBuilder {lines: Vec::new()}
    }

    pub fn delete_line(&mut self, a1x: f64, a1y: f64, a2x: f64, a2y: f64) {
        let oldLineA = vec![(a1x, a1y), (a2x, a2x)];
        let oldLineB = vec![(a2x, a2y), (a1x, a1x)];
        self.lines.retain(|line| *line != oldLineA);
        self.lines.retain(|line| *line != oldLineB);
    }

    // Add a line to the Shape, handles intersection as well 
    pub fn add_line(&mut self, start_x: f64, start_y: f64, end_x: f64, end_y: f64) {
        //With the way line intersection works, which is way more complicated than we anticipated, a check for collinearity and resolving any instances of that followed by a check for intersection and resolving of that. Like dude think about how many edge cases there are it's actually insane
        let mut lines_to_delete = Vec::new();
        let mut lines_to_add = Vec::new();
        let mut lines_to_process: Vec<Vec<(f64, f64)>> = Vec::new(); // Track lines to be processed

        //Checks for collinearity
        for line in &self.lines {

            if line.len() < 2 {
                continue;  // Skip lines that don't have two points
            } 

            let b1x: f64 = line[0].0;
            let b1y: f64 = line[0].1;
            let b2x: f64 = line[1].0;
            let b2y: f64 = line[1].1;

            let mut cx: f64 = f64::INFINITY;
            let mut cy: f64 = f64::INFINITY;
            
            get_intersection(start_x, start_y, end_x, end_y, b1x, b1y, b2x, b2y, &mut cx, &mut cy);
            
            if cx == f64::NEG_INFINITY && cy == f64::NEG_INFINITY {
                let mut longest_x = 0.0;
                let mut longest_y = 0.0;
                let mut d1x = 0.0;
                let mut d1y = 0.0;
                let mut d2x = 0.0;
                let mut d2y = 0.0;

                if (start_x - b1x).abs() > longest_x && (start_y - b1y).abs() > longest_y {
                    d1x = start_x;
                    d1y = start_y;
                    d2x = b1x;
                    d2y = b1y;
                    longest_x = (d1x - d2x).abs();
                    longest_y = (d1y - d2y).abs();
                }
                if (end_x - b1x).abs() > longest_x && (end_y - b1y).abs() > longest_y {
                    d1x = end_x;
                    d1y = end_y;
                    d2x = b1x;
                    d2y = b1y;
                    longest_x = (d1x - d2x).abs();
                    longest_y = (d1y - d2y).abs();
                }
               
                //gets rid of old line
                lines_to_delete.push(vec![(start_x, start_y), (end_x, end_y)]);
                lines_to_delete.push(vec![(b1x, b1y), (b2x, b2y)]);

                //adds back the collinear combined line
                if d1x != d2x && d1y != d2y {
                    lines_to_add.push(vec![(d1x, d1y), (d2x, d2y)]);
                }
            }
        }

        for line in lines_to_delete {
            self.delete_line(line[0].0, line[0].1, line[1].0, line[1].1);
        }

        for line in &lines_to_add {
            if !self.lines.contains(line) {
                self.lines.push(line.clone());  // Add only if not already present
            }
        }

        lines_to_delete = vec![];
        lines_to_add = vec![];

        //Checks for intersections
        let mut noInt = true;
        let mut last_intersection = (f64::INFINITY, f64::INFINITY);
        let mut lines_split = Vec::new(); // Track which lines have been split
        
        for line in self.lines.iter() {
            let b1x = line[0].0;
            let b1y = line[0].1;
            let b2x = line[1].0;
            let b2y = line[1].1;
            
            let mut cx = f64::INFINITY;
            let mut cy = f64::INFINITY;
            
            get_intersection(start_x, start_y, end_x, end_y, b1x, b1y, b2x, b2y, &mut cx, &mut cy);
            
            if (cx != f64::INFINITY && cx != f64::NEG_INFINITY && cy != f64::INFINITY && cy != f64::NEG_INFINITY){ 
                //intersection!
                noInt = false;
                last_intersection = (cx, cy);
                lines_split.push((b1x, b1y, b2x, b2y, cx, cy));
            }
        }

        //no intersections (fix)
        if noInt {
            lines_to_add.push(vec![(start_x, start_y), (end_x, end_y)]);
        }
        else {
            let (cx, cy) = last_intersection;

            // Process each line that was split
            for (b1x, b1y, b2x, b2y, cx, cy) in lines_split {
                lines_to_delete.push(vec![(b1x, b1y), (b2x, b2y)]);
                lines_to_add.push(vec![(b1x, b1y), (cx, cy)]);
                lines_to_add.push(vec![(cx, cy), (b2x, b2y)]);
            }

            // Check for the new line intersections with the original
            lines_to_delete.push(vec![(start_x, start_y), (end_x, end_y)]);
            lines_to_add.push(vec![(start_x, start_y), (cx, cy)]);
            lines_to_add.push(vec![(cx, cy), (end_x, end_y)]);   
        }
         
        // Step 3: Delete old lines and add new ones
        for line in lines_to_delete {
            self.delete_line(line[0].0, line[0].1, line[1].0, line[1].1);
        }
        for line in lines_to_add {
            self.lines.push(line);
        }

    }

    pub fn add_rect(&mut self, top_left_x: f64, top_left_y: f64, bottom_right_x: f64, bottom_right_y: f64) {
        let top_right_x = bottom_right_x;
        let top_right_y = top_left_y;
        let bottom_left_x = top_left_x;
        let bottom_left_y = bottom_right_y;

        self.add_line(top_left_x, top_left_y, top_right_x, top_right_y);
        self.add_line(top_right_x, top_right_y, bottom_right_x, bottom_right_y);
        self.add_line(bottom_right_x, bottom_right_y, bottom_left_x, bottom_left_y);
        self.add_line(bottom_left_x, bottom_left_y, top_left_x, top_left_y);
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

//finds if two lines intersect. If they do, split the two crossing line segments into 4 segments, each with an endpoint at the intersection.
pub fn get_intersection(a1x: f64, a1y: f64, a2x: f64, a2y: f64, b1x: f64, b1y: f64, b2x: f64, b2y: f64, cx: &mut f64, cy: &mut f64) {
    let alpha_num: f64 = ((b2x - b1x)*(b1y - a1y)) - ((b2y - b1y)*(b1x - a1x));
    let beta_num: f64 = ((a2x - a1x) * (b1y - a1y)) - ((a2y - a1y) * (b1x - a1x));
    let denom: f64 = ((b2x - b1x) * (a2y - a1y)) - ((b2y - b1y) * (a2x - a1x));
    if denom == 0.0 {
        //parallel but not intersecting
        return;
    }
    let alpha: f64 = alpha_num / denom;
    let beta: f64 = beta_num / denom;
    if alpha_num == 0.0 && denom == 0.0 {
        //collinear/overlapping lines
        *cx = f64::NEG_INFINITY;
        *cy = f64::NEG_INFINITY;
        return;
    }
    else if 0.0 <= alpha && alpha <= 1.0 && 0.0 <= beta && beta <= 1.0 {
        //non-parallel and intersecting:
        *cx = a1x + alpha * (a2x - a1x);
        *cy = a1y + alpha * (a2y - a1y);
        return;
    }
    else {
        //not parallel and not intersecting
        return;
    }
}



