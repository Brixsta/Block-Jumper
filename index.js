const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const FLOOR_THICKNESS = 3;
const JUMP_HEIGHT = 180;
const DIST_FROM_BOTTOM = canvas.height - 100 - FLOOR_THICKNESS;
const jump = new Audio("jump.wav");
const glass = new Audio("glass.wav");
let oldTimeStamp = 0;
let deltaTime = 0;
let obstacleInterval = 1000;

const drawCanvas = () => {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const game = {
  obstacles: [],
  score: 0,
  inPlay: true,
};

const drawFloor = () => {
  ctx.strokeStyle = "white";
  ctx.lineWidth = FLOOR_THICKNESS;
  ctx.beginPath();
  ctx.moveTo(0, DIST_FROM_BOTTOM);
  ctx.lineTo(canvas.width, DIST_FROM_BOTTOM);
  ctx.stroke();
};

const createObstacle = () => {
  const obstacle = new Obstacle(canvas.width, DIST_FROM_BOTTOM);
  game.obstacles.push(obstacle);
};

const drawAndAnimateObstacles = () => {
  game.obstacles.forEach((item) => {
    item.draw();
    item.animate();
    item.isCollide();

    // check if an obstacle is offscreen
    if (item.x < -item.width * 2) {
      let initial = game.obstacles.length;
      let target = game.obstacles.length - 1;

      if (initial !== target) {
        game.obstacles.shift();
      }
    }
  });
};

const gameOver = () => {
  glass.play();
  const gameOverContainer = document.querySelector(".game-over-container");
  gameOverContainer.classList.toggle("hidden");
  const scoreTitle = document.querySelector(".score-title");
  scoreTitle.innerHTML = `Score: ${game.score}`;
  const replayButton = document.querySelector(".replay-button");
  replayButton.addEventListener("click", restartGame);
  obstacleInterval = 0;
  game.obstacles.forEach((item) => {
    item.moveSpeed = 0;
  });
};

const restartGame = () => {
  const gameOverContainer = document.querySelector(".game-over-container");
  gameOverContainer.classList.toggle("hidden");
  game.inPlay = true;
  game.score = 0;
  const scoreTitle = document.querySelector(".score-title");
  scoreTitle.innerHTML = `Score: ${game.score}`;
  game.obstacles = [];
  obstacleInterval = 1000;
  player.y = DIST_FROM_BOTTOM - player.height;
  player.isJumping = false;
  player.isInAir = false;
  window.requestAnimationFrame(updateAll);
};

const updateAll = (timeStamp) => {
  if (game.inPlay) {
    let deltaTime = timeStamp - oldTimeStamp;
    obstacleInterval += deltaTime;

    // interval to spawn new obstacles
    if (obstacleInterval > 2000) {
      createObstacle();
      obstacleInterval = 0;
    }

    drawCanvas();
    drawFloor();
    player.draw();
    player.move();
    drawAndAnimateObstacles();

    scoreBoard.draw();
    window.requestAnimationFrame(updateAll);
    oldTimeStamp = timeStamp;

    // increment score continously
    game.score++;
  }
};

class Player {
  constructor(x) {
    this.width = 50;
    this.height = 50;
    this.y = DIST_FROM_BOTTOM - this.height;
    this.x = x;
    this.color = "white";
    this.isJumping = false;
    this.isInAir = false;
    this.isFalling = false;
    this.fallSpeed = 1.75;
    this.jumpSpeed = 1;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  #jump() {
    this.jumpSpeed += 0.5;
    this.y -= this.jumpSpeed;
  }

  #fall() {
    this.fallSpeed += 0.5;
    this.y += this.fallSpeed;
  }

  move() {
    window.addEventListener("keypress", (e) => {
      if (
        e.keyCode === 32 &&
        player.isJumping === false &&
        this.isInAir === false
      ) {
        jump.play();
        this.isInAir = true;
        this.jumpSpeed = 1;
        this.isJumping = true;
      } else {
        return;
      }
    });
    // make sure player always lands exactly on the ground
    if (player.y > DIST_FROM_BOTTOM - this.height) {
      player.y = DIST_FROM_BOTTOM - this.height;
    }

    // determine if is falling
    if (this.y < JUMP_HEIGHT) {
      this.isFalling = true;
      this.isJumping = false;
      this.fallSpeed = 1.75;
    }

    // determine if ready for jump
    if (this.y >= DIST_FROM_BOTTOM - this.height && this.isFalling) {
      this.jumpSpeed = 1;
      this.isFalling = false;
      this.isInAir = false;
    }

    // execute jump function
    if (this.y > JUMP_HEIGHT && this.isJumping) {
      this.#jump();
    }
    // execute falling function
    if (this.isFalling && player.y < DIST_FROM_BOTTOM - this.height) {
      this.#fall();
    }
  }
}

class Obstacle {
  constructor(x, y) {
    //Math.random() * (max - min) + min;
    this.height = Math.random() * (150 - 100) + 100;
    this.width = Math.random() * (30 - 10) + 10;
    this.moveSpeed = 4;
    this.x = x;
    this.y = y - this.height;
    this.color = "whte";
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  animate() {
    this.x -= this.moveSpeed;

    if (game.score > 500) {
      this.moveSpeed = 5;
    }
    if (game.score > 1000) {
      this.moveSpeed = 7;
    }
    if (game.score > 1500) {
      this.moveSpeed = 11;
    }
    if (game.score > 2000) {
      this.moveSpeed = 13;
    }
    if (game.score > 2500) {
      this.moveSpeed = 15;
    }
    if (game.score > 3000) {
      this.moveSpeed = 20;
    }
  }

  isCollide() {
    if (
      player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y
    ) {
      if (game.inPlay) {
        game.inPlay = false;
        gameOver();
      }
    }
  }
}

class ScoreBoard {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  draw() {
    ctx.fillyStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(`Score: ${game.score}`, this.x, this.y);
  }
}

window.onload = () => {
  window.requestAnimationFrame(updateAll);
};

const player = new Player(100);
const scoreBoard = new ScoreBoard(20, 40);
