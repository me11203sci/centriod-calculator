import init, { ShapeBuilder} from './dist/centroid_calculator.js';

function drawLines(line, ctx) {
    ctx.beginPath();
    ctx.moveTo(line[0][0], line[0][1]);
    ctx.lineTo(line[1][0], line[1][1]);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(line[0][0], line[0][1], 5, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(line[1][0], line[1][1], 5, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
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
  let startX, startY, isDrawing = false;
<<<<<<< Updated upstream
  

  canvas.addEventListener('mousedown', function (e) {
    startX = e.offsetX;
    startY = e.offsetY;
    isDrawing = true;
    console.log("Mouse down:", startX, startY);
=======
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
>>>>>>> Stashed changes
  });

  canvas.addEventListener('mousemove', function (e) {
    if (!isDrawing && currentTool != "deleteLine") return;

    const endX = e.offsetX;
    const endY = e.offsetY;

    //console.log("Mouse move:", endX, endY);

    // Clear the canvas and redraw all lines
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // Draw all stored lines
    try {
      lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
<<<<<<< Updated upstream
      console.log("Lines retrieved:", lines);
=======
      lines.forEach(line => {
        drawLine(line, ctx);
      });
      //console.log("Lines retrieved:", lines);
>>>>>>> Stashed changes
    } catch (err) {
      console.error("Error retrieving lines:", err)
      lines = [];
    }

    lines.forEach(line => {
      drawLines(line, ctx);
    });

<<<<<<< Updated upstream
    // Draw the current line being drawn
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(startX, startY, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(endX, endY, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
=======
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

>>>>>>> Stashed changes
  }); 

  canvas.addEventListener('mouseup', function (e) {
    
    isDrawing = false;

    if (startX == null || startY == null){
      console.error("invalid mouse coordinates: ", startX, startY);
      return;
    }

    const endX = e.offsetX;
    const endY = e.offsetY;


    // Ensure all coordinates are valid numbers
    if (isNaN(startX) || isNaN(startY) || isNaN(endX) || isNaN(endY)) {
      console.error("Invalid coordinates passed to add_line:", startX, startY, endX, endY);
      return;
    }

    console.log("Adding line with coordinates:", startX, startY, endX, endY);
    
    
    // Add the line to the shape 
    shapeBuilder.add_line(startX, startY, endX, endY);
    
    //redraws any lines
    lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
    lines.forEach(line => {
      drawLines(line, ctx);
    });
<<<<<<< Updated upstream

    console.log("ShapeBuilder state:", shapeBuilder);
    try {
        lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
        console.log("Lines retrieved after adding line:", lines);
    } catch (err) {
        console.error("Error retrieving lines after adding:", err);
        lines = [];
    }
=======
    console.log("Lines retrieved:", lines);
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
>>>>>>> Stashed changes

    // Calculate the centroid if a shape is closed
    const centroid = shapeBuilder.calculate_centroid();
    if (centroid && centroid !== null) {
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

    // Check if the shape is closed 
    if (shapeBuilder.get_lines().length >= 3) {
      const lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
      const firstLine = lines[0];
      const lastLine = lines[lines.length - 1];

      // Check if the last point of the last line matches the first point of the first line 
      if (firstLine[0][0] === lastLine[1][0] && firstLine[0][1] === lastLine[1][1]) {
        console.log("Shape is closed, centroid calculated!");
      }
    }

  });
  
  document.getElementById('clearButton').addEventListener('click', () =>{
    shapeBuilder.clear();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });
};

//await init();
//wasm.greet();
