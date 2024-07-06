let matterBodies = [];
let playerId;

function setup() {
  var canvas = createCanvas(900, 700);
  canvas.parent("canvas-container");

  const socket = io();

  socket.on("player id", (id) => {
    playerId = id;
    console.log("Assigned player ID:", playerId);
  });

  socket.on("matterState", (bodies) => {
    matterBodies = bodies;
  });

  canvas.mouseMoved(() => {
    socket.emit("mouseInput", { x: mouseX, y: mouseY, Id: playerId });
  });
}

function draw() {
  background(29);
  if (playerId % 2 == 0) {
    translate(width / 2, height / 2);
    scale(-1, -1);
    translate(-width / 2, -height / 2);
  }

  matterBodies.forEach(drawBody);
}

function drawBody(body) {
  const vertices = body.vertices;
  beginShape();
  for (let i = 0; i < vertices.length; i++) {
    vertex(vertices[i].x, vertices[i].y);
  }
  endShape(CLOSE);
}
