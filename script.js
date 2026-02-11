// Teachable Machine
const URL = "./model/";
let model, webcam, labelContainer, maxPredictions;
let isModelLoaded = false;

// Game State Definitions
const STATE_LOADING = "LOADING";
const STATE_TUTORIAL_START = "TUTORIAL_START";
const STATE_TUTORIAL_JUMP = "TUTORIAL_JUMP";
const STATE_TUTORIAL_READY = "TUTORIAL_READY";
const STATE_PLAYING = "PLAYING";
const STATE_GAME_OVER = "GAME_OVER";

let gameState = STATE_LOADING;
let canvas, ctx;
let score = 0;
let gameSpeed = 3; // Reduced initial speed
let gravity = 0.6;

// Dino
let dino = {
    x: 50,
    y: 0,
    width: 40,
    height: 60,
    dy: 0,
    jumpForce: 20, // Increased jump force
    grounded: false,
    color: '#555'
};

// Obstacles
let obstacles = [];
let obstacleTimer = 0;
let initialObstacleTimer = 240; // Increased initial timer

// Inputs
let currentAction = "clean"; // "clean", "pular", "iniciar"

window.onload = init;

async function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');

    // Set dino ground level
    dino.y = canvas.height - dino.height - 10;

    document.getElementById('status').innerText = "Carregando modelo...";

    // Initialize Teachable Machine
    await initTeachableMachine();

    // Transition to Tutorial Start
    gameState = STATE_TUTORIAL_START;
    document.getElementById('status').innerText = "Modo Tutorial: Siga as instruções na tela.";

    // Start Game Loop
    requestAnimationFrame(gameLoop);
}

async function initTeachableMachine() {
    const modelURL = URL + "model.json";
    const metadataURL = URL + "metadata.json";

    // Load the model and metadata
    model = await tmImage.load(modelURL, metadataURL);
    maxPredictions = model.getTotalClasses();

    // Convenience function to setup a webcam
    const flip = true;
    webcam = new tmImage.Webcam(200, 200, flip);
    await webcam.setup();
    await webcam.play();
    window.requestAnimationFrame(loopWebcam);

    // Append elements to the DOM
    document.getElementById("webcam-container").appendChild(webcam.canvas);
    labelContainer = document.getElementById("label-container");
    for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }
    isModelLoaded = true;
}

async function loopWebcam() {
    webcam.update();
    await predict();
    window.requestAnimationFrame(loopWebcam);
}

async function predict() {
    if (gameState === STATE_LOADING) return;

    const prediction = await model.predict(webcam.canvas);

    let highestProbability = 0;
    let bestLabel = "";

    for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
            prediction[i].className + ": " + prediction[i].probability.toFixed(2);

        // Hide "clean" label
        if (prediction[i].className === "clean") {
            labelContainer.childNodes[i].style.display = "none";
        } else {
            labelContainer.childNodes[i].style.display = "block";
            labelContainer.childNodes[i].innerHTML = classPrediction;
        }

        if (prediction[i].probability > highestProbability) {
            highestProbability = prediction[i].probability;
            bestLabel = prediction[i].className;
        }
    }

    // Threshold for action
    if (highestProbability > 0.8) {
        currentAction = bestLabel;
        handleInput(currentAction);
    }
}

function handleInput(action) {
    switch (gameState) {
        case STATE_TUTORIAL_START:
            if (action === "iniciar") {
                gameState = STATE_TUTORIAL_JUMP;
                document.getElementById('status').innerText = "Tutorial: Hora de pular!";
                // Add a small delay/debounce could be useful here to prevent accidental double triggering, 
                // but relying on state change separation for now.
            }
            break;

        case STATE_TUTORIAL_JUMP:
            if (action === "pular") {
                jump();
                // We wait for the jump to actually happen (dino to leave ground) 
                // but for simplicity, if input received, we know they tried.
                // Let's transition only after a successful jump mechanism in updateGame or here.
                // For direct feedback, let's transition after a short delay or check in update.
                // To keep it simple: Transition to READY state immediately after ensuring jump command sent
                setTimeout(() => {
                    gameState = STATE_TUTORIAL_READY;
                    document.getElementById('status').innerText = "Tutorial completo! Vamos jogar.";
                }, 1000); // Wait 1s so they see the jump
            }
            break;

        case STATE_TUTORIAL_READY:
            if (action === "iniciar") {
                startGame();
            }
            break;

        case STATE_PLAYING:
            if (action === "pular") {
                jump();
            }
            break;

        case STATE_GAME_OVER:
            if (action === "iniciar") {
                startGame();
            }
            break;
    }
}

function startGame() {
    gameState = STATE_PLAYING;
    score = 0;
    obstacles = [];
    gameSpeed = 3;
    obstacleTimer = 0;
    document.getElementById('status').innerText = "Jogo em andamento!";
}

function jump() {
    if (dino.grounded) {
        dino.dy = -dino.jumpForce;
        dino.grounded = false;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    updateGame();
    drawGame();

    requestAnimationFrame(gameLoop);
}

function updateGame() {
    // Dino Physics (Always active)
    dino.dy += gravity;
    dino.y += dino.dy;

    // Ground Collision
    if (dino.y > canvas.height - dino.height - 10) {
        dino.y = canvas.height - dino.height - 10;
        dino.dy = 0;
        dino.grounded = true;
    } else {
        dino.grounded = false;
    }

    // Game Logic based on State
    if (gameState === STATE_PLAYING) {
        // Spawn Obstacles
        obstacleTimer++;
        if (obstacleTimer > initialObstacleTimer) {
            let height = Math.random() * (50 - 20) + 20;
            obstacles.push({
                x: canvas.width,
                y: canvas.height - height - 10,
                width: 20,
                height: height,
                color: '#e74c3c'
            });
            obstacleTimer = 0;
            initialObstacleTimer = Math.max(30, initialObstacleTimer - 0.1);
        }

        // Update Obstacles
        for (let i = 0; i < obstacles.length; i++) {
            let obs = obstacles[i];
            obs.x -= gameSpeed;

            // Collision Detection
            if (
                dino.x < obs.x + obs.width &&
                dino.x + dino.width > obs.x &&
                dino.y < obs.y + obs.height &&
                dino.y + dino.height > obs.y
            ) {
                gameOver();
            }

            // Remove off-screen obstacles
            if (obs.x + obs.width < 0) {
                obstacles.splice(i, 1);
                score++;
                i--;
                gameSpeed += 0.05;
            }
        }
    }
}

function drawGame() {
    // Draw Ground
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 10);
    ctx.lineTo(canvas.width, canvas.height - 10);
    ctx.stroke();

    // Draw Dino
    ctx.fillStyle = dino.color;
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Draw Obstacles (Only in PLAYING or maybe GAME_OVER if we want to show what killed them)
    // We clear obstacles on restart, so they might persist in GAME_OVER
    for (let i = 0; i < obstacles.length; i++) {
        let obs = obstacles[i];
        ctx.fillStyle = obs.color;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
    }

    // Draw UI Text based on State
    ctx.fillStyle = "black";
    ctx.textAlign = "center";

    // Debug helper
    // ctx.fillText(gameState, 50, 20);

    if (gameState === STATE_PLAYING) {
        ctx.textAlign = "left";
        ctx.font = "20px Arial";
        ctx.fillText("Pontos: " + score, 10, 30);
    }
    else if (gameState === STATE_GAME_OVER) {
        ctx.font = "30px Arial";
        ctx.fillText("Game Over!", canvas.width / 2, 100);
        ctx.font = "20px Arial";
        ctx.fillText("Abra a mão para tentar de novo", canvas.width / 2, 140);
        ctx.fillText("Pontuação: " + score, canvas.width / 2, 180);
    }
    else if (gameState === STATE_TUTORIAL_START) {
        ctx.font = "24px Arial";
        ctx.fillText("TUTORIAL", canvas.width / 2, 80);
        ctx.font = "20px Arial";
        ctx.fillText("Abra a mão para iniciar", canvas.width / 2, 120);
    }
    else if (gameState === STATE_TUTORIAL_JUMP) {
        ctx.font = "24px Arial";
        ctx.fillText("TUTORIAL", canvas.width / 2, 80);
        ctx.font = "20px Arial";
        ctx.fillText("Aponte para CIMA para pular", canvas.width / 2, 120);
    }
    else if (gameState === STATE_TUTORIAL_READY) {
        ctx.font = "24px Arial";
        ctx.fillText("Tudo pronto!", canvas.width / 2, 80);
        ctx.font = "20px Arial";
        ctx.fillText("Abra a mão para começar o Jogo", canvas.width / 2, 120);
    }

    // Always show last action
    ctx.textAlign = "left";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#999";
    ctx.fillText("Ação: " + currentAction, 10, canvas.height - 20);
}

function gameOver() {
    gameState = STATE_GAME_OVER;
    document.getElementById('status').innerText = "Game Over! Faça o gesto 'iniciar' para tentar novamente.";
}
