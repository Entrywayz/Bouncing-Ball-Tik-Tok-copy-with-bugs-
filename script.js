const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth - 50;
canvas.height = window.innerHeight - 50;

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2 - 100,
    radius: 10,
    vy: 0,
    vx: 4,
    gravity: 0.4,
    color: 'black',
    bounce: 0.9,
    friction: 0.99
};

const color = ['red', 'green', 'blue'];

const rings = Array.from({length: 50}, (_, i) => ({
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 160 + i * 5,
    gapAngle: Math.PI / 4,
    gapStart: Math.PI * 1.5,
    rotation: 0,
    rotationSpeed: 0.002 + i * 0.00001,
    active: true
}));

addEventListener('keydown', (e) => {
    if(e.key === 'w' || e.key === 'ArrowUp') ball.vy -= 8;
    if(e.key === 's' || e.key === 'ArrowDown') ball.vy += 8;
    if(e.key === 'a' || e.key === 'ArrowLeft') ball.vx -= 8;
    if(e.key === 'd' || e.key === 'ArrowRight') ball.vx += 8;
    if(e.key === 'r') resetGame();
});

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2 - 100;
    ball.vx = 4;
    ball.vy = 0;
}

function resetGame() {
    resetBall();
    rings.forEach(ring => {
        ring.active = true;
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ball.vy += ball.gravity;
    ball.x += ball.vx;
    ball.vy -= 0.001
    ball.y += ball.vy;

    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -ball.bounce;
    } else if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -ball.bounce;
    }

    if (ball.x + ball.radius > canvas.width) {
        ball.x = canvas.width - ball.radius;
        ball.vx *= -ball.bounce;
    } else if (ball.x - ball.radius < 0) {
        ball.x = ball.radius;
        ball.vx *= -ball.bounce;
    }

    for (let r of rings) {
        if (!r.active) continue;

        const dx = ball.x - r.x;
        const dy = ball.y - r.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance + ball.radius > r.radius && distance - ball.radius < r.radius) {
            const angle = Math.atan2(dy, dx);
            const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);

            let rotatedGapStart = (r.gapStart + r.rotation) % (Math.PI * 2);
            const gapStart = (rotatedGapStart + Math.PI * 2) % (Math.PI * 2);
            const gapEnd = (gapStart + r.gapAngle + Math.PI * 2) % (Math.PI * 2);

            let inGap = false;

            if (gapStart < gapEnd) {
                inGap = (normalizedAngle >= gapStart && normalizedAngle <= gapEnd);
            } else {
                inGap = (normalizedAngle >= gapStart || normalizedAngle <= gapEnd);
            }

            if (inGap) {
                r.active = false;
                ball.vx *= 1.1;
                ball.vy *= 1.1;
            } else {
                // Столкновение с кольцом
                const nx = dx / distance;
                const ny = dy / distance;

                ball.x = r.x + nx * (r.radius - ball.radius);
                ball.y = r.y + ny * (r.radius - ball.radius);

                const dot = ball.vx * nx + ball.vy * ny;
                ball.vx = ball.vx - 2 * dot * nx;
                ball.vy = ball.vy - 2 * dot * ny;

                ball.vx *= ball.bounce;
                ball.vy *= ball.bounce;
            }
        }
    }

    for (let r of rings) {
        if (!r.active) continue;

        r.rotation += r.rotationSpeed;
        r.rotation = (r.rotation + Math.PI * 2) % (Math.PI * 2);

        let rotatedGapStart = (r.gapStart + r.rotation) % (Math.PI * 2);
        const startAngle = (rotatedGapStart + r.gapAngle) % (Math.PI * 2);
        const endAngle = rotatedGapStart;

        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, startAngle, endAngle);
        ctx.strokeStyle = color[Math.floor(Math.random() * color.length)];
        ctx.lineWidth = 2;
        ctx.stroke();
    }

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = ball.color;
    ctx.fill();

    const activeRings = rings.filter(r => r.active).length;
    if (activeRings === 0) {
        ctx.font = '30px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('You Win! Press R to restart', canvas.width/2, canvas.height/2);
    }

    requestAnimationFrame(draw);
}

draw();
