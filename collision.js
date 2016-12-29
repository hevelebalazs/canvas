var canvas;
var context;
var coord;     /* coordinate/pixel ratio */
var tick = 10; /* milliseconds between two consecutive frames */
var timer = 0; /* reference to update timer */

var mousex = 0, mousey = 0;

var circle = {
    x: 0, y: 0,
	r: 1,
	tox: 0, toy: 0,   /* move target */
	angle: 0,         /* move angle */
	x1: 0, y1: 0,     /* helper points */
	tox1: 0, toy1: 0, /* helper points */
};

var lines = [{ x1:  -5, y1: -1, x2:  5, y2:  1 },
             { x1:   5, y1: .5, x2:  0, y2: -3 },
             { x1: -10, y1: -5, x2: -5, y2:  0 }
            ];

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
	/*context.strokeStyle = "#cb8080";
	context.lineWidth = 2 * circle.r;
	
	context.beginPath();
	context.moveTo(circle.x, circle.y);
	context.lineTo(circle.tox, circle.toy);
	context.stroke();*/
	
	context.fillStyle = "#cb8080";
	context.beginPath();
	context.moveTo(circle.x1, circle.y1);
	context.lineTo(circle.x2, circle.y2);
	context.lineTo(circle.tox2, circle.toy2);
	context.lineTo(circle.tox1, circle.toy1);
	context.fill();

	/* draw circle at mouse */
	context.fillStyle = "#cb8080";
	context.beginPath();
	context.arc(circle.tox, circle.toy, circle.r, 0, 2 * Math.PI);
	context.fill();
	
	/* draw circle */
	context.fillStyle = "#960000";
	context.beginPath();
	context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
	context.fill();
	
	/* draw lines */
	context.lineWidth = 2 / coord;
	var i;
	for (i = 0; i < lines.length; ++i) {
		var line = lines[i];
		
		if (typeof line.touch != undefined && line.touch == true) {
			context.strokeStyle = "#FF0000";
		} else {
			context.strokeStyle = "#000000";
		}
		
		
		context.beginPath();
		context.moveTo(line.x1, line.y1);
		context.lineTo(line.x2, line.y2);
		context.stroke();
	}
	
	context.restore();
}

function update() {
	draw();
	
	timer = setTimeout(update, tick);
}

/* does the moving circle touch the line? */
function linetouch(circle, line) {
	return false;
}

/* init circle to move to (x, y) */
function initto(circle, x, y) {
	circle.tox = x;
	circle.toy = y;
	
	if (x == 0 && y == 0) return;
	
	circle.angle = Math.atan2(circle.y - circle.toy, circle.x - circle.tox);
	
	/* helper points */
	var angle = circle.angle + Math.PI / 2;
	var dx = circle.r * Math.cos(angle);
	var dy = circle.r * Math.sin(angle);
	
	circle.x1 = circle.x + dx;
	circle.y1 = circle.y + dy;
	circle.x2 = circle.x - dx;
	circle.y2 = circle.y - dy;
	
	circle.tox1 = circle.tox + dx;
	circle.toy1 = circle.toy + dy;
	circle.tox2 = circle.tox - dx;
	circle.toy2 = circle.toy - dy;
}

function mousemove(event) {
    /* save mouse coordinates */
    mousex = event.clientX;
    mousey = event.clientY;
    
    /* transform from pixel to coordinates */
    mousex = (mousex - canvas.width / 2) / coord;
    mousey = (mousey - canvas.height / 2) / coord;
	
	initto(circle, mousex, mousey);
	
	/* check line collisions */
	var i;
	for (i = 0; i < lines.length; ++i) {
		var line = lines[i];
		lines[i].touch = linetouch(circle, line);
	}
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