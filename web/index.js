import init, { ShapeBuilder} from './dist/centroid_calculator.js';


window.onload = async function() {
  await init(); // Initialize Wasm package

  const shapeBuilder = ShapeBuilder.new();

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


  canvas.addEventListener('mousedown', function (e) {
    startX = e.offsetX;
    startY = e.offsetY;
    isDrawing = true;
    console.log("Mouse down:", startX, startY);
  });

  canvas.addEventListener('mousemove', function (e) {
    if (!isDrawing) return;

    const endX = e.offsetX;
    const endY = e.offsetY;

    console.log("Mouse move:", endX, endY);

    // Clear the canvas and redraw all lines
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    // Draw all stored lines
    let lines;
    try {
      lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
      console.log("Lines retrieved:", lines);
    } catch (err) {
      console.error("Error retrieving lines:", err)
      lines = [];
    }


    lines.forEach(line => {
      ctx.beginPath();
      ctx.moveTo(line[0][0], line[0][1]);
      ctx.lineTo(line[1][0], line[1][1]);
      ctx.stroke();
    });

    // Draw the current line being drawn
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
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
    
    console.log("ShapeBuilder state:", shapeBuilder);
    let lines;
    try {
        lines = JSON.parse(JSON.stringify(shapeBuilder.get_lines()));
        console.log("Lines retrieved after adding line:", lines);
    } catch (err) {
        console.error("Error retrieving lines after adding:", err);
        lines = [];
    }

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
