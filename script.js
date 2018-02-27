var canvas, context;
var HEIGHT = window.innerHeight, WIDTH = window.innerWidth;

document.addEventListener("DOMContentLoaded", main, true);
document.addEventListener("mousedown", onmousedown, true);
document.addEventListener("keydown", onkeydown, true);

var balls = new Array();
var count = 51; // initial amount of balls
var size = WIDTH/341.5;
var G = 15; // interaction constant
var elasticCoef = 0.75;
var dt = 0.01; // evaluation step (10 ms)
var g = 0; // F = mg
var isStarted = false;

var aBall;
for(let i = 0; i < count; i++){ // initial scene
    aBall = new Ball();
    aBall.x = Math.random() * WIDTH;
    aBall.y = Math.random() * HEIGHT;
    aBall.r = (Math.random() + 1) * size;
    aBall.m = aBall.r * aBall.r * aBall.r;
    aBall.im = 1 / aBall.m;
    balls.push(aBall);
}

function onmousedown(/*MouseEvent*/ e){
    let aBall = new Ball();
    aBall.r = (Math.random() + 1) * size;
    aBall.x = e.clientX + aBall.r;
    aBall.y = e.clientY + aBall.r;
    aBall.m = aBall.r * aBall.r * aBall.r;
    if (balls.length >= 200) {
        aBall.vx = 5000;
        aBall.vy = 0;
    } else {
        aBall.vx = Math.random() * 500 - 250;
        aBall.vy = Math.random() * 500 - 250;
    }
    aBall.im = 1 / aBall.m;
    balls.push(aBall);

}

function onkeydown(/*KeyDownEvent*/ e) {
    if (e.keyCode == 71) { // G
        g = g > 0 ? 0 : 250; 
    }
    if (e.keyCode == 32) { // Spacebar
            let timer = setInterval(addBallStart, 10);
            setTimeout(function() {
                clearInterval(timer);
            }, 1500);
    }
    if (e.keyCode == 70) { // F
        balls.forEach(FreezeSpeed); 
    }
    if (e.keyCode == 82) { // R
        balls.forEach(ReverseSpeed); 
    }
    if (e.keyCode == 87) { // W
        balls.forEach(AddSpeedW); 
    }
    if (e.keyCode == 65) { // A
        balls.forEach(AddSpeedA); 
    }
    if (e.keyCode == 83) { // S
        balls.forEach(AddSpeedS); 
    }
    if (e.keyCode == 68) { // D
        balls.forEach(AddSpeedD); 
    }
    if (e.keyCode == 69) { // E
        balls.forEach(IncSpeed); 
    }
    if (e.keyCode == 81) { // Q
        balls.forEach(DecSpeed); 
    }
    if (e.keyCode == 67) { // C
        balls = []; // Clear All
        isStarted = false;
    }
    if (e.keyCode == 88) { // X
        balls = balls.slice(balls.length/2); //Clear Half
        isStarted = false;
    }
    if (e.keyCode == 84) { // T
        let timer = setInterval(AddStream, 5);
            setTimeout(function() {
                clearInterval(timer);
            }, 2000 );
    }
}

function FreezeSpeed(obj) {
    obj.vx = 0;
    obj.vy = 0;
}

function ReverseSpeed(obj) {
    obj.vx *= -1;
    obj.vy *= -1;
}

function AddSpeedW(obj) {
    obj.vy -= 400 / obj.r;
}
function AddSpeedA(obj) {
    obj.vx -= 400 / obj.r;
}
function AddSpeedS(obj) {
    obj.vy += 400 / obj.r;
}
function AddSpeedD(obj) {
    obj.vx += 400 / obj.r;
}

function addBallStart(e) {
    aBall = new Ball();
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

function AddStream() {
    aBall = new Ball();
    aBall.r = (Math.random() + 1) * size;
    aBall.x = WIDTH - aBall.r;
    aBall.y = 0.25 * HEIGHT + (2* Math.random() - 1) * HEIGHT * 0.1;
    aBall.m = aBall.r * aBall.r * aBall.r;
    aBall.vx = -500;
    aBall.vy = 0;
    aBall.im = 1 / aBall.m;
    balls.push(aBall);
}

function IncSpeed(obj) {
    obj.vx *= 1.25;
    obj.vy *= 1.25;
}

function DecSpeed(obj) {
    obj.vx *= 0.75;
    obj.vy *= 0.75;
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

function main(){
        canvas = document.createElement('canvas');
        canvas.height = HEIGHT;
        canvas.width = WIDTH;
        canvas.id = 'canvas';
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';
        document.body.appendChild(canvas);
        context = canvas.getContext("2d");

        timer = setInterval(Step, dt * 1000);
}

function Draw(){
    // clear screen
    context.fillStyle = "#000000";
    context.fillRect(0, 0, WIDTH, HEIGHT);

    // draw circles
    context.fillStyle = "#4286f4";
    for(var i = 0; i < balls.length; i++){
        context.beginPath();
        
        context.arc(
            balls[i].x - balls[i].r,
            balls[i].y - balls[i].r,
            balls[i].r,
            0,
            Math.PI * 2
        );
        
        context.closePath();
        context.fill();
    }
}

function Step(){
    let a, ax, ay, dx, dy, r;
    
    // interaction
    for(let i = 0; i < balls.length; i++)
        for(let j = 0; j < balls.length; j++)
        {
            if(i == j) continue;
            dx = balls[j].x - balls[j].r - balls[i].x + balls[i].r;
            dy = balls[j].y - balls[j].r - balls[i].y + balls[i].r;
            
            r = dx * dx + dy * dy;//  R^2
            a = G * balls[j].m / r;
            
            r = Math.sqrt(r); // R

            // collision\
            let summR = balls[j].r + balls[i].r;
            if (r < summR) {
                solveCollision(balls[i], balls[j], summR);
            };

            ax = a * dx / r; // a * cos
            ay = a * dy / r; // a * sin
            
            balls[i].vx += ax * dt;
            balls[i].vy += ay * dt;
        }
    
    // change coords
    for(let i = 0; i < balls.length; i++){
        balls[i].x += balls[i].vx * dt;
        balls[i].y += balls[i].vy * dt;
        balls[i].vy += g * dt;
        checkBoundaries.call(balls[i]);
    }
    
    Draw();
}

function checkBoundaries() {
    if (this.x - 2 * this.r < 0) {
        this.vx = - 0.75 * this.vx;
        this.x = 2 * this.r + 0.1;
    }
    if (this.x > WIDTH) {
        this.vx = - 0.75 * this.vx;
        this.x = WIDTH - 0.1;
    }
    if (this.y - 2 * this.r < 0) {
        this.vy = - 0.75 * this.vy;
        this.y = 2 * this.r + 0.1;
    }
    if (this.y > HEIGHT) {
        this.vy = - 0.75 * this.vy;
        this.y = HEIGHT - 0.1;
    }
}

function solveCollision(ball_1, ball_2, summR) {

    let normalX = ball_2.x - ball_1.x;
    let normalY = ball_2.y - ball_1.y;
    let normalizingCoef = Math.sqrt( normalX*normalX + normalY*normalY );

    let penetration = summR - normalizingCoef;

    normalX /= normalizingCoef;
    normalY /= normalizingCoef;


    
    let dVx = ball_2.vx - ball_1.vx;  
    let dVy = ball_2.vy - ball_1.vy;

    let dotProduct = dVx * normalX + dVy * normalY;
    if (dotProduct > 0) {

        return;
    }
    
    let P = - ( 1 + elasticCoef ) * dotProduct; // impulse
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