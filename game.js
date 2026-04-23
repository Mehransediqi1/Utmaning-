const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 20,
  color: "lime"
};

let keys = {
  left: false,
  right: false
};

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
});

function update() {
  const speed = 6;

  if (keys.left) ball.x -= speed;
  if (keys.right) ball.x += speed;

  if (ball.x - ball.radius < 0) ball.x = ball.radius;
  if (ball.x + ball.radius > canvas.width) ball.x = canvas.width - ball.radius;
}

let roads = [];

for (let i = 0; i < 10; i++) {
  roads.push({
    x: 0,
    y: i * -100,
    width: canvas.width,
    height: 100
  });
}

function updateRoad() {
  roads.forEach((road) => {
    road.y += 4;
    if (road.y > canvas.height) road.y = -100;
  });
}

function drawRoad() {
  roads.forEach((road) => {
    ctx.fillStyle = "#222";
    ctx.fillRect(road.x, road.y, road.width, road.height);
  });
}

let obstacles = [];

function createObstacle() {
  let size = 40;

  obstacles.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size
  });
}

setInterval(createObstacle, 1200);

function updateObstacles() {
  obstacles.forEach((obs) => {
    obs.y += 6;
  });

  obstacles = obstacles.filter(obs => obs.y < canvas.height);
}

function drawObstacles() {
  ctx.fillStyle = "red";

  obstacles.forEach((obs) => {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  });
}

let score = 0;
let gameOver = false;

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Score: " + score, 20, 40);
}

function checkCollision() {
  for (let obs of obstacles) {
    let distX = Math.abs(ball.x - (obs.x + obs.width / 2));
    let distY = Math.abs(ball.y - (obs.y + obs.height / 2));

    if (
      distX < ball.radius + obs.width / 2 &&
      distY < ball.radius + obs.height / 2
    ) {
      gameOver = true;
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;
  ctx.fill();
  ctx.closePath();
}

function gameLoop() {
  if (gameOver) {
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 150, canvas.height / 2);
    ctx.fillText("Score: " + score, canvas.width / 2 - 120, canvas.height / 2 + 60);
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  updateRoad();
  updateObstacles();
  checkCollision();

  score++;

  drawRoad();
  drawBall();
  drawObstacles();
  drawScore();

  requestAnimationFrame(gameLoop);
}

gameLoop();