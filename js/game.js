const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
let tileCount;
let snake, food, dx, dy, gameLoop, isPaused, score, isGameOver;
let isNightMode = false;

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
    document.getElementById('restartBtn').style.backgroundColor = ''; // Reset button color
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
    } else {
        snake.pop();
    }
}

function drawSnake() {
    ctx.fillStyle = isNightMode ? '#00ff00' : '#008000';
    snake.forEach(segment => {
        ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 2, gridSize - 2);
    });
}

function drawFood() {
    ctx.fillStyle = isNightMode ? '#ff6b6b' : 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
}

function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
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
    document.getElementById('restartBtn').style.backgroundColor = '#ff0000';
}

function drawGameOver() {
    ctx.fillStyle = isNightMode ? '#f0f0f0' : '#333';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 30);
    ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 10);

    // Draw a red restart button
    ctx.fillStyle = '#ff0000';  // Change this to red
    ctx.fillRect(canvas.width / 2 - 50, canvas.height / 2 + 30, 100, 40);
    ctx.fillStyle = '#ffffff';  // White text
    ctx.font = '20px Arial';
    ctx.fillText('Restart', canvas.width / 2, canvas.height / 2 + 55);
}

function updateScore() {
    document.getElementById('scoreValue').textContent = score;
}

function changeDirection(event) {
    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === 37 && !goingRight) { dx = -1; dy = 0; }
    if (keyPressed === 38 && !goingDown) { dx = 0; dy = -1; }
    if (keyPressed === 39 && !goingLeft) { dx = 1; dy = 0; }
    if (keyPressed === 40 && !goingUp) { dx = 0; dy = 1; }
}

function handleMobileControl(direction) {
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (direction === 'left' && !goingRight) { dx = -1; dy = 0; }
    if (direction === 'up' && !goingDown) { dx = 0; dy = -1; }
    if (direction === 'right' && !goingLeft) { dx = 1; dy = 0; }
    if (direction === 'down' && !goingUp) { dx = 0; dy = 1; }
}

function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? 'Resume' : 'Pause';
}

function toggleNightMode() {
    isNightMode = !isNightMode;
    document.body.classList.toggle('night-mode');
    document.getElementById('nightModeBtn').textContent = isNightMode ? 'Day Mode' : 'Night Mode';
}

document.addEventListener('keydown', changeDirection);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('restartBtn').addEventListener('click', resetGame);
document.getElementById('nightModeBtn').addEventListener('click', toggleNightMode);

document.getElementById('upBtn').addEventListener('click', () => handleMobileControl('up'));
document.getElementById('downBtn').addEventListener('click', () => handleMobileControl('down'));
document.getElementById('leftBtn').addEventListener('click', () => handleMobileControl('left'));
document.getElementById('rightBtn').addEventListener('click', () => handleMobileControl('right'));

canvas.addEventListener('click', function(event) {
    if (isGameOver) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if click is within the restart button area
        if (x > canvas.width / 2 - 50 && x < canvas.width / 2 + 50 &&
            y > canvas.height / 2 + 30 && y < canvas.height / 2 + 70) {
            resetGame();
        }
    }
});

initGame();
