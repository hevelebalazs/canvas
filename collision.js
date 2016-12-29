var canvas;
var context;
var coord;     /* coordinate/pixel ratio */
var tick = 10; /* milliseconds between two consecutive frames */
var timer = 0; /* reference to update timer */

var mousex = 0, mousey = 0;

var circle = {
    x: 0, y: 0,
    r: 1
};

function draw() {
    /* fill canvas */
    context.fillStyle = "#FFFFCC";
    context.rect(0, 0, canvas.width, canvas.height);
    context.fill();
    
    /* init transformations */
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(coord, coord);
	
		
	/* draw joining lines */
	context.strokeStyle = "#cb8080";
	context.lineWidth = 2 * circle.r;
	
	context.beginPath();
	context.moveTo(circle.x, circle.y);
	context.lineTo(mousex, mousey);
	context.stroke();

	/* draw circle at mouse */
	context.fillStyle = "#cb8080";
	context.beginPath();
	context.arc(mousex, mousey, circle.r, 0, 2 * Math.PI);
	context.fill();
	
	/* draw circle */
	context.fillStyle = "#960000";
	context.beginPath();
	context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
	context.fill();
	
	context.restore();
}

function update() {
	draw();
	
	timer = setTimeout(update, tick);
}

function mousemove(event) {
    /* save mouse coordinates */
    mousex = event.clientX;
    mousey = event.clientY;
    
    /* transform from pixel to coordinates */
    mousex = (mousex - canvas.width / 2) / coord;
    mousey = (mousey - canvas.height / 2) / coord;
}

function mouseclick() {
	circle.x = mousex;
	circle.y = mousey;
}

/* window resize */
function resize() {
    /* resize canvas */
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    /* calculate coord ratio */
    var minsize;
    if (canvas.width < canvas.height) {
        minsize = canvas.width;
    } else {
        minsize = canvas.height;
    }
    coord = minsize / 20;
    
    draw();
}

function init() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext("2d");
    
    /* init canvas coordinates */
    resize();
	
	update();
}

window.onload = init;
window.onresize = resize;
window.onmousemove = mousemove;
window.onmouseup = mouseclick;