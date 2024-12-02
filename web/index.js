import init, { ShapeBuilder} from './dist/centroid_calculator.js';

function drawLine(line, ctx) {
  // Draw the line
  ctx.beginPath();
  ctx.moveTo(line[0][0], line[0][1]);
  ctx.lineTo(line[1][0], line[1][1]);
  ctx.stroke();

  // Draw circles at the endpoints of a line
  drawVertex(line[0][0], line[0][1], ctx);
  drawVertex(line[1][0], line[1][1], ctx);
}

// Helper function to draw circles at any vertex (technically, we can do it at any arbitrary point...)
function drawVertex(x, y, ctx) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2); // Draw a circle with radius 5
  ctx.fillStyle = 'black';
  ctx.fill();
}

// Helper function to manage active button state
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

window.onload = async function() {
  await init(); // Initialize Wasm package

  const shapeBuilder = ShapeBuilder.new();
  let lines;

  const canvas = document.getElementById('centroidCanvas');
  if(!canvas) {
    console.error("Canvas not found!");
    
  }
  else { console.log("Canvas found!")}
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error("Failed to get canvas context!")
  }
  else { console.log("Context found!")}
  
  let currentTool = 'drawLine';

  let startX, startY, isDrawing = false;
  let rectStartX, rectStartY = false;


  setActiveButton('drawLineButton');

  // ==================[ TOOLBAR ]==========================
  // Event Listeners for toolbar buttons

  document.getElementById('drawLineButton').addEventListener('click', () => {
    currentTool = 'drawLine';
    console.log("Draw Line Tool Selected");

    // Set active class on selected tool and remove from others
    setActiveButton('drawLineButton');

    startX = null;
    startY = null;
  });

  document.getElementById('rectangleButton').addEventListener('click', function() {
    currentTool = 'drawRect';
    setActiveButton('rectangleButton');
    console.log("Rectangle Tool Selected");

    rectStartX = null;
    rectStartY = null;
  })

  document.getElementById('deleteLineButton').addEventListener('click', function() {
    currentTool = 'deleteLine';
    setActiveButton('deleteLineButton');
    console.log("Delete Line Tool Selected");
  })

  document.getElementById('calculateCentroidButton').addEventListener('click', () => {
    currentTool = 'calculateCentroid';
    console.log("Calculate Centroid Tool Selected");

    // Set active class on selected tool button and remove from others
    setActiveButton('calculateCentroidButton');

    // Calculate the centroid if a shape is closed
    
    // Check if the shape is closed 
    let isClosed = false;

    if (shapeBuilder.get_lines().length >= 3) {
      const lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
      const firstLine = lines[0];
      const lastLine = lines[lines.length - 1];

      // Check if the last point of the last line matches the first point of the first line 
      if (firstLine[0][0] === lastLine[1][0] && firstLine[0][1] === lastLine[1][1]) {
        isClosed = true;
        console.log("Shape is closed, centroid calculated!");
      }
    }
    const centroid = shapeBuilder.calculate_centroid();
    if (centroid && centroid !== null) /* && (isClosed)) */ { // Detecting if a shape is closed is not working atm
      console.log('Centroid: ', centroid);

      // Draw the centroid on the canvas
      ctx.beginPath();
      ctx.arc(centroid[0], centroid[1], 5, 0, Math.PI * 2);
      ctx.fillStyle = 'red';
      ctx.fill();
    }
    else {
      console.log("Centroid calculation failed or insufficient points.")
    }
  });

  document.getElementById('clearButton').addEventListener('click', () => {
    shapeBuilder.clear();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    console.log("Canvas Cleared");
  });

  // ================[ END TOOLBAR ]========================

  // ================[ MOUSE EVENTS ]=======================
  // Handles drawing

  canvas.addEventListener('mousedown', function (e) {
    if (currentTool === 'drawLine') {
      startX = e.offsetX;
      startY = e.offsetY;
      isDrawing = true;
      console.log("Mouse down:", startX, startY);
    }
    if (currentTool === 'drawRect') {
      rectStartX = e.offsetX;
      rectStartY = e.offsetY;
      isDrawing = true;
      console.log("Mouse down:", rectStartX, rectStartY);
    }
    
    if (currentTool === 'deleteLine') {
      lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
      lines.forEach(line => {
        let [ax, ay, bx, by, cx, cy] = [line[0][0], line[0][1], line[1][0], line[1][1], e.offsetX, e.offsetY];
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
        if (distance2 <= 40) {
          shapeBuilder.delete_line(ax, ay, bx, by);
        }
      });
    }
  });

  canvas.addEventListener('mousemove', function (e) {
    if (!isDrawing && currentTool != 'deleteLine') return;

    const endX = e.offsetX;
    const endY = e.offsetY;

    //console.log("Mouse move:", endX, endY);

    // Clear the canvas and redraw all lines
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // Draw all stored lines
    try {
      lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
      lines.forEach(line => {
        drawLine(line, ctx);
      });
      //console.log("Lines retrieved:", lines);
    } catch (err) {
      console.error("Error retrieving lines:", err)
      lines = [];
    }

    if (currentTool === 'drawLine') {
      // Draw the current line being drawn
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      drawVertex(startX, startY, ctx);
      drawVertex(endX, endY, ctx);
    }

    if (currentTool === 'drawRect') {
      // Draw the current rectangle
      ctx.beginPath();
      ctx.rect(rectStartX, rectStartY, endX - rectStartX, endY - rectStartY);
      ctx.stroke();

      // Draw circles at the rectangle's vertices (corners)
      drawVertex(rectStartX, rectStartY, ctx); // Top-left
      drawVertex(rectStartX, endY, ctx);       // Bottom-left
      drawVertex(endX, rectStartY, ctx);       // Top-right
      drawVertex(endX, endY, ctx);             // Bottom-right
    }

    if (currentTool === 'deleteLine') {
      // HIGHLIGHT A LINE IF HOVERING OVER IT
      lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
      lines.forEach(line => {
        let [ax, ay, bx, by, cx, cy] = [line[0][0], line[0][1], line[1][0], line[1][1], e.offsetX, e.offsetY];
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
        if (distance2 <= 40) {
          ctx.beginPath();
          ctx.moveTo(line[0][0], line[0][1]);
          ctx.lineTo(line[1][0], line[1][1]);
          ctx.strokeStyle = 'yellow';
          ctx.stroke();
          ctx.strokeStyle = "black";
        }
      });
    }
  }); 

  canvas.addEventListener('mouseup', function (e) {
    if (!isDrawing) return; 

    isDrawing = false;
    const endX = e.offsetX;
    const endY = e.offsetY;

    // Add the shape to the shape builder
    if (currentTool === 'drawRect') {
      // Ensure all coordinates are valid numbers
      if (isNaN(rectStartX) || isNaN(rectStartY) || isNaN(endX) || isNaN(endY)) {
        console.error("Invalid coordinates passed to add_rectangle:", rectStartX, rectStartY, endX, endY);
        return;
      }
      shapeBuilder.add_rect(rectStartX, rectStartY, endX, endY);
      console.log("Rectangle added to ShapeBuilder:", rectStartX, rectStartY, endX, endY);
    } else if (currentTool === 'drawLine') {
      if (isNaN(endX) || isNaN(endY)) {
        console.error("Invalid coordinates passed to add_line:", startX, startY, endX, endY);
        return;
      }
      shapeBuilder.add_line(startX, startY, endX, endY);
      console.log("Line added to ShapeBuilder:", startX, startY, endX, endY);
    } else {
      console.log("Invalid Shape.");
    }

    

    // Redraw all lines and shapes
    lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
    lines.forEach(line => {
      drawLine(line, ctx);
    });

    // Reset Coordinates after drawing.
    rectStartX = null;
    rectStartY = null;
    startX = null;
    startY = null;
    // Draw circles at the rectangle's vertices (if it's a rectangle)
    // 
    //if (currentTool === 'drawRect') {
      //drawVertex(rectStartX, rectStartY, ctx); // Top-left
      //drawVertex(rectStartX, endY, ctx);       // Bottom-left
      //drawVertex(endX, rectStartY, ctx);       // Top-right
      //drawVertex(endX, endY, ctx);             // Bottom-right
    //}    
  });

  // =======================[ END MOUSE EVENTS ]==================================
  
};

//await init();
//wasm.greet();