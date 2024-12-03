import init, { ShapeBuilder} from './dist/centroid_calculator.js';

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

//Draws the grid
function drawGrid(relativeScale, factor, offsetX, offsetY, ctx) {
  //drawing the light gray lines
  //vertical lines
  for (let i = -16; i <= 16; i++) {
    let xPos = i * (50 * relativeScale) + offsetX % (50 * relativeScale) + 400;
    let yPos = 322 + offsetY;
    drawLine([[xPos,-50],[xPos,650]], 'lightgray', ctx);
    let offset = offsetX;
    let shiftFactor = 0;
    let step = 50 * relativeScale;
    if (Math.abs(offset) >= step) {
      shiftFactor = Math.floor(Math.abs(offset) / step) * Math.sign(offsetX) * -1;
    }
    let num = (i + shiftFactor) * factor;
    ctx.font = "15px Arial";
    xPos -= ctx.measureText(num).width;
    if (yPos > 590) {
      yPos = 590;
      ctx.fillStyle = "gray";
    }
    else if (yPos < 20) {
      yPos = 20;
      ctx.fillStyle = "gray";
    }
    else {
      ctx.fillStyle = "black";
    }
    ctx.fillText(num.toString(), xPos - 3, yPos);
  }
  //horizontal lines
  for (let i = -12; i <= 12; i++) {
    let yPos = i * (50 * relativeScale) + offsetY % (50 * relativeScale) + 300;
    drawLine([[-50,yPos],[850,yPos]], 'lightgray', ctx);
    let offset = offsetY;
    let shiftFactor = 0;
    let step = 50 * relativeScale;
    if (Math.abs(offset) >= step) {
      shiftFactor = Math.floor(Math.abs(offset) / step) * Math.sign(offsetY) * -1;
    }
    let num = (i + shiftFactor) * factor * -1;
    ctx.font = "15px Arial";
    let xPos = 394 - ctx.measureText(num).width + offsetX;
    if (xPos + ctx.measureText(num).width > 792) {
      xPos = 792 - ctx.measureText(num).width;
      ctx.fillStyle = "gray";
    }
    else if (xPos < 10) {
      xPos = 10;
      ctx.fillStyle = "gray";
    }
    else {
      ctx.fillStyle = "black";
    }
    if (num != 0) {
      ctx.fillText(num.toString(), xPos, yPos + 5);
    }
  }

  //drawing the main axes
  drawLine([[-50, 300 + offsetY],[850, 300 + offsetY]], 'gray', ctx); //x-axis
  drawLine([[400 + offsetX, -50],[400 + offsetX, 6500]], 'gray', ctx); //y-axis
}

// Helper function to draw circles at any vertex (technically, we can do it at any arbitrary point...)
function drawVertex(x, y, color, ctx) {
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2); // Draw a circle with radius 5
  ctx.fillStyle = color;
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


// Helper function that gets the distance squared from the cursor to any given line
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

// Helper function that gets the distance squared from the cursor to any given point
function distance2Point(ax, ay, cx, cy) {
  let distance2 = (cx - ax)**2 + (cy - ay)**2;
  return distance2;
}

window.onload = async function() {
  await init(); // Initialize Wasm package

  const shapeBuilder = ShapeBuilder.new();
  let lines;

  let gridOffsetX = 0;
  let gridOffsetY = 0;
  let factor = 1;
  let scale = 1;
  let relativeScale = 1;

  //scale is used to keep track of the actual size of lines being drawn on the grid
  //relativeScale is used to size of the ticks and have them size appropriately

  let mouseX = 0;
  let mouseY = 0;

  //These are exclusively used to globally track mouse position for the wheel event to use

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
  
  
  let currentTool = 'select';

  let startX, startY, isDrawing, gridShift = false;
  let rectStartX, rectStartY = false;

  //Draws the initial grid lines
  drawGrid(relativeScale, factor, gridOffsetX, gridOffsetY, ctx);
  setActiveButton('selectButton');

  // ==================[ TOOLBAR ]==========================
  // Event Listeners for toolbar buttons
  document.getElementById('selectButton').addEventListener('click', () => {
    currentTool = 'select';
    console.log("Select Tool Selected");
    startX = null;
    startY = null;
    // Set active class on selected tool and remove from others
    setActiveButton('selectButton');
  });

  document.getElementById('drawLineButton').addEventListener('click', () => {
    currentTool = 'drawLine';
    console.log("Draw Line Tool Selected");

    // Set active class on selected tool and remove from others
    setActiveButton('drawLineButton');

    startX = null;
    startY = null;
  });
  document.getElementById('drawNumLineButton').addEventListener('click', () => {
    currentTool = 'drawLine';
    console.log("Numerical Input Line Drawn");

    // Set active class on selected tool and remove from others
    setActiveButton('drawLineButton');
    let valid = true;
    let point1 = document.getElementById("linePoint1").value.replace("(","").replace(")","").replace(/\s + /g, "").split(",");
    let point2 = document.getElementById("linePoint2").value.replace("(","").replace(")","").replace(/\s + /g, "").split(",");
    
    point1[0] = parseFloat(point1[0]);
    point1[1] = parseFloat(point1[1]);
    point2[0] = parseFloat(point2[0]);
    point2[1] = parseFloat(point2[1]);
    if (isNaN(point1[0]) || isNaN(point1[1])) {
      document.getElementById("linePoint1").value = "INVALID INPUT";
      valid = false;
    }
    if (isNaN(point2[0]) || isNaN(point2[1])) {
      document.getElementById("linePoint2").value = "INVALID INPUT";
      valid = false;
    }
    if (valid) {
      shapeBuilder.add_line((point1[0] * 50) + 400, -(point1[1] * 50) + 300, (point2[0] * 50) + 400, -(point2[1] * 50) + 300);
      document.getElementById("linePoint1").value = "";
      document.getElementById("linePoint2").value = "";
    }

    // Redraw all lines and shapes
    drawGrid(relativeScale, factor, gridOffsetX, gridOffsetY, ctx);
    lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
    lines.forEach(line => {
      [line[0][0], line[0][1], line[1][0], line[1][1]] = [line[0][0] + gridOffsetX - (400 - line[0][0]) * (scale - 1), line[0][1] + gridOffsetY - (300 - line[0][1]) * (scale - 1), line[1][0] + gridOffsetX - (400 - line[1][0]) * (scale - 1), line[1][1] + gridOffsetY - (300 - line[1][1]) * (scale - 1)]
      drawLine(line, 'black', ctx);
    });
  });

  document.getElementById('rectangleButton').addEventListener('click', function() {
    currentTool = 'drawRect';
    setActiveButton('rectangleButton');
    console.log("Rectangle Tool Selected");

    rectStartX = null;
    rectStartY = null;
  })

  document.getElementById('drawNumRectButton').addEventListener('click', () => {
    currentTool = 'drawRect';
    setActiveButton('rectangleButton');
    console.log("Rectangle Tool Selected");

    let valid = true;
    let point1 = document.getElementById("rectPoint1").value.replace("(","").replace(")","").replace(/\s + /g, "").split(",");
    let width = document.getElementById("rectW").value;
    let height = document.getElementById("rectH").value;
    
    point1[0] = parseFloat(point1[0]);
    point1[1] = parseFloat(point1[1]);
    width = parseFloat(width);
    height = parseFloat(height);
    if (isNaN(point1[0]) || isNaN(point1[1])) {
      document.getElementById("rectPoint1").value = "INVALID INPUT";
      valid = false;
    }
    if (isNaN(width)) {
      document.getElementById("rectW").value = "INVALID";
      valid = false;
    }
    if (isNaN(height)) {
      document.getElementById("rectH").value = "INVALID";
      valid = false;
    }
    if (valid) {
      shapeBuilder.add_rect((point1[0] * 50) + 400, -(point1[1] * 50) + 300, ((point1[0] + width) * 50) + 400, -((point1[1] - height) * 50) + 300);
      document.getElementById("rectPoint1").value = "";
      document.getElementById("rectW").value = "";
      document.getElementById("rectH").value = "";
    }
    // Redraw all lines and shapes
    drawGrid(relativeScale, factor, gridOffsetX, gridOffsetY, ctx);
    lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
    lines.forEach(line => {
      [line[0][0], line[0][1], line[1][0], line[1][1]] = [line[0][0] + gridOffsetX - (400 - line[0][0]) * (scale - 1), line[0][1] + gridOffsetY - (300 - line[0][1]) * (scale - 1), line[1][0] + gridOffsetX - (400 - line[1][0]) * (scale - 1), line[1][1] + gridOffsetY - (300 - line[1][1]) * (scale - 1)]
      drawLine(line, 'black', ctx);
    });
  });


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
      let actualX0 = centroid[0] + gridOffsetX - (400 - centroid[0]) * (scale - 1);
      let actualY0 = centroid[1] + gridOffsetY - (300 - centroid[1]) * (scale - 1);
      drawVertex(actualX0, actualY0, 'red', ctx);
      ctx.fillStyle = "red";
      let xPos = (actualX0 - gridOffsetX - 400) / 50;
      let yPos = (actualY0 - gridOffsetY - 300) / -50;
      ctx.fillText("(" + xPos.toString() + ", " + yPos.toString() + ")", actualX0 + 11, actualY0 - 4);
    }
    else {
      console.log("Centroid calculation failed or insufficient points.")
    }
  });

  document.getElementById('clearButton').addEventListener('click', () => {
    shapeBuilder.clear();
    gridOffsetX = 0;
    gridOffsetY = 0;
    scale = 1;
    relativeScale = 1;
    factor = 1;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid(relativeScale, factor, gridOffsetX, gridOffsetY, ctx);
    console.log("Canvas Cleared");
  });

  // ================[ END TOOLBAR ]========================

  // ================[ MOUSE EVENTS ]=======================
  // Handles drawing

  canvas.addEventListener('mousedown', function (e) {
    if (currentTool === 'select') {
      startX = e.offsetX;
      startY = e.offsetY;
      gridShift = true;
    }
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
        let distance2 = distance2Line(line[0][0] + gridOffsetX - (400 - line[0][0]) * (scale - 1), line[0][1] + gridOffsetY - (300 - line[0][1]) * (scale - 1), line[1][0] + gridOffsetX - (400 - line[1][0]) * (scale - 1), line[1][1] + gridOffsetY - (300 - line[1][1]) * (scale - 1), e.offsetX, e.offsetY);
        if (distance2 <= 35) {
          shapeBuilder.delete_line(line[0][0], line[0][1], line[1][0], line[1][1]);
          console.log("Line deleted:", line[0][0], line[0][1], line[1][0], line[1][1]);
        }
      });
    }
  });

  canvas.addEventListener('mousemove', function (e) {
    const endX = e.offsetX;
    const endY = e.offsetY;
    mouseX = e.offsetX;
    mouseY = e.offsetY;

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all stored lines
    drawGrid(relativeScale, factor, gridOffsetX, gridOffsetY, ctx);
    try {
      //adjusting for grid offsets
      lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
      lines.forEach(line => {
        [line[0][0], line[0][1], line[1][0], line[1][1]] = [line[0][0] + gridOffsetX - (400 - line[0][0]) * (scale - 1), line[0][1] + gridOffsetY - (300 - line[0][1]) * (scale - 1), line[1][0] + gridOffsetX - (400 - line[1][0]) * (scale - 1), line[1][1] + gridOffsetY - (300 - line[1][1]) * (scale - 1)]
        drawLine(line, 'black', ctx);
      });
      //console.log("Lines retrieved:", lines);
    } catch (err) {
      console.error("Error retrieving lines:", err)
      lines = [];
    }

    if (currentTool === 'select' && !gridShift) {
      lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
      let drawnCoords = [];
      lines.forEach(line => {
        let [actualX0, actualY0, actualX1, actualY1] = [line[0][0], line[0][1], line[1][0], line[1][1]];
        [line[0][0], line[0][1], line[1][0], line[1][1]] = [line[0][0] + gridOffsetX - (400 - line[0][0]) * (scale - 1), line[0][1] + gridOffsetY - (300 - line[0][1]) * (scale - 1), line[1][0] + gridOffsetX - (400 - line[1][0]) * (scale - 1), line[1][1] + gridOffsetY - (300 - line[1][1]) * (scale - 1)]
        let distance2A = distance2Point(line[0][0], line[0][1], e.offsetX, e.offsetY);
        let distance2B = distance2Point(line[1][0], line[1][1], e.offsetX, e.offsetY);
        let distance2 = distance2Line(line[0][0], line[0][1], line[1][0], line[1][1], e.offsetX, e.offsetY);
        if (distance2A <= 40) {
          //highlights vertex and displays coordinates
          drawVertex(line[0][0], line[0][1], 'yellow', ctx);
          let xPos = (actualX0 - 400) / 50;
          let yPos = (actualY0 - 300) / -50;
          ctx.fillStyle = "black";
          if (!drawnCoords.includes((xPos, yPos))) {
            ctx.fillText("(" + xPos.toString() + ", " + yPos.toString() + ")", line[0][0] + 11, line[0][1] - 4);
            drawnCoords.push((xPos, yPos));
          }
        } else if (distance2B <= 40) {
          drawVertex(line[1][0], line[1][1], 'yellow', ctx);
          let xPos = (actualX1 - 400) / 50;
          let yPos = (actualY1 - 300) / -50;
          ctx.fillStyle = "black";
          if (!drawnCoords.includes((xPos, yPos))) {
            ctx.fillText("(" + xPos.toString() + ", " + yPos.toString() + ")", line[1][0] + 11, line[1][1] - 4);
            drawnCoords.push((xPos, yPos));
          }
        } else if (distance2 <= 35) {
          //highlights line and displays length
          let [xPos0, yPos0, xPos1, yPos1] = [(actualX0 - 400) / 50, (actualY0 - 300) / -50, (actualX1 - 400) / 50, (actualY1 - 300) / -50];
          let actualDistance = ((xPos0 - xPos1)**2 + (yPos0 - yPos1)**2)**0.5;
          ctx.fillStyle = "black";
          ctx.fillText("len = " + actualDistance.toString(), e.offsetX + 5, e.offsetY - 5);
          drawLine(line, 'yellow', ctx);
        }
      });
    }
    if (currentTool === 'select' && gridShift) {
      let currentX = e.offsetX;
      let currentY = e.offsetY;
      gridOffsetX += (currentX - startX);
      gridOffsetY += (currentY - startY);
      startX = currentX;
      startY = currentY;
    }
    if (currentTool === 'drawLine' && isDrawing) {
      // Draw the current line being drawn
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
      drawVertex(startX, startY, 'black', ctx);
      drawVertex(endX, endY, 'black', ctx);
    }

    if (currentTool === 'drawRect' && isDrawing) {
      // Draw the current rectangle
      ctx.beginPath();
      ctx.rect(rectStartX, rectStartY, endX - rectStartX, endY - rectStartY);
      ctx.stroke();

      // Draw circles at the rectangle's vertices (corners)
      drawVertex(rectStartX, rectStartY, 'black', ctx); // Top-left
      drawVertex(rectStartX, endY, 'black', ctx);       // Bottom-left
      drawVertex(endX, rectStartY, 'black', ctx);       // Top-right
      drawVertex(endX, endY, 'black', ctx);             // Bottom-right
    }

    if (currentTool === 'deleteLine') {
      // HIGHLIGHT A LINE IF HOVERING OVER IT
      lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
      lines.forEach(line => {
        [line[0][0], line[0][1], line[1][0], line[1][1]] = [line[0][0] + gridOffsetX - (400 - line[0][0]) * (scale - 1), line[0][1] + gridOffsetY - (300 - line[0][1]) * (scale - 1), line[1][0] + gridOffsetX - (400 - line[1][0]) * (scale - 1), line[1][1] + gridOffsetY - (300 - line[1][1]) * (scale - 1)]
        let distance2 = distance2Line(line[0][0], line[0][1], line[1][0], line[1][1], e.offsetX, e.offsetY);
        if (distance2 <= 35) {
          drawLine(line, 'red', ctx)
        }
      });
    }
  }); 

  canvas.addEventListener('mouseup', function (e) {
    if (!isDrawing && !gridShift) return; 

    isDrawing = false;
    gridShift = false;
    const endX = e.offsetX;
    const endY = e.offsetY;

    // Add the shape to the shape builder
    if (currentTool === 'drawRect') {
      // Ensure all coordinates are valid numbers
      if (isNaN(rectStartX) || isNaN(rectStartY) || isNaN(endX) || isNaN(endY)) {
        console.error("Invalid coordinates passed to add_rectangle:", rectStartX, rectStartY, endX, endY);
        return;
      }
      shapeBuilder.add_rect(rectStartX - gridOffsetX + (400 + gridOffsetX - rectStartX) * ((scale - 1) / scale), rectStartY - gridOffsetY + (300 + gridOffsetY - rectStartY) * ((scale - 1) / scale), endX - gridOffsetX + (400 + gridOffsetX - endX) * ((scale - 1) / scale), endY - gridOffsetY + (300 + gridOffsetY - endY) * ((scale - 1) / scale));
      console.log("Rectangle added to ShapeBuilder:", rectStartX, rectStartY, endX, endY);
    } else if (currentTool === 'drawLine') {
      if (isNaN(endX) || isNaN(endY)) {
        console.error("Invalid coordinates passed to add_line:", startX, startY, endX, endY);
        return;
      }
      shapeBuilder.add_line(startX - gridOffsetX + (400 + gridOffsetX - startX) * ((scale - 1) / scale), startY - gridOffsetY + (300 + gridOffsetY - startY) * ((scale - 1) / scale), endX - gridOffsetX + (400 + gridOffsetX - endX) * ((scale - 1) / scale), endY - gridOffsetY + (300 + gridOffsetY - endY) * ((scale - 1) / scale));
      console.log("Line added to ShapeBuilder:", startX, startY, endX, endY);
    } else {
      console.log("Invalid Shape.");
    }

    

    // Redraw all lines and shapes
    drawGrid(relativeScale, factor, gridOffsetX, gridOffsetY, ctx);
    lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
    lines.forEach(line => {
      [line[0][0], line[0][1], line[1][0], line[1][1]] = [line[0][0] + gridOffsetX - (400 - line[0][0]) * (scale - 1), line[0][1] + gridOffsetY - (300 - line[0][1]) * (scale - 1), line[1][0] + gridOffsetX - (400 - line[1][0]) * (scale - 1), line[1][1] + gridOffsetY - (300 - line[1][1]) * (scale - 1)]
      drawLine(line, 'black', ctx);
    });

    // Reset Coordinates after drawing.
    rectStartX = null;
    rectStartY = null;
    startX = null;
    startY = null;
  });


  // Adding a scroll zoom feature to the grid similar to Desmos
  canvas.addEventListener('wheel', function (e) {
    //scroll down: zoom out
    if (e.deltaY > 0 && !isDrawing) {
      let prevScale = scale;  
      scale /= 1 * 2**(1/10);
      relativeScale /= 1 * 2**(1/10);
      if (relativeScale < 1) {
        relativeScale = 1 * 2**(9/10);
        factor *= 2;
      }
      gridOffsetX -= (mouseX - 400 - gridOffsetX) * (1 - (1 * 2**(1/10)));
      gridOffsetY -= (mouseY - 300 - gridOffsetY) * (1 - (1 * 2**(1/10))); 
    }
    //scroll up: zoom in
    if (e.deltaY < 0 && !isDrawing) {
      let prevScale = scale;  
      scale *= 1 * 2**(1/10);
      relativeScale *= 1 * 2**(1/10);
      if (relativeScale > 1.9) {
        relativeScale = 1;
        factor /= 2;
      }
      gridOffsetX += (mouseX - 400 - gridOffsetX) * (1 - (1 * 2**(1/10)));
      gridOffsetY += (mouseY - 300 - gridOffsetY) * (1 - (1 * 2**(1/10))); 
    }
    if (!isDrawing) {
      //redraw all the lines
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGrid(relativeScale, factor, gridOffsetX, gridOffsetY, ctx);
      lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
      lines.forEach(line => {
        [line[0][0], line[0][1], line[1][0], line[1][1]] = [line[0][0] + gridOffsetX - (400 - line[0][0]) * (scale - 1), line[0][1] + gridOffsetY - (300 - line[0][1]) * (scale - 1), line[1][0] + gridOffsetX - (400 - line[1][0]) * (scale - 1), line[1][1] + gridOffsetY - (300 - line[1][1]) * (scale - 1)]
        drawLine(line, 'black', ctx);
      });
    }
  });
  // =======================[ END MOUSE EVENTS ]==================================
  
};

//await init();
//wasm.greet();