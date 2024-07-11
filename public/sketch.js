let matterBodies = [];
let playerId;
let p1Score;
let p2Score;

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

  socket.on("playerScore", (player1Score, player2Score) => {
    console.log(player1Score);
    p1Score = player1Score;
    p2Score = player2Score;
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

  document.getElementById("player1").textContent = `Player 1: ${p2Score}`;
  document.getElementById("player2").textContent = `Player 2: ${p1Score}`;
}

function drawBody(body) {
  const vertices = body.vertices;
  beginShape();
  for (let i = 0; i < vertices.length; i++) {
    vertex(vertices[i].x, vertices[i].y);
  }
  endShape(CLOSE);
}
