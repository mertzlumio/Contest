const express = require("express");
const { createServer } = require("node:http");
const { join } = require("node:path");
const { Server } = require("socket.io");
const Matter = require("./matter");

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static(join(__dirname, "public")));
app.get("/", (req, res) => {
  res.sendFile(join(__dirname, "public", "index.html"));
});

const engine = Matter.Engine.create();

const batOptions = {
  restitution: 0.3,
  friction: 0.5,
  frictionAir: 0.1,
};

function createBat(x, y) {
  return Matter.Bodies.rectangle(x, y, 80, 10, batOptions);
}

const bat1 = createBat(450, 50);
const bat2 = createBat(550, 650);

const ballOptions = {
  restitution: 1,
  friction: 0,
  frictionAir: 0,
};

const ball = Matter.Bodies.circle(450, 350, 10, ballOptions);
Matter.Body.setVelocity(ball, {
  x: Math.random() * 10 - 5,
  y: Math.random() * 4 - 2,
});

const vertices = [
  { x: 100, y: 100 },
  { x: 150, y: 100 },
  { x: 200, y: 200 },
  { x: 100, y: 200 },
];

const vertices2 = [
  { x: 100, y: 100 },
  { x: 75, y: 125 },
  { x: 50, y: 150 },
  { x: 50, y: 175 },
  { x: 75, y: 200 },
  { x: 100, y: 225 },
  { x: 80, y: 200 },
  { x: 60, y: 175 },
  { x: 60, y: 150 },
  { x: 80, y: 125 },
  { x: 100, y: 100 },
];

const polygon = Matter.Bodies.fromVertices(200, 350, vertices2, {
  isStatic: true,
  flipX: true,
});

const polygon2 = Matter.Bodies.fromVertices(700, 350, vertices2, {
  isStatic: true,
});

const polygon3 = Matter.Bodies.circle(200, 550, 30);

const wallOptions = {
  isStatic: true,
  restitution: 1,
};

const wall1 = Matter.Bodies.rectangle(-100, 350, 200, 700, wallOptions);
const wall2 = Matter.Bodies.rectangle(1000, 350, 200, 700, wallOptions);

engine.gravity.y = 0;

Matter.World.add(engine.world, [
  bat1,
  bat2,
  ball,
  wall1,
  wall2,
  polygon,
  polygon2,
  polygon3,
]);

Matter.Runner.run(engine);

let playerCount = 0;

io.on("connection", (socket) => {
  playerCount += 1;
  console.log("Player " + playerCount + " connected");
  socket.emit("player id", playerCount);

  socket.on("mouseInput", (data) => {
    let velocityX;
    let velocityY;
    if (data.Id % 2 == 0) {
      velocityX = (900 - data.x - bat1.position.x) * 0.1;
      velocityY = (700 - data.y - bat1.position.y) * 0.1;
      Matter.Body.setVelocity(bat1, { x: velocityX, y: velocityY });
    } else {
      velocityX = (data.x - bat2.position.x) * 0.1;
      velocityY = (data.y - bat2.position.y) * 0.1;
      Matter.Body.setVelocity(bat2, { x: velocityX, y: velocityY });
    }
  });
  let player1Score = 0;
  let player2Score = 0;
  function reset() {
    Matter.Body.setPosition(bat1, { x: 450, y: 50 });
    Matter.Body.setAngle(bat1, 0);
    Matter.Body.setPosition(bat2, { x: 450, y: 650 });
    Matter.Body.setAngle(bat2, 0);
    Matter.Body.setPosition(ball, { x: 450, y: 350 });
    Matter.Body.setVelocity(ball, {
      x: Math.random() * 10 - 5,
      y: Math.random() * 4 - 2,
    });
    io.emit("playerScore", player1Score, player2Score);
  }

  setInterval(() => {
    Matter.Engine.update(engine);
    if (ball.position.y > 700 || bat2.position.y < 350) {
      player1Score = player1Score + 1;
      reset();
    }
    if (ball.position.y < 0 || bat1.position.y > 350) {
      player2Score = player2Score + 1;
      reset();
    }
    const bodies = [
      bat1,
      bat2,
      ball,
      wall1,
      wall2,
      polygon,
      polygon2,
      polygon3,
    ].map((body) => ({
      vertices: body.vertices.map((vertex) => ({ x: vertex.x, y: vertex.y })),
    }));
    socket.emit("matterState", bodies);
  }, 16);

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});
server.listen(3000, () => {
  console.log("Listening on port 3000");
});
