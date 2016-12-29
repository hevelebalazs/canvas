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

function distance(x1, y1, x2, y2) {
	var dx = x1 - x2;
	var dy = y1 - y2;
	return Math.sqrt(dx * dx + dy * dy);
}

/* does (x2, y2) -> (x3, y3) turn right to (x1, y1) -> (x2, y2)? */
function direction(x1, y1, x2, y2, x3, y3) {
    var dx1 = x2 - x1;
    var dy1 = y2 - y1;
    var dx2 = x3 - x2;
    var dy2 = y3 - y2;
    /* calculate
        | dx1 dx2 | 
        | dy1 dy2 |
    */
    var det = dx1 * dy2 - dx2 * dy1;
    return (det > 0);
}

/* does the static circle touch the line? */
function circleline(circle, line) {
	/* point distance */
	var dist1 = distance(circle.x, circle.y, line.x1, line.y1);
	var dist2 = distance(circle.x, circle.y, line.x2, line.y2);
	
	if (dist1 < circle.r || dist2 < circle.r) return true;
	
	/* side collision */
    var distx = line.x1 - line.x2;
    var disty = line.y1 - line.y2;
    var angle = Math.atan2(disty, distx);
    /* point 1 */
    var angle1 = angle + Math.PI / 2;
    var x1 = circle.x + circle.r * Math.cos(angle1);
    var y1 = circle.y + circle.r * Math.sin(angle1);
    /* point 2 */
    var angle2 = angle - Math.PI / 2;
    var x2 = circle.x + circle.r * Math.cos(angle2);
    var y2 = circle.y + circle.r * Math.sin(angle2);
    
    var dir1 = direction(x1, y1, x2, y2, line.x1, line.y1);
    var dir2 = direction(x1, y1, x2, y2, line.x2, line.y2);
    
    var dir3 = direction(x1, y1, line.x1, line.y1, line.x2, line.y2);
    var dir4 = direction(x2, y2, line.x1, line.y1, line.x2, line.y2);
    
    if (dir1 != dir2 && dir3 != dir4) return true;
    
    return false;
}

/* does line (x11, y11)->(x12, y12) cross line (x21, y21)->(x22, y22)? */
function linecross(x11, y11, x12, y12, x21, y21, x22, y22) {
	var dir1 = direction(x11, y11, x21, y21, x22, y22);
	var dir2 = direction(x12, y12, x21, y21, x22, y22);
	if (dir1 == dir2) return false;
	
	var dir3 = direction(x21, y21, x11, y11, x12, y12);
	var dir4 = direction(x22, y22, x11, y11, x12, y12);
	if (dir3 == dir4) return false;
	
	return true;
}

/* is point (x, y) inside rectangle (x1, y1) (x2, y2) (x3, y3) (x4, y4)? */
function inrect(x, y, x1, y1, x2, y2, x3, y3, x4, y4) {
	var dir1 = direction(x, y, x1, y1, x2, y2);
	var dir2 = direction(x, y, x2, y2, x3, y3);
	var dir3 = direction(x, y, x3, y3, x4, y4);
	var dir4 = direction(x, y, x4, y4, x1, y1);
	
	return (dir1 == dir2) && (dir2 == dir3) && (dir3 == dir4);
}

/* does the moving circle touch the line? */
function mcircleline(circle, line) {
	/* do end circles touch the line? */
	var touch1 = circleline({x: circle.x,   y: circle.y,   r: circle.r}, line);
	var touch2 = circleline({x: circle.tox, y: circle.toy, r: circle.r}, line);
	
	if (touch1 || touch2) return true;
	
	/* does line cross any helper line? */
	var cross1 = linecross(line.x1, line.y1, line.x2, line.y2, circle.x1, circle.y1, circle.tox1, circle.toy1);
	var cross2 = linecross(line.x1, line.y1, line.x2, line.y2, circle.x2, circle.y2, circle.tox2, circle.toy2);
	
	if (cross1 || cross2) return true;
	
	/* is any line point inside helper rectangle? */
	var in1 = inrect(line.x1, line.y1, circle.x1, circle.y1, circle.tox1, circle.toy1, circle.tox2, circle.toy2, circle.x2, circle.y2);
	var in2 = inrect(line.x2, line.y2, circle.x1, circle.y1, circle.tox1, circle.toy1, circle.tox2, circle.toy2, circle.x2, circle.y2);
	
	if (in1 || in2) return true;
	
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
		lines[i].touch = mcircleline(circle, line);
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