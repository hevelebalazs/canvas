var canvas;
var context;
var coord;     /* coordinate/pixel ratio */
var tick = 10; /* milliseconds between two consecutive frames */
var timer = 0; /* reference to update timer */

var mousex = 0, mousey = 0;

var circle = {
    x: 0, y: 5,
    r: 1,
    fx: 0, fy: 0, /* move force */
    speed: 5,     /* coords per second */
    angles: []
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
    
    /* draw circle */
    context.fillStyle = "#964B00";
    context.beginPath();
    context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
    context.fill();
    
    /* draw small circles */
    context.fillStyle = "#853A00";
    var i;
    for (i = 0; i < circle.angles.length; ++i) {
        var angle = circle.angles[i];
        var x = circle.x + circle.r * Math.cos(angle);
        var y = circle.y + circle.r * Math.sin(angle);
        context.beginPath();
        context.arc(x, y, circle.r / 3, 0, 2 * Math.PI);
        context.fill();
    }
    
    /* draw lines */
    for (i = 0; i < lines.length; ++i) {
        var line = lines[i];
        
        if (line.touch) context.strokeStyle = "#FF0000";
        else context.strokeStyle = "#000000";
        
        context.beginPath();
        context.lineWidth = 2 / coord;
        context.moveTo(line.x1, line.y1);
        context.lineTo(line.x2, line.y2);
        context.stroke();
    }
    
    context.restore();
}

function distance(x1, y1, x2, y2) {
    var distx = x1 - x2;
    var disty = y1 - y2;
    var dist2 = (distx * distx) + (disty * disty);
    return Math.sqrt(dist2);
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

/* get the length of the part of the force (x1, y1) that is parallel to angle */
function parallel(x1, y1, angle) {
    var len = distance(0, 0, x1, y1);
    var angle1 = Math.atan2(y1, x1);
    var angledist = angle1 - angle;
    return len * Math.cos(angledist);
}

/* get the length of the part of the force (x1, y1) that is perpendicular to angle */
function perpendicular(x1, y1, angle) {
    var len = distance(0, 0, x1, y1);
    var angle1 = Math.atan2(y1, x1);
    var angledist = angle1 - angle;
    return len * Math.sin(angledist);
}

/* get the distance of two angles between 0 and 2 * Math.PI */
function angledistance(angle1, angle2) {
    var dist = angle2 - angle1;
    while (dist < 0) dist += 2 * Math.PI;
    while (dist > 2 * Math.PI) dist -= 2 * Math.PI;
    return dist;
}


/* does the circle touch the side of the line? */
function sidecollision(circle, line) {
    /* line */
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

/* push only angles that are not opposite to circle.angle */
function pushangle(circle, angle) {
    if (circle.angles.indexOf(angle) != -1) {
        /* no duplicates */
        return;
    }
    circle.angles.push(angle);
}

function update() {
    /* face towards mouse */
    var distx = mousex - circle.x;
    var disty = mousey - circle.y;
    circle.angle = Math.atan2(disty, distx);
    
    circle.fx = circle.speed * Math.cos(circle.angle);
    circle.fy = circle.speed * Math.sin(circle.angle);
    
    var oldx = circle.x;
    var oldy = circle.y;
    
    /* move */
    var addx = circle.fx * (tick / 1000);
    var addy = circle.fy * (tick / 1000);
    
    circle.x += addx;
    circle.y += addy;
    
    /* check for collisions */
    circle.angles = []; /* collision angles */
    var i;
    for (i = 0; i < lines.length; ++i) {
        var line = lines[i];
        /* side collision */
        line.touch = sidecollision(circle, line);
        if (line.touch) {
            /* get line angle */
            var angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
            /* swap angle if the circle on the other side */
            var dir = direction(line.x1, line.y1, line.x2, line.y2, circle.x, circle.y);
            if (dir) pushangle(circle, angle - Math.PI / 2);
            else     pushangle(circle, angle + Math.PI / 2);
        } else {
            /* point collisions */
            /* point 1 */
            var dist1 = distance(circle.x, circle.y, line.x1, line.y1);
            if (dist1 < circle.r) {
                line.touch = true;
                var angle = Math.atan2(line.y1 - circle.y, line.x1 - circle.x);
                pushangle(circle, angle);
            }
            /* point 2 */
            var dist2 = distance(circle.x, circle.y, line.x2, line.y2);
            if (dist2 < circle.r) {
                line.touch = true;
                var angle = Math.atan2(line.y2 - circle.y, line.x2 - circle.x);
                pushangle(circle, angle);
            }
        }
    }
    
    /* clear all angles if all oppose circle.angle */
    var alloppose = true;
    var i;
    for (i = 0; i < circle.angles.length; ++i) {
        var angle = circle.angles[i];
        var dist = angledistance(angle, circle.angle);
        if (Math.cos(dist) > 0) alloppose = false;
    }
    
    if (alloppose) circle.angles = [];
    
    if (circle.angles.length == 0) {
        /* no changes */
    } else if (circle.angles.length == 1) {
        /* move parallel to angle */
        var angle = circle.angles[0] + Math.PI / 2;
        var length = parallel(addx, addy, angle);
        addx = length * Math.cos(angle);
        addy = length * Math.sin(angle);
    } else {
        /* get left and right */
        var left, right;
        var minleftd, minrightd; /* left and right distance */
        var i;
        for (i = 0; i < circle.angles.length; ++i) {
            var anglei = circle.angles[i];
            leftd = angledistance(anglei, circle.angle);
            rightd = angledistance(circle.angle, anglei);
            
            if (i == 0 || leftd < minleftd) {
                minleftd = leftd;
                left = anglei;
            }
            if (i == 0 || rightd < minrightd) {
                minrightd = rightd;
                right = anglei;
            }
        }
        var dist = angledistance(left, right);
        if (dist < Math.PI) {
            /* no movement */
            addx = 0;
            addy = 0;
        } else {
            var closest;
            if (minleftd < minrightd) closest = left;
            else closest = right;
            closest -= Math.PI / 2;
            /* calculate parallel force */
            var length = parallel(addx, addy, closest);
            addx = length * Math.cos(closest);
            addy = length * Math.sin(closest);
        }
    }
    
    /* move back */
    circle.x = oldx;
    circle.y = oldy;
    /* move forward */
    circle.x += addx;
    circle.y += addy;

    draw();

    timer = setTimeout(update, tick);
}

/* pause and continue */
function pause() {
    if (timer == 0) {
        /* continue */
        update();
    } else {
        /* pause */
        window.clearTimeout(timer);
        timer = 0;
    }
}

function mousemove(event) {
    /* save mouse coordinates */
    mousex = event.clientX;
    mousey = event.clientY;
    
    /* transform from pixel to coordinates */
    mousex = (mousex - canvas.width / 2) / coord;
    mousey = (mousey - canvas.height / 2) / coord;
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
window.onmouseup = mousemove;
window.onmousedown = mousemove;
window.onclick = pause;