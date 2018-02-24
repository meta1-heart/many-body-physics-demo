var canvas, context;
var HEIGHT = window.innerHeight, WIDTH = window.innerWidth;

document.addEventListener("DOMContentLoaded", main, true);
document.addEventListener("mouseup", onmouseup, true);

function onmouseup(/*MouseEvent*/ e){
    let aBall = new Ball();
    aBall.r = 2 * size;
    aBall.x = e.clientX + aBall.r;
    aBall.y = e.clientY + aBall.r;
    aBall.m = aBall.r * aBall.r * aBall.r;
    aBall.vx = 5000;//Math.random() * 100 - 50;
    aBall.vy = 0;//Math.random() * 100 - 50;
    aBall.im = 1 / aBall.m;
    balls.push(aBall);
}

var balls = new Array();
var count = 150; // initial amount of balls
var size = 5;
var G = 7.5; // interaction constant
var elasticCoef = 0.75;
var dt = 0.01; // evaluation step

function Ball() {
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.r = 0;
    this.m = 0;
    this.im = 0; 
}

var aBall;
for(var i = 0; i < count; i++){
    aBall = new Ball();
    aBall.x = Math.random() * WIDTH;
    aBall.y = Math.random() * HEIGHT;
    aBall.r = (Math.random() + 1) * size;
    aBall.m = aBall.r * aBall.r * aBall.r;
    aBall.im = 1 / aBall.m;
    balls.push(aBall);
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
    context.fillStyle = "#ffffff";
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
    for(var i = 0; i < balls.length; i++)
        for(var j = 0; j < balls.length; j++)
        {
            if(i == j) continue;
            dx = balls[j].x - balls[j].r - balls[i].x + balls[i].r;
            dy = balls[j].y - balls[j].r - balls[i].y + balls[i].r;
            
            r = dx * dx + dy * dy;//  R^2
            a = G * balls[j].m / r;
            
            r = Math.sqrt(r); // R

            // collision\
            let d = balls[j].r + balls[i].r;
            if (r < d) {
                solveCollision(balls[i], balls[j], d);
            };

            ax = a * dx / r; // a * cos
            ay = a * dy / r; // a * sin
            
            balls[i].vx += ax * dt;
            balls[i].vy += ay * dt;
        }
    
    // change coords
    for(var i = 0; i < balls.length; i++){
        balls[i].x += balls[i].vx * dt;
        balls[i].y += balls[i].vy * dt;
        checkBoundaries.call(balls[i]);
    }
    
    Draw();
}

function checkBoundaries() {
    if (this.x - 2 * this.r < 0) {
        this.vx = - this.vx;
        this.x = 2 * this.r;
    }
    if (this.x > WIDTH) {
        this.vx = - this.vx;
        this.x = WIDTH;
    }
    if (this.y - 2 * this.r < 0) {
        this.vy = - this.vy;
        this.y = 2 * this.r;
    }
    if (this.y > HEIGHT) {
        this.vy = - this.vy;
        this.y = HEIGHT;
    }
}

function solveCollision(ball_1, ball_2, d) {

    let normalX = ball_2.x - ball_1.x;
    let normalY = ball_2.y - ball_1.y;
    let normalizingCoef = Math.sqrt( normalX*normalX + normalY*normalY );

    let penetration = (d - normalizingCoef)/2;

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