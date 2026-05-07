import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 10, 120);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
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

function createRoad(z) {
  const geometry = new THREE.BoxGeometry(12, 1, 10);

  const material = new THREE.MeshStandardMaterial({
    color: 0x111111,
    emissive: 0x00ff00,
    emissiveIntensity: 0.3,
    wireframe: true
  });

  const road = new THREE.Mesh(geometry, material);

  road.position.z = z;

  scene.add(road);

  roadSegments.push(road);
}

for (let i = 0; i < 20; i++) {
  createRoad(-i * 10);
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

  obstacle.position.x = (Math.random() - 0.5) * 8;
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
  if (e.key === 'ArrowLeft') keys.left = true;
  if (e.key === 'ArrowRight') keys.right = true;
});

window.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') keys.left = false;
  if (e.key === 'ArrowRight') keys.right = false;
});

let speed = 0.6;
let score = 0;
let gameOver = false;

function updateBall() {
  if (keys.left) {
    ball.position.x -= 0.25;
  }

  if (keys.right) {
    ball.position.x += 0.25;
  }

  if (ball.position.x < -5) {
    ball.position.x = -5;
  }

  if (ball.position.x > 5) {
    ball.position.x = 5;
  }
}

function updateRoads() {
  roadSegments.forEach((road) => {
    road.position.z += speed;

    if (road.position.z > 10) {
      road.position.z -= 200;
    }
  });
}

function updateObstacles() {
  obstacles.forEach((obs) => {
    obs.position.z += speed;

    if (obs.position.z > 10) {
      obs.position.z = -400;
      obs.position.x = (Math.random() - 0.5) * 8;
    }

    const dx = ball.position.x - obs.position.x;
    const dz = ball.position.z - obs.position.z;

    const distance = Math.sqrt(dx * dx + dz * dz);

    if (distance < 1.8) {
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

function animate() {
  if (gameOver) {
    saveScore();
    alert('Game Over | Score: ' + score);
    location.reload();
    return;
  }

  requestAnimationFrame(animate);

  updateBall();
  updateRoads();
  updateObstacles();

  speed += 0.00005;

  score++;

  const scoreElement = document.getElementById('score');

  if (scoreElement) {
    scoreElement.innerText = 'Score: ' + score;
  }

  renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;

  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
});