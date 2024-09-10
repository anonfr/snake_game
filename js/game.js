const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
let tileCount;
let snake, food, dx, dy, gameLoop, isPaused, score, isGameOver;
let isNightMode = false;

// Add these at the top of your file
const eatSound = new Audio('sounds/eat.mp3');
const gameOverSound = new Audio('sounds/game_over.mp3');

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
    ctx.fillStyle = isNightMode ? '#000000' : '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        generateFood();
        score++;
        updateScore();
        playSound(eatSound);  // Play eat sound
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
    ctx.fillStyle = isNightMode ? '#ff6b6b' : '#ff0000';
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
    playSound(gameOverSound);  // Play game over sound
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

// Add these functions to handle both click and touch events
function handleCanvasClick(event) {
    if (isGameOver) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        let x, y;

        if (event.type === 'touchstart') {
            x = (event.touches[0].clientX - rect.left) * scaleX;
            y = (event.touches[0].clientY - rect.top) * scaleY;
        } else {
            x = (event.clientX - rect.left) * scaleX;
            y = (event.clientY - rect.top) * scaleY;
        }
        
        // Check if click/touch is within the restart button area
        if (x > canvas.width / 2 - 50 && x < canvas.width / 2 + 50 &&
            y > canvas.height / 2 + 30 && y < canvas.height / 2 + 70) {
            resetGame();
        }
    }
}

// Add event listeners for both click and touch events
canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('touchstart', handleCanvasClick);

// Prevent default touch behavior to avoid scrolling
canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
}, { passive: false });

// Modify the resetGame function
function resetGame() {
    snake = [{ x: 10, y: 10 }];
    generateFood();
    dx = 0;
    dy = 0;
    isPaused = false;
    isGameOver = false;
    score = 0;
    updateScore();
}

// Make sure initGame is called at the end of the file
initGame();

// Add a function to play sounds
function playSound(sound) {
    if (sound.readyState === 4) { // HAVE_ENOUGH_DATA - safe to play audio
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.log("Playback prevented:", error);
        });
    }
}

// Add this function to initialize audio context on user interaction
function initAudio() {
    // Create an audio context
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const audioCtx = new AudioContext();
    
    // Resume the audio context if it's suspended (this helps on some mobile browsers)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Add event listeners to initialize audio on user interaction
document.addEventListener('click', initAudio, { once: true });
document.addEventListener('touchstart', initAudio, { once: true });

// Add this function to preload sounds
function preloadSounds() {
    eatSound.load();
    gameOverSound.load();
}

// Call preloadSounds at the end of the file
preloadSounds();
