import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();

scene.fog = new THREE.Fog(0x000000, 10, 120);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({
  antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

document.body.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);

scene.add(ambientLight);

const pointLight = new THREE.PointLight(0x00ff00, 3, 100);

pointLight.position.set(0, 10, 10);

scene.add(pointLight);

const ballGeometry = new THREE.SphereGeometry(1, 32, 32);

const ballMaterial = new THREE.MeshStandardMaterial({
  color: 0x00ff00,
  emissive: 0x00ff00,
  emissiveIntensity: 1
});

const ball = new THREE.Mesh(ballGeometry, ballMaterial);

ball.position.y = 1;

scene.add(ball);

camera.position.set(0, 6, 12);

camera.lookAt(ball.position);

const roadSegments = [];

let currentCurve = 0;

function createRoad(z, xOffset) {
  const geometry = new THREE.BoxGeometry(8, 1, 10);

  const material = new THREE.MeshStandardMaterial({
    color: 0x111111,
    emissive: 0x00ff00,
    emissiveIntensity: 0.4,
    wireframe: true
  });

  const road = new THREE.Mesh(geometry, material);

  road.position.z = z;

  road.position.x = xOffset;

  scene.add(road);

  roadSegments.push(road);
}

for (let i = 0; i < 25; i++) {
  currentCurve += (Math.random() - 0.5) * 1.5;

  if (currentCurve > 6) currentCurve = 6;

  if (currentCurve < -6) currentCurve = -6;

  createRoad(-i * 10, currentCurve);
}

function updateRoads() {
  roadSegments.forEach((road) => {
    road.position.z += speed;

    if (road.position.z > 10) {
      road.position.z -= 250;

      const lastRoad =
        roadSegments.reduce((a, b) =>
          a.position.z < b.position.z ? a : b
        );

      let newCurve =
        lastRoad.position.x + (Math.random() - 0.5) * 2;

      if (newCurve > 6) newCurve = 6;

      if (newCurve < -6) newCurve = -6;

      road.position.x = newCurve;
    }
  });
}

const obstacles = [];

function createObstacle(z) {
  const geometry = new THREE.BoxGeometry(2, 2, 2);

  const material = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    emissive: 0xff0000,
    emissiveIntensity: 1
  });

  const obstacle = new THREE.Mesh(geometry, material);

  obstacle.position.x = (Math.random() - 0.5) * 6;

  obstacle.position.y = 1;

  obstacle.position.z = z;

  scene.add(obstacle);

  obstacles.push(obstacle);
}

for (let i = 0; i < 30; i++) {
  createObstacle(-50 - i * 20);
}

const keys = {
  left: false,
  right: false
};

window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    keys.left = true;
  }

  if (e.key === 'ArrowRight') {
    keys.right = true;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') {
    keys.left = false;
  }

  if (e.key === 'ArrowRight') {
    keys.right = false;
  }
});

let speed = 0.6;

let score = 0;

let gameOver = false;

let falling = false;

let velocityX = 0;

let gravity = 0;

let tilt = 0;

let fallDirection = 0;

function updateBall() {
  const acceleration = 0.015;

  const friction = 0.92;

  const maxSpeed = 0.35;

  if (!falling) {
    if (keys.left) {
      velocityX -= acceleration;
      tilt = 0.2;
    }

    if (keys.right) {
      velocityX += acceleration;
      tilt = -0.2;
    }

    velocityX *= friction;

    if (velocityX > maxSpeed) velocityX = maxSpeed;

    if (velocityX < -maxSpeed) velocityX = -maxSpeed;

    ball.position.x += velocityX;

    ball.rotation.z = tilt;

    tilt *= 0.9;

    const currentRoad = roadSegments.reduce((closest, road) => {
      return Math.abs(road.position.z) < Math.abs(closest.position.z)
        ? road
        : closest;
    });

    const leftEdge = currentRoad.position.x - 4;

    const rightEdge = currentRoad.position.x + 4;

    if (ball.position.x < leftEdge) {
      falling = true;
      fallDirection = -1;
    }

    if (ball.position.x > rightEdge) {
      falling = true;
      fallDirection = 1;
    }
  }
}

function updateObstacles() {
  obstacles.forEach((obs) => {
    obs.position.z += speed;

    if (obs.position.z > 10) {
      obs.position.z = -400;

      obs.position.x = (Math.random() - 0.5) * 6;
    }

    const dx = ball.position.x - obs.position.x;

    const dz = ball.position.z - obs.position.z;

    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 1.8 && !falling) {
      gameOver = true;
    }
  });
}

async function saveScore() {
  let username = prompt('Enter your name');

  await fetch('http://localhost/slope-game-3d/api/save_score.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username,
      score
    })
  });
}

function fallingAnimation() {
  gravity += 0.02;

  ball.position.y -= gravity;

  ball.position.x += 0.12 * fallDirection;

  ball.rotation.x += 0.2;

  ball.rotation.y += 0.15;

  ball.rotation.z += 0.25 * fallDirection;

  camera.position.y -= 0.08;

  camera.position.x += 0.03 * fallDirection;

  camera.rotation.z += 0.002 * fallDirection;

  pointLight.intensity += 0.02;

  if (ball.position.y < -35) {
    gameOver = true;

    saveScore();

    setTimeout(() => {
      alert('Game Over | Score: ' + score);

      location.reload();
    }, 500);
  }
}

function animate() {
  requestAnimationFrame(animate);

  if (!gameOver) {
    updateBall();

    updateRoads();

    updateObstacles();

    speed += 0.00005;

    score++;

    const scoreElement = document.getElementById('score');

    if (scoreElement) {
      scoreElement.innerText = 'Score: ' + score;
    }
  }

  if (falling) {
    fallingAnimation();
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});