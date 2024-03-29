document.addEventListener("DOMContentLoaded", main);
document.addEventListener("mousedown", onMouseDown);
document.addEventListener("keydown", onKeyDown);
var canvas, context;
var HEIGHT = window.innerHeight, WIDTH = window.innerWidth;
var balls = new Array();
var initialCount = 51; // initial amount of balls
var size = WIDTH / 400;
var G = 50; // interaction constant
var elasticCoef = 0.75;
var dt = 0.01; // evaluation step 10 ms 
var g = 0; // F = mg
var isStarted = false;
var isPaused = false;
var isStreaming = false;
var isAdding = false;
var anim, timerSpace, timerT, timerAnimation;
var fps = 26;
var isDrawTails = true;
const boundaryDissipation = 0.75;

function main() {
    if (!isStarted) {
        prepareCanvas();
        makeScene();
        isStarted = true;
    }
    update();
    draw();
    anim = requestAnimationFrame(main);
    /*timerAnimation = setTimeout(function() {
        anim = requestAnimationFrame(main);
    }, 1000 / fps);*/
}

function prepareCanvas() {
    canvas = document.createElement('canvas');
    canvas.height = HEIGHT;
    canvas.width = WIDTH - help.clientWidth - 20;
    WIDTH = canvas.width;
    canvas.id = 'canvas';
    document.body.appendChild(canvas);
    context = canvas.getContext("2d");
}

function makeScene() {
    for (let i = 0; i < initialCount; i++) {
        createBall();
    }
}

function createBall() {
    let aBall = new Ball();
    aBall.x = Math.random() * WIDTH;
    aBall.y = Math.random() * HEIGHT;
    aBall.r = (Math.random() + 1) * size;
    aBall.m = aBall.r * aBall.r * aBall.r;
    aBall.im = 1 / aBall.m;
    balls.push(aBall);
}

function Ball() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.r = 0;
    this.m = 0;
    this.im = 0; 
}

function update() {
    let a, ax, ay, dx, dy, r;
    // interaction each to each
    for(let i = 0; i < balls.length; i++) {
        for(let j = 0; j < balls.length; j++) {
            if(i == j) continue;
            dx = balls[j].x - balls[j].r - balls[i].x + balls[i].r;
            dy = balls[j].y - balls[j].r - balls[i].y + balls[i].r;

            r = dx * dx + dy * dy;//  R^2
            a = G * balls[j].m / r;
            r = Math.sqrt(r); // R

            let summR = balls[j].r + balls[i].r;
            if (r < summR) {
                solveCollision(balls[i], balls[j], summR);
            };

            ax = a * dx / r; // a * cos
            ay = a * dy / r; // a * sin
            
            balls[i].vx += ax * dt;
            balls[i].vy += ay * dt;
        }
    }
    // update coords
    for(let i = 0; i < balls.length; i++) {
        balls[i].x += balls[i].vx * dt;
        balls[i].y += balls[i].vy * dt;
        balls[i].vy += g * dt;
        checkBoundaries.call(balls[i]);
    }
}

function solveCollision(ball_1, ball_2, summR) {
    let normalX = ball_2.x - ball_2.r - ball_1.x + ball_1.r;
    let normalY = ball_2.y - ball_2.r - ball_1.y + ball_1.r;
    let normalizingCoef = Math.sqrt(normalX * normalX + normalY * normalY);

    let penetration = summR - normalizingCoef;

    normalX /= normalizingCoef;
    normalY /= normalizingCoef;

    let dVx = ball_2.vx - ball_1.vx;  
    let dVy = ball_2.vy - ball_1.vy;

    let dotProduct = dVx * normalX + dVy * normalY;
    if (dotProduct > 0) {

        return;
    }
    // impulse
    let P = - ( 1 + elasticCoef ) * dotProduct;
    P /= ball_1.im + ball_2.im;

    let impulseX = P * normalX;
    let impulseY = P * normalY;

    ball_1.vx -= ball_1.im * impulseX;
    ball_1.vy -= ball_1.im * impulseY;

    ball_2.vx += ball_2.im * impulseX;
    ball_2.vy += ball_2.im * impulseY;

    // possition correction
    let correctionPercent = 0.2;
    let slop = 0.01;
    let correctionX = Math.max(penetration - slop, 0)/(ball_1.im + ball_2.im) * correctionPercent * normalX;
    let correctionY = Math.max(penetration - slop, 0)/(ball_1.im + ball_2.im) * correctionPercent * normalY;

    ball_1.x -= ball_1.im * correctionX;
    ball_1.y -= ball_1.im * correctionY; 

    ball_2.x += ball_2.im * correctionX;
    ball_2.y += ball_2.im * correctionY;
}

function checkBoundaries() {
    if (this.x - 2 * this.r < 0) {
        this.vx = - boundaryDissipation * this.vx;
        this.x = 2 * this.r + 0.1;
    }
    if (this.x > WIDTH) {
        this.vx = - boundaryDissipation * this.vx;
        this.x = WIDTH - 0.1;
    }
    if (this.y - 2 * this.r < 0) {
        this.vy = - boundaryDissipation * this.vy;
        this.y = 2 * this.r + 0.1;
    }
    if (this.y > HEIGHT) {
        this.vy = - boundaryDissipation * this.vy;
        this.y = HEIGHT - 0.1;
    }
}


function draw() {
    // clear screen
    context.fillStyle = "#000000";
    context.fillRect( 0, 0, WIDTH, HEIGHT );
    // draw circles
    context.fillStyle = "#4286f4";
    context.strokeStyle="#4286f4";
    for ( let i = 0; i < balls.length; i++ ) {
        context.beginPath();
        let x = balls[i].x;
        let y = balls[i].y;
        let r = balls[i].r;
        context.arc(
            x - r,
            y - r,
            r,
            0,
            Math.PI * 2
        );
        context.fill();
        context.closePath();
       // drawBallTail2( x, y, r, balls[i].vx, balls[i].vy );
    }
}


var firstlLineL = 0.2;
var firstlLineW = 2;

function drawBallTail( x, y, r, vx, vy )
{
    context.beginPath();
    context.moveTo( x - r, y - r );
    for ( let j = 0; j < 10; j++ )
    {
        context.lineTo( x - r - ( firstlLineL + j * firstlLineL ) * dt * vx,
                        y - r - ( firstlLineL + j * firstlLineL ) * dt * vy );

        context.lineWidth = (firstlLineW - j * 0.2) * r;
        context.stroke();
    }
    context.closePath();
}

function drawBallTail2( x, y, r, vx, vy )
{
    let length = r / Math.sqrt( vx * vx + vy * vy );
    context.beginPath();
    context.lineTo( x - r - length * vy, y - r - length * ( -vx ) );
    context.lineTo( x - r - 1.5 * vx * dt, y - r - 1.5 * vy * dt );
    context.lineTo( x - r - length * ( -vy ), y - r - length * vx );
    context.fill();
    context.closePath();
}

// input
function onMouseDown(/*MouseEvent*/ e){
    let aBall = new Ball();
    aBall.r = (Math.random() + 1) * size;
    aBall.x = e.clientX + aBall.r;
    aBall.y = e.clientY + aBall.r;
    aBall.m = aBall.r * aBall.r * aBall.r;
    aBall.vx = Math.random() * 500 - 250;
    aBall.vy = Math.random() * 500 - 250;
    aBall.im = 1 / aBall.m;
    balls.push(aBall);
}
function onKeyDown(/*KeyDownEvent*/ e) {
    switch (e.keyCode) {
        case 71: // G
            g = g > 0 ? 0 : 500;
            break;
        case 32: // Spacebar
            if (!isAdding) {
                isAdding = true;
                timerSpace = setInterval(addBalls, 10);
                setTimeout(function() {
                    clearInterval(timerSpace);
                    isAdding = false;
                }, 1500);
            }
            break;
        case 70: // F
            balls.forEach(freezeSpeed);
            break;
        case 82: // R
            balls.forEach(reverseSpeed); 
            break;
        case 87: // W
            balls.forEach(addSpeedW);
            break;
        case 65: // A
            balls.forEach(addSpeedA);
            break;
        case 83: // S
            balls.forEach(addSpeedS);
            break;
        case 68: // D
            balls.forEach(addSpeedD);
            break;
        case 69: // E
            balls.forEach(incSpeed);
            break;
        case 81: // Q
            balls.forEach(decSpeed);
            break;
        case 67: // C
            balls = [];
            break;
        case 88: // X
            balls = balls.slice(balls.length/2);
            break;
        case 84: // T
            if (!isStreaming) {
                isStreaming = true;
                timerT = setInterval(addStream, 10);
                setTimeout(function() {
                    clearInterval(timerT);
                    isStreaming = false;
                }, 2500 );
            }
            break;
        case 80: // P
            pause();
            break;
    }
}

function pause() {
    if (!isPaused) {
        cancelAnimationFrame(anim);
        isPaused = true;
    } else {
        main();
        isPaused = false;
    }
}

function addBalls(e) {
    let aBall = new Ball();
    aBall.r = (Math.random() + 1) * size;
    rand = Math.random();
    if (rand < 0.25) {
        aBall.x = Math.random() * WIDTH;
        aBall.y = aBall.r + 0.1;
    } else if (rand < 0.5) {
        aBall.x = aBall.r + 0.1;
        aBall.y = Math.random() * HEIGHT;
    } else if (rand < 0.75) {
        aBall.x = WIDTH - aBall.r - 0.1;
        aBall.y = Math.random() * HEIGHT;
    } else {
        aBall.x = Math.random() * WIDTH;
        aBall.y = HEIGHT - aBall.r - 0.1;
    }
    aBall.m = aBall.r * aBall.r * aBall.r;
    aBall.vx = Math.random() * 500 - 250;
    aBall.vy = Math.random() * 500 - 250;
    aBall.im = 1 / aBall.m;
    balls.push(aBall);
}

function addStream() {
    let aBall = new Ball();
    aBall.r = (Math.random() + 1) * size;
    aBall.x = WIDTH - aBall.r;
    aBall.y = 0.25 * HEIGHT + (2* Math.random() - 1) * HEIGHT * 0.1;
    aBall.m = aBall.r * aBall.r * aBall.r;
    aBall.vx = -500;
    aBall.vy = 0;
    aBall.im = 1 / aBall.m;
    balls.push(aBall);
}

function freezeSpeed(obj) {
    obj.vx = 0;
    obj.vy = 0;
}

function reverseSpeed(obj) {
    obj.vx *= -1;
    obj.vy *= -1;
}

function addSpeedW(obj) {
    obj.vy -= 400 / obj.r;
}

function addSpeedA(obj) {
    obj.vx -= 400 / obj.r;
}

function addSpeedS(obj) {
    obj.vy += 400 / obj.r;
}

function addSpeedD(obj) {
    obj.vx += 400 / obj.r;
}

function incSpeed(obj) {
    obj.vx *= 1.25;
    obj.vy *= 1.25;
}

function decSpeed(obj) {
    obj.vx *= 0.75;
    obj.vy *= 0.75;
}

//experimental
function speedUpAnimation() {
    for (let i = 0; i < 15; i++) {
        main();
    }
}