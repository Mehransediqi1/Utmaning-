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

let keys = { left: false, right: false };

let velocity = 0;
let speedMultiplier = 1;

let score = 0;
let gameOver = false;
let gameStarted = false;
let saved = false;

let leaderboard = [];

let obstacles = [];

let roads = [];
for (let i = 0; i < 10; i++) {
  roads.push({
    x: 0,
    y: i * -100,
    width: canvas.width,
    height: 100
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") keys.left = true;
  if (e.key === "ArrowRight") keys.right = true;

  if (e.code === "Space") gameStarted = true;

  if (e.key === "r" && gameOver) resetGame();
});

document.addEventListener("keyup", (e) => {
  if (e.key === "ArrowLeft") keys.left = false;
  if (e.key === "ArrowRight") keys.right = false;
});

function update() {
  const accel = 0.5;

  if (keys.left) velocity -= accel;
  if (keys.right) velocity += accel;

  velocity *= 0.9;

  ball.x += velocity;

  if (ball.x - ball.radius < 0) ball.x = ball.radius;
  if (ball.x + ball.radius > canvas.width) ball.x = canvas.width - ball.radius;
}

function updateRoad() {
  roads.forEach((road) => {
    road.y += 4 * speedMultiplier;
    if (road.y > canvas.height) road.y = -100;
  });
}

function drawRoad() {
  roads.forEach((road) => {
    ctx.fillStyle = "#222";
    ctx.fillRect(road.x, road.y, road.width, road.height);
  });
}

function createObstacle() {
  let size = 40;

  obstacles.push({
    x: Math.random() * (canvas.width - size),
    y: -size,
    width: size,
    height: size
  });
}

setInterval(createObstacle, 1000);

function updateObstacles() {
  obstacles.forEach((obs) => {
    obs.y += 6 * speedMultiplier;
  });

  obstacles = obstacles.filter(obs => obs.y < canvas.height);
}

function drawObstacles() {
  ctx.fillStyle = "red";

  obstacles.forEach((obs) => {
    ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
  });
}

async function loadLeaderboard() {
  let res = await fetch("http://localhost/slope-game/api/get_scores.php");
  leaderboard = await res.json();
}

async function saveScore() {
  let username = prompt("Enter your name:");

  await fetch("http://localhost/slope-game/api/save_score.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      username: username,
      score: score
    })
  });

  loadLeaderboard();
}

function drawScore() {
  ctx.fillStyle = "white";
  ctx.font = "30px Arial";
  ctx.fillText("Score: " + score, 20, 40);
}

function drawLeaderboard() {
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";

  ctx.fillText("Top Players:", canvas.width - 220, 40);

  leaderboard.slice(0, 5).forEach((p, i) => {
    ctx.fillText(
      `${i + 1}. ${p.username}: ${p.score}`,
      canvas.width - 220,
      70 + i * 25
    );
  });
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
      document.body.style.background = "darkred";
    }
  }
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = ball.color;

  ctx.shadowColor = "lime";
  ctx.shadowBlur = 20;

  ctx.fill();
  ctx.closePath();

  ctx.shadowBlur = 0;
}

function resetGame() {
  ball.x = canvas.width / 2;
  velocity = 0;
  score = 0;
  obstacles = [];
  gameOver = false;
  saved = false;
  speedMultiplier = 1;
  document.body.style.background = "black";
}

function gameLoop() {
  if (!gameStarted) {
    ctx.fillStyle = "white";
    ctx.font = "40px Arial";
    ctx.fillText("Press SPACE to Start", canvas.width / 2 - 200, canvas.height / 2);
    return;
  }

  if (gameOver) {
    if (!saved) {
      saveScore();
      saved = true;
    }

    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.fillText("Game Over", canvas.width / 2 - 150, canvas.height / 2);
    ctx.fillText("Score: " + score, canvas.width / 2 - 120, canvas.height / 2 + 60);
    ctx.fillText("Press R to Restart", canvas.width / 2 - 180, canvas.height / 2 + 120);

    drawLeaderboard();
    return;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  update();
  updateRoad();
  updateObstacles();
  checkCollision();

  speedMultiplier += 0.0005;
  score++;

  drawRoad();
  drawBall();
  drawObstacles();
  drawScore();
  drawLeaderboard();

  requestAnimationFrame(gameLoop);
}

loadLeaderboard();
gameLoop();