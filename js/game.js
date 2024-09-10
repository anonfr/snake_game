const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
let tileCount;
let snake, food, dx, dy, gameLoop, isPaused, score, isGameOver;
let isNightMode = false;
let bigBall = null;
let bigBallTimer = null;
const bigBallDuration = 5000; // 5 seconds
const bigBallMaxPoints = 50;

// Add sound effects
const eatSound = new Audio('sounds/eat.mp3');
const gameOverSound = new Audio('sounds/game_over.mp3');
const nightModeSound = new Audio('sounds/night_mode.mp3');
const bigBallSound = new Audio('sounds/big_ball.mp3'); // Add a new sound for the big ball

function initGame() {
    canvas.width = 400;
    canvas.height = 400;
    tileCount = canvas.width / gridSize;
    resetGame();
    drawGame();
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    generateFood();
    dx = 0;
    dy = 0;
    isPaused = false;
    isGameOver = false;
    score = 0;
    updateScore();
    updatePauseButton();
    clearTimeout(bigBallTimer);
    bigBall = null;
    scheduleBigBall();
}

function drawGame() {
    clearCanvas();
    if (!isGameOver) {
        if (!isPaused) {
            moveSnake();
            checkCollision();
        }
        drawSnake();
        drawFood();
        if (bigBall) {
            drawBigBall();
        }
    } else {
        drawGameOver();
    }
    gameLoop = setTimeout(drawGame, 100);
}

function clearCanvas() {
    ctx.fillStyle = isNightMode ? '#222' : '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        generateFood();
        score++;
        updateScore();
        eatSound.play();
    } else if (bigBall && head.x === bigBall.x && head.y === bigBall.y) {
        const timeElapsed = Date.now() - bigBall.startTime;
        const pointsEarned = Math.max(1, Math.floor(bigBallMaxPoints * (1 - timeElapsed / bigBallDuration)));
        score += pointsEarned;
        updateScore();
        bigBallSound.play();
        bigBall = null;
        clearTimeout(bigBallTimer);
        scheduleBigBall();
    } else {
        snake.pop();
    }
}

function drawSnake() {
    snake.forEach((segment, index) => {
        const hue = (index * 15) % 360;
        ctx.fillStyle = `hsl(${hue}, 100%, ${isNightMode ? '70%' : '50%'})`;
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.fillStyle = isNightMode ? '#ff6b6b' : 'red';
    ctx.beginPath();
    ctx.arc((food.x + 0.5) * gridSize, (food.y + 0.5) * gridSize, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();
}

function drawBigBall() {
    const timeElapsed = Date.now() - bigBall.startTime;
    const opacity = 1 - timeElapsed / bigBallDuration;
    ctx.fillStyle = `rgba(255, 215, 0, ${opacity})`; // Golden color with fading opacity
    ctx.beginPath();
    ctx.arc((bigBall.x + 0.5) * gridSize, (bigBall.y + 0.5) * gridSize, gridSize - 2, 0, Math.PI * 2);
    ctx.fill();
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

function generateBigBall() {
    bigBall = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount),
        startTime: Date.now()
    };
    bigBallTimer = setTimeout(() => {
        bigBall = null;
        scheduleBigBall();
    }, bigBallDuration);
}

function scheduleBigBall() {
    const delay = Math.random() * 10000 + 5000; // Random delay between 5-15 seconds
    setTimeout(generateBigBall, delay);
}

function checkCollision() {
    if (snake[0].x < 0 || snake[0].x >= tileCount || snake[0].y < 0 || snake[0].y >= tileCount) {
        gameOver();
    }
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === snake[0].x && snake[i].y === snake[0].y) {
            gameOver();
        }
    }
}

function gameOver() {
    isGameOver = true;
    gameOverSound.play();
}

function drawGameOver() {
    ctx.fillStyle = isNightMode ? '#f0f0f0' : '#333';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(canvas.width / 2 - 50, canvas.height / 2 + 30, 100, 40);
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText('Restart', canvas.width / 2, canvas.height / 2 + 55);
}

function updateScore() {
    document.getElementById('scoreValue').textContent = score;
}

function changeDirection(event) {
    if (isGameOver) return;

    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;
    const SPACE_KEY = 32;
    const ENTER_KEY = 13;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }
    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }
    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }
    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
    if (keyPressed === SPACE_KEY || keyPressed === ENTER_KEY) {
        togglePause();
    }
}

function togglePause() {
    if (!isGameOver) {
        isPaused = !isPaused;
        updatePauseButton();
    }
}

function updatePauseButton() {
    document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
}

function restartGame() {
    resetGame();
}

function toggleNightMode() {
    isNightMode = !isNightMode;
    document.body.classList.toggle('night-mode');
    document.getElementById('nightModeBtn').textContent = isNightMode ? 'Day Mode' : 'Night Mode';
    
    // Update canvas border
    canvas.style.borderColor = isNightMode ? '#000' : '#8B4513';
    
    nightModeSound.play();
}

function handleCanvasClick(event) {
    if (isGameOver) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (x >= canvas.width / 2 - 50 && x <= canvas.width / 2 + 50 &&
            y >= canvas.height / 2 + 30 && y <= canvas.height / 2 + 70) {
            restartGame();
        }
    }
}

document.addEventListener('keydown', changeDirection);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('nightModeBtn').addEventListener('click', toggleNightMode);
canvas.addEventListener('click', handleCanvasClick);

initGame();
