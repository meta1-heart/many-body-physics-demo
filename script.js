var canvas, context;
var HEIGHT = window.innerHeight, WIDTH = window.innerWidth;
const PI =  Math.PI;
const gamma = 2.2;

var circle;
var speed = 0, fakeSpeed = 0;
var speedThreshold = 0.7;
var x = WIDTH * 0.5;
var y = HEIGHT * 0.5;
var r = 250;
var rotationLength = 0;
var dt = 1;
var mixing = {alpha:0.5};

var isPaused = false;

var anim;

class Circle 
{
    constructor( segments )
    {
        this.segments = segments;
        this.color1 =  "#BE0000";
        this.color2 =  "#00BE00";
        this.color3 =  "#0000BE";
        this.updateColors = function() {
            this.colors =  [this.color1, this.color2, this.color3];
        };
    }
    
}

document.addEventListener( "keydown", onKeyDown );
document.addEventListener( "DOMContentLoaded", start );

function onKeyDown( /*KeyDownEvent*/ e ) 
{

    if ( e.keyCode == 69 ) 
    { // E
        addSpeed();
    }
    if ( e.keyCode == 81 )
    { // Q
        decSpeed();
    }
    if ( e.keyCode == 80 ) 
    { // P
        pause();
    }
}

function pause() 
{
    if ( !isPaused ) 
    {
        cancelAnimationFrame( anim );
        isPaused = true;
    }
    else
    {
        main();
        isPaused = false;
    }
}

function addSpeed() 
{
    if ( speed > speedThreshold )
    {
        if( fakeSpeed < 1.05) fakeSpeed += 0.01;
        return;
    }
    else 
    {
        speed += 0.01;
        fakeSpeed = speed;
    }
}

function decSpeed() 
{
    if ( fakeSpeed > speedThreshold )
    {
        fakeSpeed -= 0.01;
        return;
    }
    else
    {
        speed -= 0.01;
        speed = Math.max( speed, 0 );
        fakeSpeed = speed;
    }
}

function start()
{
    prepareCanvas();
    circle = new Circle(3);
    setupGui(); 
    main();
}

function main() 
{
    circle.updateColors();
    Update();
    Draw();
    anim = requestAnimationFrame( main );
}

function prepareCanvas()
 {
    canvas = document.createElement( 'canvas' );
    canvas.height = HEIGHT;
    canvas.width = WIDTH;
    document.body.appendChild( canvas );
    context = canvas.getContext( "2d" );
}

function setupGui()
 {
    var gui = new dat.GUI();
    /*gui.add( circle, 'segments', 3, 99 )
        .name( "Segment amount" )
        .step( 3 );*/
    gui.addColor( circle, 'color1' ) ;
    gui.addColor( circle, 'color2' );
    gui.addColor( circle, 'color3' );
}

function Update() 
{
    rotationLength += speed * dt;   
}

function Draw() 
{
    // clear screen
    context.fillStyle = "#E0E0E0";
    context.fillRect( 0, 0, WIDTH, HEIGHT );

    // circles
    for ( let i = 0; i < circle.segments; i++ ) 
    {
        let startAngle = i * 2 * PI / circle.segments + rotationLength;
        let endAngle = ( i + 1 ) * 2 * PI / circle.segments + rotationLength;
        let j = i % 3;
        context.beginPath();

        context.fillStyle = circle.colors[j];
        context.strokeStyle = circle.colors[j];

        context.moveTo( x, y );
        context.arc( x, y, r, startAngle, endAngle );
        context.stroke();
        context.fill();

        context.closePath();
    }
    context.fillStyle = "#000000";
    context.font = "40px Arial bold";
    context.fillText( "norm rotation speed " + Math.round( speed * 100 ), WIDTH * 0.1, HEIGHT * 0.1  );
    context.fillText( "fake rotation speed " + Math.round( fakeSpeed * 100 ), WIDTH * 0.1, HEIGHT * 0.2 );
    context.fillText( "Use P to PAUSE", WIDTH * 0.1, HEIGHT * 0.4 );
    context.fillText( "E - Boost", WIDTH * 0.1, HEIGHT * 0.5 );
    context.fillText( "Q - Slow", WIDTH * 0.1, HEIGHT * 0.6 );
    //
    for ( let i = 0; i < 3; i++ )
    {
        drawMixedSegments( rotationLength + i * 2 * PI / 3, circle, i );
    }
}

function drawMixedSegments( rotationLength, circle, num )
{
    let startAngle = rotationLength - 0.01;
    let endAngle = startAngle + 2 * fakeSpeed;
    let partsAmount = 100;
    let deltaAngle = ( endAngle - startAngle ) / partsAmount;

    let rgbColorFirst = HEX2RGB( circle.colors[( ( num + 2 ) % 3)] );
    let rgbColorLast = HEX2RGB( circle.colors[num] );
    let deltaColor = [0, 0, 0];
    //
    for ( let i = 0; i < 3; i++ )
    {
        deltaColor[i] = ( rgbColorLast[i] - rgbColorFirst[i] ) / partsAmount;
    }
    //
    for ( let i = 0; i < partsAmount; i++ )
    {
        let newColor = [0, 0, 0];
        for (let j = 0; j < 3; j++)
        {
            newColor[j] = rgbColorFirst[j] + i * deltaColor[j]; 
        }

        context.beginPath();
        context.fillStyle = RGB2HEX( newColor );
        context.strokeStyle = RGB2HEX( newColor );
    
        context.moveTo(x, y);
        context.arc( x, y, r, startAngle + deltaAngle * i, startAngle + deltaAngle * ( i + 1 ) );
        context.stroke();
        context.fill();
        context.closePath();
    }
}

function mixColors( color1, color2, alpha )
{
    let rgb1 = HEX2RGB( color1 );
    let rgb2 = HEX2RGB( color2 );
    rgbRes = [0, 0, 0];
    //
    for ( let i = 0; i < 3; i++ )
    {
        rgbRes[i] = ( 1 - alpha ) * rgb1[i] + alpha * rgb2[i];
    }
    return RGB2HEX( rgbRes );
}

function RGB2HEX(rgb)
{
    let decimal = rgb[0] << 16 | ( rgb[1] << 8 & 0xFFFF ) | rgb[2];
    let hex = decimal.toString( 16 );
    hex = "000000".substring( 0, 6 - hex.length ) + hex;
    
    return '#' + hex.toUpperCase();
}

function HEX2RGB( hex )
{
    let decimal = parseInt( hex.substring( 1,7 ), 16 );

    let r = decimal >> 16;
    let g = ( decimal >> 8 ) & 0xFF;
    let b = decimal & 0xFF;

    return [r, g, b];
}
