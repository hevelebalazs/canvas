var canvas;
var context;
var coord;     /* coordinate/pixel ratio */
var tick = 10; /* milliseconds between two consecutive frames */
var timer = 0; /* reference to update timer */

var mousex = 0, mousey = 0;

var circle = {
    x: -5, y: 2,
    r: 1,
    tox: 0, toy: 0,   /* move target */
    angle: 0,         /* move angle */
    length: 0,        /* move distance */
    x1: 0, y1: 0,     /* helper points */
    tox1: 0, toy1: 0, /* helper points */
    hitx: 0, hity: 0, /* first hit point */
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
    
    /* draw first hit point */
    context.fillStyle = "FF0000"
    context.beginPath();
    context.arc(circle.hitx, circle.hity, circle.r, 0, 2 * Math.PI);
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
    
    /* HELP */
    
    /*context.fillStyle = "#0000ff";
    context.beginPath();
    context.beginPath();
    context.arc(circle.inx, circle.iny, circle.r, 0, 2 * Math.PI);
    context.fill();*/
    
    /* /HELP */
    
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

/* does the moving circle touch point (x, y)? */
function mcirclepoint(circle, x, y) {
    /* is it close to any endpoint? */
    var dist1 = distance(x, y, circle.x, circle.y);
    var dist2 = distance(x, y, circle.tox, circle.toy);
    
    if (dist1 < circle.r || dist2 < circle.r) return true;
    
    /* is it inside helper rectangle? */
    var isin = inrect(x, y, circle.x1, circle.y1, circle.tox1, circle.toy1, circle.tox2, circle.toy2, circle.x2, circle.y2);
    
    if (isin) return true;
    
    return false;
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
    
    circle.angle = Math.atan2(circle.toy - circle.y, circle.tox - circle.x);
    circle.length = distance(circle.x, circle.y, circle.tox, circle.toy);
    
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

function trianglearea(x1, y1, x2, y2, x3, y3) {
    var s1 = distance(x1, y1, x2, y2);
    var s2 = distance(x2, y2, x3, y3);
    var s3 = distance(x3, y3, x1, y1);
    var s = (s1 + s2 + s3) / 2;
    return Math.sqrt(s * (s - s1) * (s - s2) * (s - s3));
}

/* how much circle can move before hitting point (x, y)? */
/* if there is no collision, circle.length will be returned */
function pointdist(circle, x, y) {
    if (circle.length == 0.0) return 0.0;
    /* is there a collision? */
    var hit = mcirclepoint(circle, x, y);
    if (!hit) return circle.length;
    
    /* get distance from line segment */
    var area = trianglearea(x, y, circle.x, circle.y, circle.tox, circle.toy);
    var dist = 2 * area / circle.length;
    
    /* get end point distance from intersection point */
    var distend = Math.sqrt(circle.r * circle.r - dist * dist);
    
    /* get point of intersection with perpendicular line from point */
    var dir = direction(x, y, circle.x, circle.y, circle.tox, circle.toy);
    
    var angle;
    
    if (!dir) angle = circle.angle + Math.PI / 2;
    else angle = circle.angle - Math.PI / 2; 
    
    var inx = x + dist * Math.cos(angle);
    var iny = y + dist * Math.sin(angle);
    
    /* get intersection distance from circle start point */
    var godist = distance(circle.x, circle.y, inx, iny);
    godist -= distend;
    
    return godist;
}

/* returns determinant of the 2-by-2 matrix: */
/* | a b | */
/* | c d | */
function det(a, b, c, d) {
    return (a * d) - (b * c);
}   

/* intersection of two lines (x1, y1)->(x2, y2) and (x3, y3)->(x4, y4) */
function intersectionx(x1, y1, x2, y2, x3, y3, x4, y4) {
    var d1 = det(x1, y1, x2, y2);
    var d2 = det(x1,  1, x2,  1);
    var d3 = det(x3, y3, x4, y4);
    var d4 = det(x3,  1, x4,  1);
    var up = det(d1, d2, d3, d4);
    
    d1 = det(x1, 1, x2, 1);
    d2 = det(y1, 1, y2, 1);
    d3 = det(x3, 1, x4, 1);
    d4 = det(y3, 1, y4, 1);
    var down = det(d1, d2, d3, d4);
    
    if (down == 0.0) return 0.0;
    
    return up / down;
}

function intersectiony(x1, y1, x2, y2, x3, y3, x4, y4) {
    var d1 = det(x1, y1, x2, y2);
    var d2 = det(y1,  1, y2,  1);
    var d3 = det(x3, y3, x4, y4);
    var d4 = det(y3,  1, y4,  1);
    var up = det(d1, d2, d3, d4);
    
    d1 = det(x1, 1, x2, 1);
    d2 = det(y1, 1, y2, 1);
    d3 = det(x3, 1, x4, 1);
    d4 = det(y3, 1, y4, 1);
    var down = det(d1, d2, d3, d4);
    
    if (down == 0.0) return 0.0;
    return up / down;
}

/* does line exist on (x, y)? */
/* only border of line is checked, NO intersection */
function lineexist(line, x, y) {
    if (x < line.x1 && x < line.x2) return false;
    if (x > line.x1 && x > line.x2) return false;
    if (y < line.y1 && y < line.y2) return false;
    if (y > line.y1 && y > line.y2) return false;
    return true;
}

/* how much circle can move before hitting line? */
/* if there is no collision, circle.length will be returned */
function linedist(circle, line) {
    if (circle.length == 0.0) return 0.0;
    /* is there a collision? */
    var hit = mcircleline(circle, line);
    if (!hit) return circle.length;
    
    /* get intersection */
    var inx = intersectionx(circle.x, circle.y, circle.tox, circle.toy, line.x1, line.y1, line.x2, line.y2);
    var iny = intersectiony(circle.x, circle.y, circle.tox, circle.toy, line.x1, line.y1, line.x2, line.y2);
    
    /* HELP */
    
    circle.inx = inx;
    circle.iny = iny;
    
    /* /HELP */
    
    /* get circle start line distance from intersection */
    var dist = distance(circle.x, circle.y, inx, iny);
    
    /* get hit point distance from intersection point */
    var lineangle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
    var angle = lineangle - circle.angle;
    
    var sin = Math.sin(angle);
    if (sin < 0) sin = -sin;
    
    var disthit = circle.r / sin;
    
    dist -= disthit;
    
    /* check if line segment actually exists on the intersection point */
    var pointx = circle.x + dist * Math.cos(circle.angle);
    var pointy = circle.y + dist * Math.sin(circle.angle);
    
    var dir = direction(circle.x, circle.y, line.x1, line.y1, line.x2, line.y2);
    var addangle;
    if (dir) {
        addangle = lineangle - Math.PI / 2;
    } else {
        addangle = lineangle + Math.PI / 2;
    }
    
    pointx += circle.r * Math.cos(addangle);
    pointy += circle.r * Math.sin(addangle);
    
    if (!lineexist(line, pointx, pointy)) dist = circle.length;
    
    /* check line endpoints */
    var point1 = pointdist(circle, line.x1, line.y1);
    var point2 = pointdist(circle, line.x2, line.y2);
    
    if (point1 < dist) dist = point1;
    if (point2 < dist) dist = point2;
    
    return dist;
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
    
    var mindist = circle.length;
    
    /* find first colliding point */
    /*for (i = 0; i < lines.length; ++i) {
        var line = lines[i];
        
        var dist1 = pointdist(circle, line.x1, line.y1);
        if (dist1 < mindist) mindist = dist1;
        
        var dist2 = pointdist(circle, line.x2, line.y2);
        if (dist2 < mindist) mindist = dist2;
    }*/
    
    /* find first colliding line */
    for (i = 0; i < lines.length; ++i) {
        var line = lines[i];
        var dist = linedist(circle, line);
        
        if (dist < mindist) mindist = dist;
    }
    
    
    circle.hitx = circle.x + mindist * Math.cos(circle.angle);
    circle.hity = circle.y + mindist * Math.sin(circle.angle);
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