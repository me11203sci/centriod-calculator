


# Documentation for `ShapeBuilder` and Intersection Code

## Overview

This code defines a `ShapeBuilder` struct, which is used to create and manage shapes composed of lines. It includes functionality to add lines, delete lines, calculate centroids, and handle intersections between lines. The code also includes a utility for logging messages to the console, either in a WebAssembly (Wasm) environment or in a non-Wasm environment.

## Logging Functions

### Wasm Target

For WebAssembly targets, the logging functions use `wasm_bindgen` to log messages to the browser's JavaScript console.

```
#[cfg(target_arch = "wasm32")] 
#[wasm_bindgen] extern "C" { 
	#[wasm_bindgen(js_namespace = console, js_name = log)] 
	fn log(s: &str); 
	
	#[wasm_bindgen(js_namespace = console, js_name = log)] 
	fn log_usize(a: usize); 
	
	#[wasm_bindgen(js_namespace = console, js_name = log)] 
	fn log_f64(a: f64); }
```

- `log(s: &str)`: Logs a string message to the JavaScript console.
- `log_usize(a: usize)`: Logs a `usize` value to the console.
- `log_f64(a: f64)`: Logs a `f64` value to the console.

### Non-Wasm Target

For non-Wasm targets, these logging functions are defined to print the messages to the standard output (console).

```
#[cfg(not(target_arch = "wasm32"))]
#[allow(unused)]
fn log(s: &str) {
    println!("{}", s);
}

#[cfg(not(target_arch = "wasm32"))]
#[allow(unused)]
fn log_usize(a: usize) {
    println!("{}", a);
}

#[cfg(not(target_arch = "wasm32"))]
#[allow(unused)]
fn log_f64(a: f64) {
    println!("{}", a);
}
```

## ShapeBuilder Struct

The `ShapeBuilder` struct is the core data structure for managing a collection of lines.

### Struct Definition
```
#[wasm_bindgen]
#[derive(Serialize, Deserialize, Clone)]
pub struct ShapeBuilder {
    lines: Vec<Vec<(f64, f64)>>,
}
```

- `lines`: A vector of lines, where each line is represented as a vector of two tuples `(f64, f64)` representing the endpoints of the line.

### Functions
#### `new`
 ```
 pub fn new() -> ShapeBuilder {
    ShapeBuilder { lines: Vec::new() }
}
```

- **Purpose**: Creates a new instance of `ShapeBuilder` with an empty set of lines.

#### `delete_line`
```
pub fn delete_line(&mut self, a1x: f64, a1y: f64, a2x: f64, a2y: f64)
```

- **Purpose**: Deletes a line from the shape. The line is identified by its two endpoints `(a1x, a1y)` and `(a2x, a2y)`.

#### `add_line`
```
pub fn add_line(&mut self, mut start_x: f64, mut start_y: f64, mut end_x: f64, mut end_y: f64)
```

- **Purpose**: Adds a line to the shape, while handling collinearity and intersection detection. The method handles situations where lines overlap or intersect by modifying the line segments as needed.
    
- **Process**:
    
    - Detects intersections with existing lines and splits lines as needed.
    - Resolves collinearity by merging overlapping lines into a single line.
    - Removes old lines and adds new ones.

#### `add_rect`

```
pub fn add_rect(&mut self, top_left_x: f64, top_left_y: f64, bottom_right_x: f64, bottom_right_y: f64)
```

- **Purpose**: Adds a rectangle to the shape, given the coordinates of two opposite corners (top-left and bottom-right).
- **Details**: The rectangle is created by adding four line segments that form the edges of the rectangle.

#### `calculate_centroid`
```
pub fn calculate_centroid(&self) -> JsValue
```

- **Purpose**: Calculates and returns the centroid of the shape.
- **Details**:
    - If the shape has fewer than three points, the function returns `JsValue::NULL`.
    - The centroid is calculated as the average of all points' x and y coordinates.

#### `get_lines`
```
pub fn get_lines(&self) -> JsValue
```

- **Purpose**: Returns the current lines of the shape as a `JsValue`. This can be used for visualization in JavaScript.

#### `clear`
```
pub fn clear(&mut self)
```

- **Purpose**: Clears all the lines from the shape, resetting the shape to an empty state.

## Intersection Detection

### `get_intersection`
```
pub fn get_intersection(
    a1x: f64, a1y: f64, a2x: f64, a2y: f64,
    b1x: f64, b1y: f64, b2x: f64, b2y: f64,
    cx: &mut f64, cy: &mut f64
)
```

- **Purpose**: Determines if two line segments intersect. If they do, the line segments are split at the intersection point.
- **Process**:
    - Computes the intersection point `(cx, cy)` using line segment intersection formulas.
    - If the lines are collinear, the function sets `cx` and `cy` to `f64::NEG_INFINITY`.
    - If the lines intersect within the bounds of the segments, the function calculates the intersection point and returns it.

## Example Usage

```
// Creating a new shape builder
let mut shape = ShapeBuilder::new();

// Adding lines
shape.add_line(0.0, 0.0, 10.0, 10.0);
shape.add_line(0.0, 10.0, 10.0, 0.0);

// Adding a rectangle
shape.add_rect(0.0, 0.0, 5.0, 5.0);

// Calculating the centroid
let centroid = shape.calculate_centroid();

```

## Conclusion

This code provides a robust framework for managing and manipulating shapes in a WebAssembly environment, including line intersection handling, shape creation, and centroid calculation. It integrates with JavaScript using `wasm_bindgen` to facilitate web-based visualization and interaction.


# Documentation for WebAssembly Tests

## Imports

We import necessary modules to run and manage WebAssembly tests:

- `wasm_bindgen_test`: Provides the necessary functionality to run tests in a browser environment.
- `console_log`: Allows us to log messages during testing for debugging purposes.
- `JsValue`: Used to handle JavaScript values in Rust and interoperate between JavaScript and Rust code.
- `serde_wasm_bindgen::from_value`: Deserializes JavaScript values into Rust data structures.
- `centroid_calculator`: The crate that contains the `ShapeBuilder` and intersection functions that we are testing.

## Test Configuration

`wasm_bindgen_test::wasm_bindgen_test_configure!(run_in_browser);`

This configuration ensures that the tests are executed in a browser environment, which is necessary for testing WebAssembly functionality.

## Test Functions

Each test function is annotated with `#[wasm_bindgen_test]`, indicating it should be run as part of the WebAssembly tests. Below is a breakdown of the different test cases:

### Line and Shape Operations

1. **test_add_line**:  
    Verifies the addition of a single line to the shape.
    
2. **test_add_multiple_lines**:  
    Verifies the addition of multiple lines and ensures they are correctly retrieved.
    
3. **test_parallel_lines_no_intersection**:  
    Tests the behavior when two parallel lines are added, which should not intersect.
    
4. **test_collinear_lines**:  
    Tests the behavior when two collinear (overlapping) lines are added.
    
5. **test_intersecting_lines**:  
    Verifies that two intersecting lines generate the correct intersection point.
    
6. **test_non_intersecting_lines**:  
    Tests the case where two non-intersecting lines are added, ensuring the intersection point remains unchanged.
    
7. **test_add_line_collinearity_merge_first**:  
    Verifies that when two collinear lines are added, the first one is merged correctly.
    
8. **test_add_line_collinearity_merge_second**:  
    Verifies that when two collinear lines are added, the second one is merged correctly.
    
9. **test_add_line_intersection**:  
    Verifies that two intersecting lines generate multiple line segments.
    
10. **test_add_rect**:  
    Verifies that adding a rectangle generates the correct lines to form the rectangle.
    

### Centroid Calculations

11. **test_centroid_with_less_than_three_points**:  
    Verifies that the centroid calculation returns `NULL` when fewer than three points are provided.
    
12. **test_centroid_of_triangle**:  
    Verifies the centroid calculation for a triangle, expecting it to be at `(0.5, 0.333...)`.
    
13. **test_centroid_of_square**:  
    Verifies the centroid of a square, expecting it to be at `(0.5, 0.5)`.
    
14. **test_centroid_with_multiple_lines**:  
    Verifies the centroid of a polygon (square-shaped), expecting the centroid to be at `(1.5, 1.5)`.
    

### Line Deletion Operations

15. **test_delete_existing_line**:  
    Verifies that an existing line is correctly deleted from the shape.
    
16. **test_delete_non_existing_line**:  
    Ensures that attempting to delete a non-existing line does not affect the shape.
    
17. **test_delete_all_lines**:  
    Verifies that deleting all lines from the shape results in an empty shape.
    

### Clearing Shapes

18. **test_clear_empty_shape**:  
    Verifies that clearing an empty shape does not cause any errors.
    
19. **test_clear_shape_with_one_line**:  
    Tests that clearing a shape with one line results in an empty shape.
    
20. **test_clear_shape_with_multiple_lines**:  
    Verifies that clearing a shape with multiple lines results in an empty shape.
    
21. **test_clear_and_check_empty**:  
    Ensures that clearing a shape with lines leaves the shape empty afterward.
    

## Purpose

These test cases validate the core functionality of the `ShapeBuilder` operations and ensure that:

- Centroid calculations are accurate for various shapes.
- Line deletions work as expected, including handling collinear lines and empty shapes.
- Clearing shapes behaves as expected, even with different numbers of lines.

These tests ensure that the logic for manipulating and calculating properties of shapes works correctly and consistently.




# HTML Documentation for Centroid Calculator

## Overview

This HTML document defines the structure of the **Centroid Calculator** web application, which allows users to draw geometric shapes on a grid and calculate the centroid of those shapes. The layout includes a toolbar with interactive buttons and a canvas area where the user can draw shapes.

## Structure

The HTML document is divided into two primary sections:
1. **Toolbar**: A collection of buttons and input fields that allow the user to interact with the application and control the drawing and calculation tools.
2. **Canvas**: A drawing area where users can interactively draw lines, rectangles, and other shapes to calculate centroids.

---

## Head Section

```html
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Centroid Calculator</title>
  <link rel="stylesheet" href="styles.css">
  <script type="module" src="index.js"></script>
</head>
```

### Key Elements:

- **Meta tags**: These set the character encoding to UTF-8 and ensure the webpage is responsive on different screen sizes.
- **Title**: The title of the web page is set to "Centroid Calculator".
- **CSS and JavaScript**: The `styles.css` file is linked to style the page, and `index.js` is the JavaScript file that contains the logic for interactivity.

---

## Body Section

### 1. **Toolbar Implementation**

The toolbar provides a series of buttons and input fields that allow the user to interact with the application.

```
<div id="toolbar" class="toolbar">
  <!-- Main Icon -->
  <img id="main_icon" src="icons/mainIcon.png"></img>
  <hr>

  <!-- Tool Buttons -->
  <button id="selectButton" class="tool-button" onclick="buttonPress('select')">Select</button>
  <button id="drawLineButton" class="tool-button" onclick="buttonPress('drawLine')">Draw Line</button>

  <!-- Line Input Fields -->
  <div id="line_text">
    <input type="text" id="linePoint1" class="line_textbox" placeholder="Point 1: (x1, y1)">
    <input type="text" id="linePoint2" class="line_textbox" placeholder="Point 2: (x2, y2)">
    <button id="drawNumLineButton" class="submit_button">Draw</button>
  </div>

  <!-- Rectangle Tool -->
  <button id="rectangleButton" class="tool-button" onclick="buttonPress('rectangle')">Draw Rectangle</button>
  <div id="rect_text">
    <input type="text" id="rectPoint1" class="rect_textbox" placeholder="Top left corner: (x1, y1)">
    <input type="text" id="rectW" class="rect_textbox_small" placeholder="Width">
    <input type="text" id="rectH" class="rect_textbox_small" placeholder="Height">
    <button id="drawNumRectButton" class="submit_button">Draw</button>
  </div>

  <!-- Action Buttons -->
  <button id="calculateCentroidButton" class="tool-button" onclick="buttonPress('centroid')">Calculate Centroid</button>
  <button id="deleteLineButton" class="tool-button" onclick="buttonPress('delete')">Delete Line</button>
  <button id="clearButton" class="tool-button" onclick="buttonPress('clear')">Clear Shape</button>
  <hr>

  <!-- Information Section -->
  <div id="info_text">
    <h2 id="title_text">Select Tool</h2>
    <img id="info_image" src="icons/select.png"></img>
    <h4 id="description_text">This tool allows the user to manipulate the grid to better suit their needs. Zoom in and out by scrolling, click and drag to shift the grid, and hover over a point or line to highlight it and display it's position or length respectively.</h4>
  </div>
</div>

```

### Key Elements:

- **Tool Buttons**:
    
    - `Select`, `Draw Line`, `Draw Rectangle`, `Calculate Centroid`, `Delete Line`, and `Clear Shape` buttons trigger corresponding actions.
    - `onclick` event handlers call the `buttonPress()` function, which updates the information area and toggles input fields as needed.
- **Line and Rectangle Inputs**:
    
    - The input fields allow users to specify coordinates for lines and rectangles to be drawn on the canvas.
    - `Draw` buttons next to the input fields trigger the drawing of the specified shapes on the canvas.
- **Information Section**:
    
    - Displays tool tips and descriptions for each tool when the corresponding button is clicked. This helps guide the user through the available features.

---

### 2. **Canvas Implementation**

The canvas area is where the shapes are drawn. It contains a title, the canvas itself, and developer credits.

```
<div id="canvas-container">
  <h1>Centroid Calculator</h1>
  <canvas id="centroidCanvas" width="800" height="600" style="border:1px solid #000;"></canvas>
  <h2>Developed by Melesio Albavera, Tim Stokes, and Kaleb Kruse</h2>
</div>

```

### Key Elements:

- **Canvas**:
    
    - A `<canvas>` element with a width of 800px and a height of 600px, where the user can interact with the grid and draw shapes.
    - The `id` is `centroidCanvas`, which is used to reference the canvas in JavaScript for drawing operations.
- **Developer Credits**: Displays the names of the developers who worked on the project.
    

---

## JavaScript Functionality

### Button Press Function

The `buttonPress()` function dynamically updates the toolbar and shows relevant input fields for drawing shapes or calculating centroids.

```
function buttonPress(button) {
  let information = {
    select: ["Select Tool", "This tool allows the user to manipulate the grid to better suit their needs...", "icons/select.png"],
    drawLine : ["Line Tool", "This tool allows the user to draw lines on the grid...", "icons/drawLine.png"], 
    rectangle : ["Rectangle Tool", "This tool allows the user to draw rectangles on the grid...", "icons/drawRect.png"],
    centroid : ["Centroid Calculator", "This tool allows the user to compute the centroid of a drawn shape...", "icons/centroid.png"],
    delete : ["Delete Tool", "This tool allows the user to delete any lines that were previously drawn...", "icons/deleteLine.png"]
  };

  // Update UI with tool information
  if (button != "clear") {
    document.getElementById("info_text").style.opacity = 0;
    setTimeout(() => {
      document.getElementById("title_text").textContent = information[button][0];
      document.getElementById("info_image").src = information[button][2];
      document.getElementById("description_text").textContent = information[button][1];
      document.getElementById("info_text").style.opacity = 1;
    }, 500);
  }

  // Show or hide input fields for line or rectangle drawing
  const lineTextboxes = document.getElementById('line_text');
  const rectTextboxes = document.getElementById('rect_text');
  if (lineTextboxes.style.display != 'block' && button == 'drawLine') {
    let delay = rectTextboxes.style.display == 'block' ? 500 : 0;
    setTimeout(() => {
      lineTextboxes.style.display = 'block';
      setTimeout(() => {
        lineTextboxes.style.opacity = 1;
      }, 10);
    }, delay);
  }
  else if (button != 'clear') {
    lineTextboxes.style.opacity = 0;
    setTimeout(() => {
      lineTextboxes.style.display = 'none';
    }, 500);
  }

  if (rectTextboxes.style.display != 'block' && button == 'rectangle') {
    let delay = lineTextboxes.style.display == 'block' ? 500 : 0;
    setTimeout(() => {
      rectTextboxes.style.display = 'block';
      setTimeout(() => {
        rectTextboxes.style.opacity = 1;
      }, 10);
    }, delay);
  }
  else if (button != 'clear') {
    rectTextboxes.style.opacity = 0;
    setTimeout(() => {
      rectTextboxes.style.display = 'none';
    }, 500);
  }
}

```

### Key Features:

- **Dynamic Content Change**: Changes the description, icon, and title dynamically based on the selected tool.
- **Tool-Specific Input Fields**: Displays or hides input fields for drawing lines or rectangles based on the tool selected.
- **Tool Buttons**: Handles tool button interactions like selecting tools, drawing lines, rectangles, and calculating centroids.

---

## Conclusion

This HTML document defines the layout and interactivity of the **Centroid Calculator** web application. The toolbar allows users to select tools for drawing and calculating centroids, while the canvas area displays the interactive grid where shapes are drawn. The functionality is enhanced with JavaScript for dynamic behavior and tool interaction.






# CSS Documentation for Centroid Calculator

This CSS file defines the styles for the **Centroid Calculator** web application. It includes layouts for the toolbar, canvas, buttons, input fields, and other UI elements. Below is a detailed explanation of how the different parts of the application are styled.

---

## Global Styles

### Body

```
body {
  display: flex;
  margin: 0;
  font-family: Arial, sans-serif;
}

```

- **display: flex**: Uses a flexbox layout for the body to ensure child elements (like the toolbar and canvas) are arranged properly.
- **margin: 0**: Removes any default margin applied by the browser.
- **font-family: Arial, sans-serif**: Sets the default font for the page to Arial or sans-serif.

### Canvas Container

```
#canvas-container {
  margin-left: 220px; /* Space for the sidebar */
  padding: 20px;
  flex-grow: 1; /* Ensures the canvas container takes up remaining space */
}

```

- **margin-left: 220px**: Adds space to the left of the canvas for the sidebar (toolbar).
- **padding: 20px**: Adds padding around the canvas for spacing.
- **flex-grow: 1**: Ensures the canvas takes up the remaining space on the page after the sidebar.

---

## Toolbar (Sidebar)

### Toolbar Container

```
#toolbar {
  width: 200px;
  height: 100vh;
  background-color: #f4f4f4;
  position: fixed;
  top: 0;
  left: 0;
  display: flex;
  flex-direction: column;
  grid-template-columns: 1fr;
  grid-gap: 5px;
  padding: 10px;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  align-items: start;
  overflow-y: auto;
}

```

- **width: 200px**: Defines the width of the toolbar (sidebar).
- **height: 100vh**: Ensures the toolbar spans the full height of the viewport.
- **background-color: #f4f4f4**: Sets a light gray background color for the toolbar.
- **position: fixed**: Fixes the toolbar at the left side of the page, so it remains visible when scrolling.
- **top: 0, left: 0**: Positions the toolbar at the top-left corner.
- **display: flex, flex-direction: column**: Arranges the toolbar elements in a vertical column.
- **grid-template-columns: 1fr**: Defines a single column layout for grid items (though not heavily used here).
- **box-shadow**: Adds a subtle shadow to the right of the toolbar for better separation.
- **overflow-y: auto**: Allows vertical scrolling if the content inside the toolbar exceeds the height.

---

## Tool Buttons

### Tool Button 

```
.tool-button {
  padding: 4px 8px;
  font-size: 16px;
  cursor: pointer;
  border: 2px solid #ccc;
  background-color: #fff;
  border-radius: 5px;
  display: flex;
  align-items: center;
  transition: background-color 0.3s, color 0.3s;
  text-align: center;
  white-space: nowrap;
  align-self: start;
  margin: 0;
  width: 100%;
}

```

- **padding**: Adds internal padding inside the button for a comfortable clickable area.
- **font-size**: Sets the font size of the button text.
- **cursor: pointer**: Changes the cursor to a pointer when hovering over the button, indicating it is clickable.
- **border**: Adds a light gray border around the button.
- **background-color**: Sets the background color to white for the button.
- **border-radius**: Rounds the corners of the button for a smooth look.
- **display: flex, align-items: center**: Ensures that the button's content is centered vertically and horizontally.
- **transition**: Adds smooth transitions when the background color or text color changes (e.g., on hover).
- **white-space: nowrap**: Prevents the button text from wrapping to multiple lines.
- **align-self: start**: Aligns the button to the left within its container.

### Active Button

```
.tool-button.active {
  background-color: #A9A9A9;
  color: white;
  border-color: #A9A9A9;
}

```

- **background-color**: Changes the background color of the active button to a dark gray.
- **color**: Sets the text color to white for the active button.
- **border-color**: Matches the border color to the background when the button is active.

### Hover Effect

```
.tool-button:hover {
  background-color: #ddd;
}

```

- **background-color**: Changes the background color to light gray when the button is hovered over.

---

## Input Textboxes for Line and Rectangle Drawing

### Line Text Input

```
#line_text {
  display: none;
  margin-top: 5px;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}
.line_textbox {
  margin-bottom: 10px;
  padding: 4px 8px;
  margin-right: 10px;
  width: 80%;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.submit_button {
  margin-bottom: 10px;
  padding: 4px 8px;
  margin-right: 10px;
  width: 50%;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #fff;
}
.submit_button:hover {
  background-color: #ddd;
}

```

- **#line_text**: Initially hidden but displayed when the draw line tool is selected. The opacity transition ensures smooth visibility.
- **.line_textbox**: Styles the input fields for entering the coordinates of the line. It includes padding, borders, and rounded corners.
- **.submit_button**: Styled for the button used to submit the line coordinates. It has padding, borders, and changes color when hovered over.

### Rectangle Text Input

```
#rect_text {
  display: none;
  margin-top: 5px;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}
.rect_textbox {
  margin-bottom: 10px;
  padding: 4px 8px;
  margin-right: 10px;
  width: 80%;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.rect_textbox_small {
  margin-bottom: 10px;
  padding: 4px 8px;
  margin-right: 10px;
  width: 33%;
  border: 1px solid #ccc;
  border-radius: 4px;
  float: left;
}

```

- **#rect_text**: Like the `#line_text` element, this is initially hidden and displayed when the rectangle tool is selected.
- **.rect_textbox**: Styles the input fields used to enter rectangle coordinates.
- **.rect_textbox_small**: Used for smaller input fields for the width and height of the rectangle.

---

## Information Section

### Info Text Styling

```
#info_text {
  margin-top: 0;
  text-align: center;
  opacity: 100;
  transition: opacity 0.5s ease-in-out;
}

```

- **#info_text**: The area where the current tool's description is displayed. The opacity transition ensures a smooth fade-in and fade-out effect when switching between tools.

---

## Horizontal Rule

### Styling for `<hr>`

```
hr {
  border: 0;
  clear: both;
  display: block;
  width: 96%;
  background-color: #555;
  height: 2px;
}

```

- **width: 96%**: Sets the width of the horizontal rule to 96% of its container width.
- **background-color**: The color of the horizontal line is a dark gray.
- **height: 2px**: Makes the line 2px thick for a clean, subtle division.

---

## Image Styling

### Info Image

```
#info_image {
  border: 3px solid #555;
}

```

- **#info_image**: Adds a border around the image that is displayed in the information section.

---

## Conclusion

This CSS file provides the layout and style for the **Centroid Calculator** web application. The design focuses on user experience, ensuring that the toolbar, canvas, input fields, and buttons are cleanly styled and easy to use. It also supports responsive behavior and smooth transitions for better interaction and visual feedback.



# JavaScript Documentation for Centroid Calculator

This JavaScript file contains the logic for managing the interaction between the **Centroid Calculator** user interface and the `ShapeBuilder` WebAssembly module. It handles the drawing of lines, rectangles, grid management, mouse events, zoom functionality, and tool management.

---

## Import Statement

```
import init, { ShapeBuilder} from './dist/centroid_calculator.js';

```

- **init**: Initializes the WebAssembly package (`centroid_calculator.js`), setting up the required environment.
- **ShapeBuilder**: Imports the `ShapeBuilder` class, which is used to create and manipulate shapes (e.g., lines and rectangles).

---

## Drawing Functions

### `drawLine(line, color, ctx)`

```
function drawLine(line, color, ctx) {
  // Draw the line
  ctx.beginPath();
  ctx.moveTo(line[0][0], line[0][1]);
  ctx.lineTo(line[1][0], line[1][1]);
  ctx.strokeStyle = color;
  ctx.stroke();

  // Draw circles at the endpoints of a line
  drawVertex(line[0][0], line[0][1], 'black', ctx);
  drawVertex(line[1][0], line[1][1], 'black', ctx);
}

```

- **Purpose**: Draws a line on the canvas and places small circles at the endpoints of the line.
- **Parameters**:
    - `line`: Array containing two points `[x1, y1]` and `[x2, y2]`.
    - `color`: The color of the line to be drawn.
    - `ctx`: The 2D context of the canvas where the line will be drawn.

### `drawGrid(relativeScale, factor, offsetX, offsetY, ctx)`

```
function drawGrid(relativeScale, factor, offsetX, offsetY, ctx) {
  //drawing the light gray lines
  //vertical lines
  for (let i = -16; i <= 16; i++) {
    let xPos = i * (50 * relativeScale) + offsetX % (50 * relativeScale) + 400;
    let yPos = 322 + offsetY;
    drawLine([[xPos,-50],[xPos,650]], 'lightgray', ctx);
    // Drawing grid labels
    let num = (i + shiftFactor) * factor;
    ctx.fillText(num.toString(), xPos - 3, yPos);
  }

  //horizontal lines
  for (let i = -12; i <= 12; i++) {
    let yPos = i * (50 * relativeScale) + offsetY % (50 * relativeScale) + 300;
    drawLine([[-50,yPos],[850,yPos]], 'lightgray', ctx);
    // Drawing grid labels
    ctx.fillText(num.toString(), xPos, yPos + 5);
  }

  //drawing the main axes
  drawLine([[-50, 300 + offsetY],[850, 300 + offsetY]], 'gray', ctx); //x-axis
  drawLine([[400 + offsetX, -50],[400 + offsetX, 6500]], 'gray', ctx); //y-axis
}

```

- **Purpose**: Draws the grid lines (both horizontal and vertical) on the canvas, including the main axes and labels.
- **Parameters**:
    - `relativeScale`: Scale of the grid (used for zooming).
    - `factor`: Factor used for grid labels (e.g., scale factor for numerical labels).
    - `offsetX`, `offsetY`: Offsets to shift the grid.
    - `ctx`: The 2D context of the canvas for drawing.

---

## Helper Functions

### `drawVertex(x, y, color, ctx)`

```
function drawVertex(x, y, color, ctx) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2); // Draw a circle with radius 5
  ctx.fillStyle = color;
  ctx.fill();
}

```

- **Purpose**: Draws a small circle at the specified coordinates (used for drawing vertices at the ends of lines and rectangles).
- **Parameters**:
    - `x`, `y`: Coordinates of the vertex.
    - `color`: The color of the vertex.
    - `ctx`: The 2D context of the canvas.

---

## Tool Management

### `setActiveButton(buttonId)`

```
function setActiveButton(buttonId) {
  // Remove active class from all buttons
  document.querySelectorAll('.tool-button').forEach(button => {
    button.classList.remove('active');
  });

  // Add active class to the selected button
  const selectedButton = document.getElementById(buttonId);
  if (selectedButton) {
    selectedButton.classList.add('active');
  }
}

```

- **Purpose**: Sets the clicked tool button as active by adding the `active` class, while removing it from all other buttons.
- **Parameters**:
    - `buttonId`: The ID of the button to be set as active.

---

## Mouse Event Handlers

### `distance2Line(ax, ay, bx, by, cx, cy)`

```
function distance2Line(ax, ay, bx, by, cx, cy) {
  let [A,B,C,D] = [(cx - ax), (cy - ay), (bx - ax), (by - ay)];
  let dot = A * C + B * D;
  let len_sq = C * C + D * D;
  let param = dot / len_sq;  
  var xx, yy;
  if (param < 0) {
    xx = ax;
    yy = ay;
  } else if (param > 1) {
    xx = bx;
    yy = by;
  } else {
    xx = ax + param * C;
    yy = ay + param * D;
  }
  let distance2 = (cx - xx)**2 + (cy - yy)**2;
  return distance2;
}

```

- **Purpose**: Calculates the square of the distance from a point (`cx`, `cy`) to a line segment defined by two points (`ax`, `ay`) and (`bx`, `by`).
- **Parameters**:
    - `ax`, `ay`: Coordinates of the first point on the line.
    - `bx`, `by`: Coordinates of the second point on the line.
    - `cx`, `cy`: Coordinates of the point to measure distance from.
- **Returns**: The squared distance between the point and the line.

### `distance2Point(ax, ay, cx, cy)`

```
function distance2Point(ax, ay, cx, cy) {
  let distance2 = (cx - ax)**2 + (cy - ay)**2;
  return distance2;
}

```

- **Purpose**: Calculates the squared distance between two points.
- **Parameters**:
    - `ax`, `ay`: Coordinates of the first point.
    - `cx`, `cy`: Coordinates of the second point.
- **Returns**: The squared distance between the two points.

---

## Event Listeners and Tool Actions

### Canvas Event Listeners

```
canvas.addEventListener('mousedown', function (e) {
  // Handle mouse events for drawing or selecting shapes on the canvas
  // Depending on the selected tool, it either initiates drawing or starts shifting the grid
});

```

- **Purpose**: Handles mouse down events to begin drawing shapes, select items, or shift the grid.

### `mousemove` Event

```
canvas.addEventListener('mousemove', function (e) {
  // Handles drawing in real-time (drawing lines, rectangles) and displaying coordinates/lengths of selected elements.
});

```

- **Purpose**: Tracks mouse movement for drawing lines, rectangles, and for showing feedback like line length or vertex coordinates.

### `mouseup` Event

```
canvas.addEventListener('mouseup', function (e) {
  // Finalizes the drawing of shapes (lines, rectangles) and updates the canvas.
});

```

- **Purpose**: Completes the drawing of shapes when the mouse button is released.

### `wheel` Event (Zooming)

```
canvas.addEventListener('wheel', function (e) {
  // Zooms the grid in and out using the mouse wheel.
});

```

- **Purpose**: Enables zooming in and out of the grid when the user scrolls the mouse wheel.

---

## Tool Buttons

Event listeners are added to the toolbar buttons (e.g., `selectButton`, `drawLineButton`, etc.) to trigger specific tool actions such as drawing lines, rectangles, calculating centroids, or clearing the canvas.

Each button performs actions like changing the current tool, validating inputs, and updating the canvas with drawn shapes.

---

### Summary

This JavaScript file manages user interactions with the canvas, including drawing, selecting, deleting, and zooming tools. It interacts with a WebAssembly `ShapeBuilder` object to maintain and manipulate shapes, and updates the canvas in real-time based on the user's actions. The code provides the core functionality for grid management, mouse events, and tool state management within the **Centroid Calculator** application.

