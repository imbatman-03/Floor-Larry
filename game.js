// =============================================
// GAME CONSTANTS & VARIABLES
// =============================================
const Game = {
    // Canvas & Context
    canvas: null,
    ctx: null,
    
    // Game State
    state: 'menu', // menu, playing, paused, gameOver
    score: 0,
    level: 1,
    lives: 3,
    health: 100,
    maxHealth: 100,
    enemiesDefeated: 0,
    highScore: parseInt(localStorage.getItem('larryHighScore')) || 0,
    
    // Game Objects
    player: {
        x: 400,
        y: 500,
        width: 40,
        height: 40,
        speed: 5,
        color: '#00ff00'
    },
    bullets: [],
    enemies: [],
    powerups: [],
    explosions: [],
    
    // Game Settings
    keys: {},
    lastShot: 0,
    shotDelay: 200,
    enemySpawnRate: 1000,
    lastSpawn: 0,
    gameTime: 0,
    levelUpScore: 1000,
    
    // Weapons
    currentWeapon: {
        name: 'BASIC LASER',
        damage: 10,
        color: '#00ffff',
        width: 4,
        height: 12
    },
    
    // Power-ups
    activePowerups: [],
    
    // Audio
    soundEnabled: true,
    
    // Performance
    lastTime: 0,
    fps: 0,
    frameCount: 0
};

// =============================================
// DOM ELEMENTS
// =============================================
const elements = {
    // Canvas
    gameCanvas: document.getElementById('gameCanvas'),
    
    // Overlays
    startScreen: document.getElementById('startScreen'),
    pauseScreen: document.getElementById('pauseScreen'),
    gameOverScreen: document.getElementById('gameOverScreen'),
    
    // Buttons
    startButton: document.getElementById('startButton'),
    resumeButton: document.getElementById('resumeButton'),
    restartButton: document.getElementById('restartButton'),
    playAgainButton: document.getElementById('playAgainButton'),
    menuButton: document.getElementById('menuButton'),
    soundToggle: document.getElementById('soundToggle'),
    fullscreenToggle: document.getElementById('fullscreenToggle'),
    discordConnect: document.getElementById('discordConnect'),
    leaderboardBtn: document.getElementById('leaderboardBtn'),
    
    // Displays
    scoreDisplay: document.getElementById('scoreDisplay'),
    levelDisplay: document.getElementById('levelDisplay'),
    livesDisplay: document.getElementById('livesDisplay'),
    enemiesDisplay: document.getElementById('enemiesDisplay'),
    healthFill: document.getElementById('healthFill'),
    healthText: document.getElementById('healthText'),
    weaponName: document.getElementById('weaponName'),
    weaponDamage: document.getElementById('weaponDamage'),
    highScoreDisplay: document.getElementById('highScoreDisplay'),
    footerHighScore: document.getElementById('footerHighScore'),
    pauseScore: document.getElementById('pauseScore'),
    pauseLevel: document.getElementById('pauseLevel'),
    pauseLives: document.getElementById('pauseLives'),
    finalScore: document.getElementById('finalScore'),
    finalLevel: document.getElementById('finalLevel'),
    finalEnemies: document.getElementById('finalEnemies'),
    
    // Modals
    leaderboardModal: document.getElementById('leaderboardModal'),
    discordModal: document.getElementById('discordModal'),
    leaderboardList: document.getElementById('leaderboardList'),
    
    // Power-ups
    activePowerups: document.getElementById('activePowerups')
};

// =============================================
// INITIALIZATION
// =============================================
function init() {
    // Setup canvas
    Game.canvas = elements.gameCanvas;
    Game.ctx = Game.canvas.getContext('2d');
    
    // Set canvas size based on container
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Update high score display
    updateHighScoreDisplay();
    
    // Setup event listeners
    setupEventListeners();
    
    // Start game loop
    gameLoop();
    
    console.log('🎮 Larry Pixel Shooter Initialized!');
}

function resizeCanvas() {
    const container = Game.canvas.parentElement;
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    
    // Maintain 4:3 aspect ratio
    const aspectRatio = 4/3;
    let width = containerWidth;
    let height = width / aspectRatio;
    
    if (height > containerHeight) {
        height = containerHeight;
        width = height * aspectRatio;
    }
    
    Game.canvas.width = width;
    Game.canvas.height = height;
    
    // Re-center player
    Game.player.x = Game.canvas.width / 2 - Game.player.width / 2;
}

// =============================================
// EVENT LISTENERS
// =============================================
function setupEventListeners() {
    // Keyboard Controls
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Game Buttons
    elements.startButton.addEventListener('click', startGame);
    elements.resumeButton.addEventListener('click', resumeGame);
    elements.restartButton.addEventListener('click', restartGame);
    elements.playAgainButton.addEventListener('click', restartGame);
    elements.menuButton.addEventListener('click', showMenu);
    
    // Control Buttons
    elements.soundToggle.addEventListener('click', toggleSound);
    elements.fullscreenToggle.addEventListener('click', toggleFullscreen);
    elements.discordConnect.addEventListener('click', showDiscordModal);
    elements.leaderboardBtn.addEventListener('click', showLeaderboardModal);
    
    // Modal Close Buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').classList.remove('active');
        });
    });
    
    // Discord Connect Button
    document.getElementById('connectDiscord').addEventListener('click', connectDiscord);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.remove('active');
        }
    });
}

function handleKeyDown(e) {
    const key = e.key.toLowerCase();
    Game.keys[key] = true;
    
    // Prevent spacebar from scrolling
    if (key === ' ' || key === 'spacebar') {
        e.preventDefault();
    }
    
    // Game Controls
    switch(key) {
        case ' ':
            if (Game.state === 'playing') {
                shoot();
            }
            break;
        case 'p':
            togglePause();
            break;
        case 'escape':
            if (Game.state === 'playing') {
                pauseGame();
            } else if (Game.state === 'paused') {
                resumeGame();
            }
            break;
    }
}

function handleKeyUp(e) {
    const key = e.key.toLowerCase();
    Game.keys[key] = false;
}

// =============================================
// GAME STATE MANAGEMENT
// =============================================
function startGame() {
    Game.state = 'playing';
    Game.score = 0;
    Game.level = 1;
    Game.lives = 3;
    Game.health = 100;
    Game.enemiesDefeated = 0;
    Game.bullets = [];
    Game.enemies = [];
    Game.powerups = [];
    Game.explosions = [];
    Game.activePowerups = [];
    Game.gameTime = 0;
    
    // Reset player position
    Game.player.x = Game.canvas.width / 2 - Game.player.width / 2;
    Game.player.y = Game.canvas.height - 100;
    
    // Reset weapon
    Game.currentWeapon = {
        name: 'BASIC LASER',
        damage: 10,
        color: '#00ffff',
        width: 4,
        height: 12
    };
    
    updateUI();
    elements.startScreen.classList.remove('active');
    
    // Play start sound
    playSound('start');
}

function pauseGame() {
    if (Game.state === 'playing') {
        Game.state = 'paused';
        elements.pauseScore.textContent = Game.score;
        elements.pauseLevel.textContent = Game.level;
        elements.pauseLives.textContent = Game.lives;
        elements.pauseScreen.classList.add('active');
        playSound('pause');
    }
}

function resumeGame() {
    if (Game.state === 'paused') {
        Game.state = 'playing';
        elements.pauseScreen.classList.remove('active');
        playSound('resume');
    }
}

function togglePause() {
    if (Game.state === 'playing') {
        pauseGame();
    } else if (Game.state === 'paused') {
        resumeGame();
    }
}

function gameOver() {
    Game.state = 'gameOver';
    
    // Update high score
    if (Game.score > Game.highScore) {
        Game.highScore = Game.score;
        localStorage.setItem('larryHighScore', Game.highScore);
        updateHighScoreDisplay();
    }
    
    // Update final stats
    elements.finalScore.textContent = Game.score;
    elements.finalLevel.textContent = Game.level;
    elements.finalEnemies.textContent = Game.enemiesDefeated;
    
    elements.gameOverScreen.classList.add('active');
    playSound('gameOver');
    
    // Update leaderboard
    updateLeaderboard();
}

function showMenu() {
    Game.state = 'menu';
    elements.gameOverScreen.classList.remove('active');
    elements.pauseScreen.classList.remove('active');
    elements.startScreen.classList.add('active');
}

function restartGame() {
    gameOver();
    setTimeout(startGame, 500);
}

// =============================================
// GAME LOOP
// =============================================
function gameLoop(timestamp = 0) {
    // Calculate delta time
    const deltaTime = timestamp - Game.lastTime;
    Game.lastTime = timestamp;
    Game.gameTime += deltaTime;
    
    // Update FPS counter (every second)
    Game.frameCount++;
    if (timestamp > Game.lastFpsUpdate + 1000) {
        Game.fps = Math.round((Game.frameCount * 1000) / (timestamp - Game.lastFpsUpdate));
        Game.frameCount = 0;
        Game.lastFpsUpdate = timestamp;
    }
    
    // Clear canvas
    Game.ctx.fillStyle = '#000';
    Game.ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
    
    // Draw background
    drawBackground();
    
    // Update based on game state
    switch(Game.state) {
        case 'playing':
            updateGame(deltaTime);
            break;
        case 'paused':
            // Still draw everything but don't update
            drawGameObjects();
            drawHUD();
            break;
        case 'menu':
        case 'gameOver':
            // Just draw background
            drawBackground();
            break;
    }
    
    // Request next frame
    requestAnimationFrame(gameLoop);
}

function updateGame(deltaTime) {
    // Update player
    updatePlayer();
    
    // Update bullets
    updateBullets();
    
    // Update enemies
    updateEnemies();
    
    // Update powerups
    updatePowerups();
    
    // Update explosions
    updateExplosions();
    
    // Spawn enemies
    spawnEnemies();
    
    // Spawn powerups
    spawnPowerups();
    
    // Check collisions
    checkCollisions();
    
    // Update level
    updateLevel();
    
    // Update active powerups
    updateActivePowerups();
    
    // Draw everything
    drawGameObjects();
    drawHUD();
    
    // Update UI
    updateUI();
}

// =============================================
// GAME OBJECTS UPDATE
// =============================================
function updatePlayer() {
    // Movement
    let moveX = 0;
    let moveY = 0;
    
    if (Game.keys['w'] || Game.keys['arrowup']) moveY -= Game.player.speed;
    if (Game.keys['s'] || Game.keys['arrowdown']) moveY += Game.player.speed;
    if (Game.keys['a'] || Game.keys['arrowleft']) moveX -= Game.player.speed;
    if (Game.keys['d'] || Game.keys['arrowright']) moveX += Game.player.speed;
    
    // Normalize diagonal movement
    if (moveX !== 0 && moveY !== 0) {
        moveX *= 0.7071; // 1/√2
        moveY *= 0.7071;
    }
    
    // Update position with bounds checking
    Game.player.x = Math.max(0, Math.min(Game.canvas.width - Game.player.width, Game.player.x + moveX));
    Game.player.y = Math.max(0, Math.min(Game.canvas.height - Game.player.height, Game.player.y + moveY));
    
    // Rapid fire if shift is held
    if (Game.keys['shift']) {
        Game.shotDelay = 100;
    } else {
        Game.shotDelay = 200;
    }
    
    // Auto-shoot if space is held
    if (Game.keys[' '] && Game.state === 'playing') {
        const now = Date.now();
        if (now - Game.lastShot > Game.shotDelay) {
            shoot();
            Game.lastShot = now;
        }
    }
}

function shoot() {
    const bullet = {
        x: Game.player.x + Game.player.width / 2 - Game.currentWeapon.width / 2,
        y: Game.player.y,
        width: Game.currentWeapon.width,
        height: Game.currentWeapon.height,
        speed: 10,
        color: Game.currentWeapon.color,
        damage: Game.currentWeapon.damage
    };
    
    Game.bullets.push(bullet);
    playSound('shoot');
    
    // Double shot powerup
    if (hasPowerup('doubleShot')) {
        Game.bullets.push({
            ...bullet,
            x: Game.player.x + Game.player.width / 2 - bullet.width / 2 - 10
        });
        Game.bullets.push({
            ...bullet,
            x: Game.player.x + Game.player.width / 2 - bullet.width / 2 + 10
        });
    }
}

function updateBullets() {
    for (let i = Game.bullets.length - 1; i >= 0; i--) {
        const bullet = Game.bullets[i];
        bullet.y -= bullet.speed;
        
        // Remove bullets that are off screen
        if (bullet.y < -bullet.height) {
            Game.bullets.splice(i, 1);
        }
    }
}

function spawnEnemies() {
    const now = Date.now();
    if (now - Game.lastSpawn > Game.enemySpawnRate) {
        Game.lastSpawn = now;
        
        // Increase spawn rate with level
        const spawnRate = Math.max(200, Game.enemySpawnRate - (Game.level * 50));
        Game.enemySpawnRate = spawnRate;
        
        // Spawn 1-3 enemies based on level
        const count = Math.min(3, Math.floor(Game.level / 3) + 1);
        
        for (let i = 0; i < count; i++) {
            const enemyTypes = [
                {
                    width: 30, height: 30, color: '#ff5555', 
                    health: 10 + Game.level * 2, speed: 1 + Game.level * 0.2,
                    score: 100
                },
                {
                    width: 40, height: 40, color: '#ffaa00', 
                    health: 20 + Game.level * 3, speed: 0.8 + Game.level * 0.15,
                    score: 200
                },
                {
                    width: 50, height: 50, color: '#ff00ff', 
                    health: 30 + Game.level * 4, speed: 0.6 + Game.level * 0.1,
                    score: 300
                }
            ];
            
            // Higher level enemies appear at higher levels
            const enemyType = Math.min(
                Math.floor(Math.random() * Math.min(Game.level, 3)),
                enemyTypes.length - 1
            );
            
            const enemy = enemyTypes[enemyType];
            
            Game.enemies.push({
                x: Math.random() * (Game.canvas.width - enemy.width),
                y: -enemy.height,
                width: enemy.width,
                height: enemy.height,
                color: enemy.color,
                health: enemy.health,
                maxHealth: enemy.health,
                speed: enemy.speed,
                score: enemy.score,
                type: enemyType
            });
        }
    }
}

function updateEnemies() {
    for (let i = Game.enemies.length - 1; i >= 0; i--) {
        const enemy = Game.enemies[i];
        enemy.y += enemy.speed;
        
        // Remove enemies that are off screen
        if (enemy.y > Game.canvas.height) {
            Game.enemies.splice(i, 1);
            Game.lives--;
            if (Game.lives <= 0) {
                gameOver();
            }
            playSound('lifeLost');
        }
    }
}

function spawnPowerups() {
    // 1% chance per frame to spawn a powerup
    if (Math.random() < 0.01) {
        const powerupTypes = [
            { type: 'health', color: '#00ff00', text: '+', value: 30 },
            { type: 'rapidFire', color: '#ffaa00', text: '⚡', duration: 10000 },
            { type: 'shield', color: '#0088ff', text: '🛡️', duration: 15000 },
            { type: 'doubleShot', color: '#ff00ff', text: '✖️', duration: 8000 },
            { type: 'scoreBoost', color: '#ffff00', text: '⭐', duration: 12000 }
        ];
        
        const powerup = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
        
        Game.powerups.push({
            x: Math.random() * (Game.canvas.width - 30),
            y: -30,
            width: 30,
            height: 30,
            color: powerup.color,
            type: powerup.type,
            text: powerup.text,
            value: powerup.value || 0,
            duration: powerup.duration || 0,
            speed: 2,
            collected: false
        });
    }
}

function updatePowerups() {
    for (let i = Game.powerups.length - 1; i >= 0; i--) {
        const powerup = Game.powerups[i];
        powerup.y += powerup.speed;
        
        // Remove powerups that are off screen
        if (powerup.y > Game.canvas.height) {
            Game.powerups.splice(i, 1);
        }
    }
}

function updateExplosions() {
    for (let i = Game.explosions.length - 1; i >= 0; i--) {
        const explosion = Game.explosions[i];
        explosion.radius += explosion.growth;
        explosion.opacity -= 0.02;
        
        if (explosion.opacity <= 0) {
            Game.explosions.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Check bullet-enemy collisions
    for (let i = Game.bullets.length - 1; i >= 0; i--) {
        const bullet = Game.bullets[i];
        
        for (let j = Game.enemies.length - 1; j >= 0; j--) {
            const enemy = Game.enemies[j];
            
            if (checkRectCollision(bullet, enemy)) {
                // Hit enemy
                enemy.health -= bullet.damage;
                
                // Create explosion
                createExplosion(
                    bullet.x + bullet.width / 2,
                    bullet.y + bullet.height / 2,
                    '#ff5555'
                );
                
                // Remove bullet
                Game.bullets.splice(i, 1);
                
                // Check if enemy is defeated
                if (enemy.health <= 0) {
                    Game.enemies.splice(j, 1);
                    Game.score += enemy.score;
                    Game.enemiesDefeated++;
                    
                    // Create bigger explosion
                    createExplosion(
                        enemy.x + enemy.width / 2,
                        enemy.y + enemy.height / 2,
                        enemy.color,
                        20,
                        2
                    );
                    
                    playSound('enemyExplode');
                    
                    // Chance to drop powerup (20%)
                    if (Math.random() < 0.2) {
                        spawnPowerupAt(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    }
                } else {
                    playSound('hit');
                }
                
                break;
            }
        }
    }
    
    // Check player-enemy collisions
    if (!hasPowerup('shield')) {
        for (let i = Game.enemies.length - 1; i >= 0; i--) {
            const enemy = Game.enemies[i];
            
            if (checkRectCollision(Game.player, enemy)) {
                // Collision with enemy
                Game.enemies.splice(i, 1);
                Game.health -= 20;
                
                // Create explosion
                createExplosion(
                    enemy.x + enemy.width / 2,
                    enemy.y + enemy.height / 2,
                    enemy.color,
                    25,
                    3
                );
                
                playSound('playerHit');
                
                if (Game.health <= 0) {
                    Game.lives--;
                    Game.health = Game.maxHealth;
                    
                    if (Game.lives <= 0) {
                        gameOver();
                    } else {
                        playSound('lifeLost');
                    }
                }
            }
        }
    }
    
    // Check player-powerup collisions
    for (let i = Game.powerups.length - 1; i >= 0; i--) {
        const powerup = Game.powerups[i];
        
        if (checkRectCollision(Game.player, powerup) && !powerup.collected) {
            collectPowerup(powerup);
            Game.powerups.splice(i, 1);
        }
    }
}

function checkRectCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

function collectPowerup(powerup) {
    powerup.collected = true;
    
    switch(powerup.type) {
        case 'health':
            Game.health = Math.min(Game.maxHealth, Game.health + powerup.value);
            playSound('health');
            break;
            
        case 'rapidFire':
            addPowerup('rapidFire', powerup.duration);
            Game.shotDelay = 50;
            playSound('powerup');
            break;
            
        case 'shield':
            addPowerup('shield', powerup.duration);
            playSound('shield');
            break;
            
        case 'doubleShot':
            addPowerup('doubleShot', powerup.duration);
            playSound('powerup');
            break;
            
        case 'scoreBoost':
            addPowerup('scoreBoost', powerup.duration);
            playSound('powerup');
            break;
    }
    
    // Create collection effect
    createExplosion(
        powerup.x + powerup.width / 2,
        powerup.y + powerup.height / 2,
        powerup.color,
        15,
        1.5
    );
}

function addPowerup(type, duration) {
    // Remove existing powerup of same type
    const existingIndex = Game.activePowerups.findIndex(p => p.type === type);
    if (existingIndex !== -1) {
        Game.activePowerups.splice(existingIndex, 1);
    }
    
    Game.activePowerups.push({
        type: type,
        expires: Date.now() + duration,
        duration: duration
    });
    
    updatePowerupsDisplay();
}

function hasPowerup(type) {
    return Game.activePowerups.some(p => p.type === type);
}

function updateActivePowerups() {
    const now = Date.now();
    
    for (let i = Game.activePowerups.length - 1; i >= 0; i--) {
        const powerup = Game.activePowerups[i];
        
        if (now >= powerup.expires) {
            Game.activePowerups.splice(i, 1);
            
            // Reset effects
            if (powerup.type === 'rapidFire') {
                Game.shotDelay = 200;
            }
        }
    }
    
    // Update display every 10 frames
    if (Game.frameCount % 10 === 0) {
        updatePowerupsDisplay();
    }
}

function updateLevel() {
    const newLevel = Math.floor(Game.score / Game.levelUpScore) + 1;
    if (newLevel > Game.level) {
        Game.level = newLevel;
        playSound('levelUp');
        
        // Increase player speed every 5 levels
        if (Game.level % 5 === 0) {
            Game.player.speed += 0.5;
        }
    }
}

function spawnPowerupAt(x, y) {
    const powerupTypes = [
        { type: 'health', color: '#00ff00', text: '+' },
        { type: 'rapidFire', color: '#ffaa00', text: '⚡' }
    ];
    
    const powerup = powerupTypes[Math.floor(Math.random() * powerupTypes.length)];
    
    Game.powerups.push({
        x: x - 15,
        y: y - 15,
        width: 30,
        height: 30,
        color: powerup.color,
        type: powerup.type,
        text: powerup.text,
        value: powerup.type === 'health' ? 20 : 0,
        duration: powerup.type === 'rapidFire' ? 5000 : 0,
        speed: 0,
        collected: false
    });
}

function createExplosion(x, y, color, radius = 10, growth = 1) {
    Game.explosions.push({
        x: x,
        y: y,
        radius: 0,
        maxRadius: radius,
        color: color,
        growth: growth,
        opacity: 1
    });
}

// =============================================
// DRAWING FUNCTIONS
// =============================================
function drawBackground() {
    // Draw starfield
    Game.ctx.fillStyle = '#111';
    Game.ctx.fillRect(0, 0, Game.canvas.width, Game.canvas.height);
    
    // Draw grid lines
    Game.ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
    Game.ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < Game.canvas.width; x += 40) {
        Game.ctx.beginPath();
        Game.ctx.moveTo(x, 0);
        Game.ctx.lineTo(x, Game.canvas.height);
        Game.ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < Game.canvas.height; y += 40) {
        Game.ctx.beginPath();
        Game.ctx.moveTo(0, y);
        Game.ctx.lineTo(Game.canvas.width, y);
        Game.ctx.stroke();
    }
    
    // Draw scanlines
    Game.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    for (let y = 0; y < Game.canvas.height; y += 2) {
        Game.ctx.fillRect(0, y, Game.canvas.width, 1);
    }
}

function drawGameObjects() {
    // Draw explosions
    drawExplosions();
    
    // Draw enemies
    drawEnemies();
    
    // Draw powerups
    drawPowerups();
    
    // Draw bullets
    drawBullets();
    
    // Draw player
    drawPlayer();
}

function drawPlayer() {
    const p = Game.player;
    
    // Draw shield if active
    if (hasPowerup('shield')) {
        Game.ctx.beginPath();
        Game.ctx.arc(p.x + p.width/2, p.y + p.height/2, p.width * 0.7, 0, Math.PI * 2);
        Game.ctx.strokeStyle = '#0088ff';
        Game.ctx.lineWidth = 3;
        Game.ctx.stroke();
        Game.ctx.fillStyle = 'rgba(0, 136, 255, 0.1)';
        Game.ctx.fill();
    }
    
    // Draw player ship
    Game.ctx.fillStyle = p.color;
    Game.ctx.fillRect(p.x, p.y, p.width, p.height);
    
    // Draw player details
    Game.ctx.fillStyle = '#000';
    Game.ctx.fillRect(p.x + 8, p.y + 8, p.width - 16, p.height - 16);
    
    // Draw cockpit
    Game.ctx.fillStyle = '#00ff00';
    Game.ctx.fillRect(p.x + 12, p.y + 12, p.width - 24, p.height - 24);
    
    // Draw engine glow
    Game.ctx.fillStyle = '#00ff00';
    Game.ctx.fillRect(p.x + p.width/2 - 5, p.y + p.height, 10, 15);
    Game.ctx.fillStyle = '#ffff00';
    Game.ctx.fillRect(p.x + p.width/2 - 3, p.y + p.height + 2, 6, 10);
}

function drawBullets() {
    Game.bullets.forEach(bullet => {
        // Draw bullet
        Game.ctx.fillStyle = bullet.color;
        Game.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        
        // Draw bullet trail
        Game.ctx.fillStyle = bullet.color + '80';
        Game.ctx.fillRect(bullet.x, bullet.y + bullet.height, bullet.width, 10);
    });
}

function drawEnemies() {
    Game.enemies.forEach(enemy => {
        // Draw enemy
        Game.ctx.fillStyle = enemy.color;
        Game.ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Draw enemy details
        Game.ctx.fillStyle = '#000';
        Game.ctx.fillRect(enemy.x + 6, enemy.y + 6, enemy.width - 12, enemy.height - 12);
        
        // Draw enemy face (Evil Larry!)
        Game.ctx.fillStyle = '#ff5555';
        Game.ctx.fillRect(enemy.x + 10, enemy.y + 10, 6, 6);
        Game.ctx.fillRect(enemy.x + enemy.width - 16, enemy.y + 10, 6, 6);
        Game.ctx.fillRect(enemy.x + enemy.width/2 - 3, enemy.y + enemy.height - 10, 6, 3);
        
        // Draw health bar
        if (enemy.health < enemy.maxHealth) {
            const healthPercent = enemy.health / enemy.maxHealth;
            const barWidth = enemy.width - 4;
            const healthWidth = barWidth * healthPercent;
            
            Game.ctx.fillStyle = '#333';
            Game.ctx.fillRect(enemy.x + 2, enemy.y - 8, barWidth, 4);
            
            Game.ctx.fillStyle = healthPercent > 0.5 ? '#00ff00' : 
                                healthPercent > 0.25 ? '#ffff00' : '#ff0000';
            Game.ctx.fillRect(enemy.x + 2, enemy.y - 8, healthWidth, 4);
        }
    });
}

function drawPowerups() {
    Game.powerups.forEach(powerup => {
        // Draw powerup glow
        Game.ctx.beginPath();
        Game.ctx.arc(
            powerup.x + powerup.width/2,
            powerup.y + powerup.height/2,
            powerup.width/2 + 5,
            0, Math.PI * 2
        );
        Game.ctx.fillStyle = powerup.color + '40';
        Game.ctx.fill();
        
        // Draw powerup
        Game.ctx.fillStyle = powerup.color;
        Game.ctx.fillRect(powerup.x, powerup.y, powerup.width, powerup.height);
        
        // Draw powerup symbol
        Game.ctx.fillStyle = '#fff';
        Game.ctx.font = '20px Arial';
        Game.ctx.textAlign = 'center';
        Game.ctx.textBaseline = 'middle';
        Game.ctx.fillText(
            powerup.text,
            powerup.x + powerup.width/2,
            powerup.y + powerup.height/2
        );
    });
}

function drawExplosions() {
    Game.explosions.forEach(explosion => {
        Game.ctx.beginPath();
        Game.ctx.arc(explosion.x, explosion.y, explosion.radius, 0, Math.PI * 2);
        Game.ctx.fillStyle = explosion.color.replace(')', ', ' + explosion.opacity + ')').replace('rgb', 'rgba');
        Game.ctx.fill();
        
        // Draw outer ring
        Game.ctx.beginPath();
        Game.ctx.arc(explosion.x, explosion.y, explosion.radius * 1.5, 0, Math.PI * 2);
        Game.ctx.strokeStyle = explosion.color.replace(')', ', ' + (explosion.opacity * 0.5) + ')').replace('rgb', 'rgba');
        Game.ctx.lineWidth = 2;
        Game.ctx.stroke();
    });
}

function drawHUD() {
    // Draw score in top-left
    Game.ctx.fillStyle = '#00ff00';
    Game.ctx.font = '20px "Press Start 2P"';
    Game.ctx.textAlign = 'left';
    Game.ctx.fillText(`SCORE: ${Game.score}`, 10, 30);
    
    // Draw level in top-right
    Game.ctx.textAlign = 'right';
    Game.ctx.fillText(`LEVEL: ${Game.level}`, Game.canvas.width - 10, 30);
    
    // Draw lives
    Game.ctx.textAlign = 'left';
    Game.ctx.fillText(`LIVES: ${Game.lives}`, 10, 60);
    
    // Draw FPS (debug)
    if (false) { // Set to true for debug mode
        Game.ctx.fillStyle = '#888';
        Game.ctx.font = '12px Arial';
        Game.ctx.fillText(`FPS: ${Game.fps}`, Game.canvas.width - 60, Game.canvas.height - 10);
    }
}

// =============================================
// UI UPDATES
// =============================================
function updateUI() {
    // Update score displays
    elements.scoreDisplay.textContent = Game.score;
    elements.levelDisplay.textContent = Game.level;
    elements.livesDisplay.textContent = Game.lives;
    elements.enemiesDisplay.textContent = Game.enemiesDefeated;
    
    // Update health
    const healthPercent = (Game.health / Game.maxHealth) * 100;
    elements.healthFill.style.width = `${healthPercent}%`;
    elements.healthText.textContent = `${Math.round(healthPercent)}%`;
    
    // Update health bar color
    if (healthPercent > 60) {
        elements.healthFill.style.background = 'linear-gradient(90deg, #00ff00, #00cc00)';
    } else if (healthPercent > 30) {
        elements.healthFill.style.background = 'linear-gradient(90deg, #ffff00, #ffaa00)';
    } else {
        elements.healthFill.style.background = 'linear-gradient(90deg, #ff5555, #ff0000)';
    }
    
    // Update weapon info
    elements.weaponName.textContent = Game.currentWeapon.name;
    elements.weaponDamage.textContent = Game.currentWeapon.damage;
    
    // Update high score displays
    updateHighScoreDisplay();
}

function updateHighScoreDisplay() {
    elements.highScoreDisplay.textContent = Game.highScore;
    elements.footerHighScore.textContent = Game.highScore;
}

function updatePowerupsDisplay() {
    const container = elements.activePowerups;
    
    if (Game.activePowerups.length === 0) {
        container.innerHTML = '<div class="no-powerups">No active power-ups</div>';
        return;
    }
    
    container.innerHTML = '';
    
    Game.activePowerups.forEach(powerup => {
        const remaining = Math.max(0, powerup.expires - Date.now());
        const percent = (remaining / powerup.duration) * 100;
        
        let icon, name, color;
        switch(powerup.type) {
            case 'rapidFire':
                icon = '⚡';
                name = 'RAPID FIRE';
                color = '#ffaa00';
                break;
            case 'shield':
                icon = '🛡️';
                name = 'SHIELD';
                color = '#0088ff';
                break;
            case 'doubleShot':
                icon = '✖️';
                name = 'DOUBLE SHOT';
                color = '#ff00ff';
                break;
            case 'scoreBoost':
                icon = '⭐';
                name = 'SCORE BOOST';
                color = '#ffff00';
                break;
        }
        
        const element = document.createElement('div');
        element.className = 'powerup-item';
        element.innerHTML = `
            <div class="powerup-icon">${icon}</div>
            <div class="powerup-info">
                <div class="powerup-name" style="color: ${color}">${name}</div>
                <div class="powerup-timer">
                    <div class="timer-bar">
                        <div class="timer-fill" style="width: ${percent}%; background: ${color}"></div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(element);
    });
}

// =============================================
// AUDIO FUNCTIONS
// =============================================
function playSound(soundName) {
    if (!Game.soundEnabled) return;
    
    // In a real implementation, you would play actual audio files
    console.log(`Playing sound: ${soundName}`);
    
    // For now, we'll just use console logs
    const sounds = {
        'shoot': '🔫 Pew!',
        'hit': '💥 Hit!',
        'enemyExplode': '💣 Boom!',
        'playerHit': '😫 Ouch!',
        'lifeLost': '💔 Life lost!',
        'health': '❤️ Health restored!',
        'powerup': '⭐ Powerup collected!',
        'shield': '🛡️ Shield activated!',
        'levelUp': '🎯 Level up!',
        'start': '🚀 Game started!',
        'pause': '⏸️ Game paused',
        'resume': '▶️ Game resumed',
        'gameOver': '💀 Game over!'
    };
    
    if (sounds[soundName]) {
        console.log(sounds[soundName]);
    }
}

function toggleSound() {
    Game.soundEnabled = !Game.soundEnabled;
    const icon = elements.soundToggle.querySelector('i');
    
    if (Game.soundEnabled) {
        icon.className = 'fas fa-volume-up';
        elements.soundToggle.title = 'Sound: ON';
        playSound('powerup');
    } else {
        icon.className = 'fas fa-volume-mute';
        elements.soundToggle.title = 'Sound: OFF';
    }
}

// =============================================
// FULLSCREEN FUNCTION
// =============================================
function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.log(`Error attempting to enable fullscreen: ${err.message}`);
        });
        elements.fullscreenToggle.innerHTML = '<i class="fas fa-compress"></i>';
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            elements.fullscreenToggle.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }
}

// =============================================
// DISCORD & LEADERBOARD FUNCTIONS
// =============================================
function showDiscordModal() {
    elements.discordModal.classList.add('active');
}

function showLeaderboardModal() {
    updateLeaderboard();
    elements.leaderboardModal.classList.add('active');
}

function connectDiscord() {
    // In a real implementation, this would open Discord OAuth
    alert('Discord connection would open here in a real implementation!\n\nFor now, your scores are saved locally.');
    elements.discordModal.classList.remove('active');
}

function updateLeaderboard() {
    const leaderboardList = elements.leaderboardList;
    leaderboardList.innerHTML = '';
    
    // Get leaderboard from localStorage or use default
    let leaderboard = JSON.parse(localStorage.getItem('larryLeaderboard')) || [
        { name: 'PixelMaster', score: 25430, avatar: '👾' },
        { name: 'NFTHunter', score: 18920, avatar: '🎮' },
        { name: 'LarryFan', score: 15670, avatar: '👑' },
        { name: 'BasementKing', score: 12340, avatar: '🏆' },
        { name: 'RetroGamer', score: 10150, avatar: '🎯' }
    ];
    
    // Add current score if it's high enough
    if (Game.score > 0) {
        leaderboard.push({
            name: 'YOU',
            score: Game.score,
            avatar: '🎯'
        });
    }
    
    // Sort by score
    leaderboard.sort((a, b) => b.score - a.score);
    
    // Keep only top 10
    leaderboard = leaderboard.slice(0, 10);
    
    // Save to localStorage
    localStorage.setItem('larryLeaderboard', JSON.stringify(leaderboard));
    
    // Create leaderboard entries
    leaderboard.forEach((entry, index) => {
        const element = document.createElement('div');
        element.className = 'leaderboard-entry';
        
        // Add medal emoji for top 3
        let medal = '';
        if (index === 0) medal = '🥇';
        else if (index === 1) medal = '🥈';
        else if (index === 2) medal = '🥉';
        
        element.innerHTML = `
            <div class="leaderboard-rank">${index + 1}</div>
            <div class="leaderboard-avatar">${entry.avatar}</div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${medal} ${entry.name}</div>
                <div class="leaderboard-score">${entry.score.toLocaleString()}</div>
            </div>
        `;
        
        leaderboardList.appendChild(element);
    });
}

// =============================================
// START THE GAME
// =============================================
// Initialize when page loads
window.addEventListener('load', init);
