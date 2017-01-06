var canvas;
var context;
var coord;     /* coordinate/pixel ratio */
var tick = 10; /* milliseconds between two consecutive frames */
var timer = 0; /* reference to update timer */

var mousex = 0, mousey = 0;

var circle = {
    x: -5, y: 2,
    r: 1,
    action: "nothing",
    movedist: 0,      /* how much circle moves */
    /* move */
    line: 0,          /* touching line */
    line2: 0,         /* second touching line */
    tox: 0, toy: 0,   /* move target */
    x1: 0, y1: 0,     /* helper points */
    tox1: 0, toy1: 0, /* helper points */
    hitx: 0, hity: 0, /* first hit point */
    angle: 0,         /* move angle */
    length: 0,        /* move distance */
    /* rotate */
    point: 0,         /* rotation point */
    point2 : 0,       /* second touching point */
    rotx: 0, roty: 0, /* center after rotation */
    rotdist: 0        /* rotation distance */
};

var last;

var timer;
var tick = 10;

var speed = 5;

var lines = [{ x1:  -5, y1: -1,  x2:  5, y2:  1 },
             { x1:   5, y1:  1,  x2:  0, y2: -3 },
             { x1: -10, y1: -5,  x2: -5, y2:  0 },
             { x1:  -5, y1:  5,  x2:  5, y2:  6 },
             { x1:  -5, y1:  6,  x2:  5, y2:  7 }
            ];
            
function fillcircle(circle) {
    context.fillStyle = "#00cc00"
    context.strokeStyle = "#00cc00";
    var padding = 2 / coord;
    
    if (circle.action == "move") {
        /* draw connecting line */     
        context.lineWidth = 2 * circle.r + 2 * padding;
        context.beginPath();
        context.moveTo(circle.x, circle.y);
        context.lineTo(circle.hitx, circle.hity);
        context.stroke();
        
        /* draw first hit point */
        context.beginPath();
        context.arc(circle.hitx, circle.hity, circle.r + padding, 0, 2 * Math.PI);
        context.fill();
    }
    if (circle.action == "rotate") {
        /* draw connecting arc */
        context.beginPath();
        
        if (!circle.clockwise) {
            context.arc(circle.point.x, circle.point.y, 2 * circle.r + padding, circle.pointangle, circle.rotangle);
        } else {
            context.arc(circle.point.x, circle.point.y, 2 * circle.r + padding, circle.rotangle, circle.pointangle);
        }
        context.fill();
        
        /* draw final circle */
        context.beginPath();
        context.arc(circle.rotx, circle.roty, circle.r + padding, 0, 2 * Math.PI);
        context.fill();
    }
    
    /* draw circle */
    context.beginPath();
    context.arc(circle.x, circle.y, circle.r + padding, 0, 2 * Math.PI);
    context.fill();
}
            
function drawcircle(circle) {
    context.fillStyle = "#39ff14"
    context.strokeStyle = "#39ff14";
    
    /* draw circle */
    context.beginPath();
    context.arc(circle.x, circle.y, circle.r, 0, 2 * Math.PI);
    context.fill();
}

function draw() {
    context.restore();
    /* fill canvas */
    context.fillStyle = "#FFFFCC";
    context.rect(0, 0, canvas.width, canvas.height);
    context.fill();
    
    /* init transformations */
    context.save();
    context.translate(canvas.width / 2, canvas.height / 2);
    context.scale(coord, coord);
    
    /* draw circle */
    fillcircle(circle);
    drawcircle(circle);
    
    /* draw lines */
    context.lineWidth = 2 / coord;
    for (i = 0; i < lines.length; ++i) {
        var line = lines[i];

        context.strokeStyle = "#000000";
        context.beginPath();
        context.moveTo(line.x1, line.y1);
        context.lineTo(line.x2, line.y2);
        context.stroke();
    }
}

/* do lines equal? */
function lineequal(l1, l2) {
    return (l1.x1 == l2.x1 && l1.x2 == l2.x2 && l1.y1 == l2.y1 && l1.y2 == l2.y2);
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

/* get the distance of two angles between 0 and 2 * Math.PI */
function angledistance(angle1, angle2) {
    var dist = angle2 - angle1;
    while (dist < 0) dist += 2 * Math.PI;
    while (dist > 2 * Math.PI) dist -= 2 * Math.PI;
    return dist;
}

/* get the length of the part of the force (x1, y1) that is parallel to angle */
function parallel(x1, y1, angle) {
    var len = distance(0, 0, x1, y1);
    var angle1 = Math.atan2(y1, x1);
    var angledist = angle1 - angle;
    return len * Math.cos(angledist);
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
/* only border box of line is checked, NO intersection */
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
    
    /* get circle start line distance from intersection */
    var dist = distance(circle.x, circle.y, inx, iny);
    
    /* get hit point distance from intersection point */
    var lineangle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
    var angle = lineangle - circle.angle;
    
    var sin = Math.sin(angle);
    if (sin < 0) sin = -sin;
    
    var disthit = circle.r / sin;
    
    dist -= disthit;
    
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
    
    /* check if line segment actually exists on the intersection point */
    if (!lineexist(line, pointx, pointy)) return circle.length;
    
    /* check line endpoints */
    var point1 = pointdist(circle, line.x1, line.y1);
    var point2 = pointdist(circle, line.x2, line.y2);
    
    if (point1 <= dist) dist = circle.length;
    if (point2 <= dist) dist = circle.length;
    if (dist < 0) dist = 0;
    
    return dist;
}

/* move "circle" by force or until first obstacle */
function moveto(circle, angle, length) {
    /* init movement */
    circle.tox = circle.x + length * Math.cos(angle);
    circle.toy = circle.y + length * Math.sin(angle);
    
    if (circle.tox == circle.x && circle.toy == circle.y) return;
    
    circle.angle = angle;
    circle.length = length;
    
    var endx, endy;
    var enddist;
    var alongline = false;
    var movex = 1;
    /* is it touching a line? */
    if (circle.line != 0) {
        var line = circle.line;
        /* get collision angle */
        var lineangle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
        var angle;
        var dir = direction(line.x1, line.y1, line.x2, line.y2, circle.x, circle.y);
        if (dir) angle = lineangle - Math.PI / 2;
        else angle = lineangle + Math.PI / 2;
        
        /* does it oppose move angle? */
        var dist = angledistance(circle.angle, angle);
        
        alongline = (Math.cos(dist) > 0);
        
        if (alongline) {
            /* if not, move along the line */
            var length = parallel(circle.tox - circle.x, circle.toy - circle.y, lineangle);
            
            /* calculate maximum length */
            if (length < 0) {
                endx = line.x1;
                endy = line.y1;
            } else {
                endx = line.x2;
                endy = line.y2;
            }
            
            if (length < 0) {
                length = -length;
                lineangle = lineangle + Math.PI;
            }
            
            /* calculate intersection distance from end point */
            var inx = circle.x + circle.r * Math.cos(angle);
            var iny = circle.y + circle.r * Math.sin(angle);
            
            enddist = distance(inx, iny, endx, endy);
            
            if (enddist < length) length = enddist;
            
            /* update circle movement angle and distance  */
            var dist = angledistance(lineangle, circle.angle);
            var mult = Math.cos(dist);
            if (mult != 0) movex = Math.abs(1 / mult);
            
            circle.angle = lineangle;
            circle.length = length;
            circle.tox = circle.x + length * Math.cos(lineangle);
            circle.toy = circle.y + length * Math.sin(lineangle);
        } else {
            console.log("OPPOSE");
        }
    }
    
    /* calculate helper points */
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
    
    /* find closest obstacle */
    var mindist = circle.length;
    
    /* find first colliding point */
    var minpoint = 0;
    
    for (i = 0; i < lines.length; ++i) {
        var line = lines[i];
        
        var dist1 = pointdist(circle, line.x1, line.y1);
        /* is circle already touching this? */
        var touch1 = (circle.point != 0) && (circle.point.x == line.x1) && (circle.point.y == line.y1);
        touch1 |= (circle.point2 != 0) && (circle.point2.x == line.x1) && (circle.point2.y == line.y1);
        touch1 |= (alongline) && (endx == line.x1) && (endy == line.y1);
        
        if (!touch1 && dist1 < mindist) {
            mindist = dist1;
            minpoint = {x: line.x1, y: line.y1};
        }
        
        var dist2 = pointdist(circle, line.x2, line.y2);
        /* is circle already touching this? */
        var touch2 = (circle.point != 0) && (circle.point.x == line.x2) && (circle.point.y == line.y2);
        touch2 |= (circle.point2 != 0) && (circle.point2.x == line.x2) && (circle.point2.y == line.y2);
        touch2 |= (alongline) && (endx == line.x2) && (endy == line.y2);
        
        if (!touch2 && dist2 < mindist) {
            mindist = dist2;
            minpoint = {x: line.x2, y: line.y2};
        }
    }
    
    /* find first colliding line */
    var minline = 0;
    
    for (i = 0; i < lines.length; ++i) {
        var line = lines[i];
        if (lineequal(line, circle.line)) {
            /* skip touching line */
            continue;
        }
        
        if (lineequal(line, circle.line2)) {
            /* skip second line */
            continue;
        }
        
        var dist = linedist(circle, line);
        
        if (dist < mindist) {
            mindist = dist;
            minline = line;
            minpoint = 0;
        }
    }
    
    circle.action = "move";
    
    circle.hitx = circle.x + mindist * Math.cos(circle.angle);
    circle.hity = circle.y + mindist * Math.sin(circle.angle);
    
    /* update state */
    if (!alongline) {
        circle.line   = minline;
        circle.line2  = 0;
        circle.point  = minpoint;
        circle.point2 = 0;
    } else {
        if (mindist == enddist) {
            /* reached end of line */
            circle.line   = 0;
            circle.line2  = circle.line;
            circle.point  = {x: endx, y: endy};
            circle.point2 = 0;
        } else {
            circle.line   = circle.line;
            circle.line2  = minline;
            circle.point  = minpoint;
            circle.point2 = 0;
        }
    }
    
    circle.movedist = movex * distance(circle.x, circle.y, circle.hitx, circle.hity);
    
    circle.x = circle.hitx;
    circle.y = circle.hity;
}

/* get how much circle can rotate before colliding with point (x, y) */
/* if no such collision, circle.rotdist will be returned */
function pointrot(circle, x, y) {
    /* are points close enough? */
    var point = circle.point;
    
    /* skip same point */
    if (point.x == x && point.y == y) return circle.rotdist;
    
    if (circle.point2) {
        var point2 = circle.point2;
        
        /* skip second point */
        if (point2.x == x && point2.y == y) return circle.rotdist;
    }
    
    var dist = distance(x, y, point.x, point.y);
    
    if (dist > 2 * circle.r) return circle.rotdist;
    
    /* get angle at collision */
    var centerx = (x + point.x) / 2;
    var centery = (y + point.y) / 2;
    
    var angle = Math.atan2(y - point.y, x - point.x) + Math.PI / 2;
    
    var side1 = distance(x, y, centerx, centery);
    var side = Math.sqrt(circle.r * circle.r - side1 * side1);
    
    var dx = side * Math.cos(angle);
    var dy = side * Math.sin(angle);
    
    var x1 = centerx + dx;
    var y1 = centery + dy;
    var angle1 = Math.atan2(y1 - point.y, x1 - point.x);
    
    var x2 = centerx - dx;
    var y2 = centery - dy;
    var angle2 = Math.atan2(y2 - point.y, x2 - point.x);
    
    var dist1, dist2;
    if (circle.clockwise) {
        dist1 = angledistance(angle1, circle.pointangle);
        dist2 = angledistance(angle2, circle.pointangle);
    } else {
        dist1 = angledistance(circle.pointangle, angle1);
        dist2 = angledistance(circle.pointangle, angle2);
    }
    
    if (dist1 < dist2) return dist1;
    else return dist2;
}

/* get how much circle can rotate before colliding with line */
/* if no such collision, circle.rotdist will be returned */
function linerot(circle, line) {
    /* get circle distance from line */
    var point = circle.point;
    
    var area = trianglearea(point.x, point.y, line.x1, line.y1, line.x2, line.y2);
    var linelen = distance(line.x1, line.y1, line.x2, line.y2);
    var dist = 2 * area / linelen;
    
    /* no collision if too far away */
    if (dist > 2 * circle.r) return circle.rotdist;
    
    /* get intersection point */
    var lineangle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
    var dir = direction(point.x, point.y, line.x1, line.y1, line.x2, line.y2);
    
    var angle;
    
    if (!dir) angle = lineangle + Math.PI / 2;
    else angle = lineangle - Math.PI / 2; 
    
    var inx = point.x + dist * Math.cos(angle);
    var iny = point.y + dist * Math.sin(angle);
    
    /* calculate center of circle on collision */
    var side1 = Math.abs(dist - circle.r);
    var side2 = Math.sqrt(circle.r * circle.r - side1 * side1);
    
    var dx = side2 * Math.cos(lineangle);
    var dy = side2 * Math.sin(lineangle);
    
    var dx1 = circle.r * Math.cos(angle);
    var dy1 = circle.r * Math.sin(angle);
        
    var angle2 = Math.atan2(y2 - point.y, x2 - point.x);
    var angle1 = Math.atan2(y1 - point.y, x1 - point.x);
    
    var x1 = inx + dx;
    var y1 = iny + dy;
    var angle1;
    
    if (!lineexist(line, x1, y1)) angle1 = circle.rotangle;
    else {
        x1 -= dx1;
        y1 -= dy1;
        angle1 = Math.atan2(y1 - point.y, x1 - point.x);
    }
    
    var x2 = inx - dx;
    var y2 = iny - dy;
    var angle2;
    
    if (!lineexist(line, x2, y2)) angle2 = circle.rotangle;
    else {
        x2 -= dx1;
        y2 -= dy1;
        angle2 = Math.atan2(y2 - point.y, x2 - point.x);
    }
    
    if (line.x1 == point.x && line.y1 == point.y) {
        /* endpoint 1 */
        var angle;
        if (circle.clockwise) angle = lineangle + Math.PI / 2;
        else angle = lineangle - Math.PI / 2;
        
        var dist = angledistabs(circle.pointangle, angle);
        
        return Math.min(circle.rotdist, dist);
    }
    
    if (line.x2 == point.x && line.y2 == point.y) {
        /* endpoint 2 */
        var angle;
        if (circle.clockwise) angle = lineangle - Math.PI / 2;
        else angle = lineangle + Math.PI / 2;
        
        var dist = angledistabs(circle.pointangle, angle);
        
        return Math.min(circle.rotdist, dist);
    }
    
    /* find closest of two angles */
    var dist1, dist2;
    if (circle.clockwise) {
        dist1 = angledistance(angle1, circle.pointangle);
        dist2 = angledistance(angle2, circle.pointangle);
    } else {
        dist1 = angledistance(circle.pointangle, angle1);
        dist2 = angledistance(circle.pointangle, angle2);
    }
    
    return Math.min(dist1, dist2, circle.rotdist);
}

/* rotate circle until it faces vector or touches first obstacle */
/* does not actually move circle, but updates rotation values */
function rotateto(circle, angle, length) {
    var point = circle.point;

    var pointangle = Math.atan2(circle.y - point.y, circle.x - point.x);
    var moveangle = angle;
    var movedist = length;
    
    var dist = angledistance(moveangle, pointangle);
    var rotangle;
    
    if (Math.sin(dist) > 0) {
        rotangle = moveangle + Math.PI / 2;
    } else {
        rotangle = moveangle - Math.PI / 2;
    }
    
    circle.pointangle = pointangle;
    circle.rotangle = rotangle;

    /* going away from point? */
    dist = angledistance(moveangle, pointangle);
    
    if (Math.cos(dist) > 0) {
        moveto(circle, moveangle, movedist);
        return;
    }
    
    /* which direction to rotate? */
    rotdist = angledistance(pointangle, rotangle);
    
    var clockwise = (dist <= Math.PI);
    circle.clockwise = clockwise;
    
    circle.action = "rotate";
    
    var mindist;
    /* find closest obstacle */
    if (!clockwise) mindist = angledistance(pointangle, rotangle);
    else mindist = angledistance(rotangle, pointangle);
    
    /* distance to go */
    var godist = mindist;
    
    var arc = mindist * circle.r;
   
    if (arc == 0.0) return 0.0;
    if (movedist < arc) circle.rotdist = movedist / circle.r;
    else circle.rotdist = mindist;
    
    mindist = circle.rotdist;
    
    /* find first colliding point */
    var minpoint = 0;
    var i;
    for (i = 0; i < lines.length; ++i) {
        var line = lines[i];
        
        /* point 1 */
        var dist1 = pointrot(circle, line.x1, line.y1);
        if (dist1 < mindist) {
            mindist = dist1;
            minpoint = {x: line.x1, y: line.y1};
        }
        
        /* point 2 */
        var dist2 = pointrot(circle, line.x2, line.y2);
        if (dist2 < mindist) {
            mindist = dist2;
            minpoint = {x: line.x2, y: line.y2};
        }
    }
    
    /* find first colliding line */
    var minline = 0;
    for (i = 0; i < lines.length; ++i) {
        var line = lines[i];
        
        if (lineequal(line, circle.line2)) {
            /* skip second line */
            continue;
        }
        
        var dist = linerot(circle, line);
        if (dist < mindist) {
            mindist = dist;
            minline = line;
            minpoint = 0;
        }
    }
    
    if (godist == mindist) {
        /* full rotation */
        circle.line   = 0;
        circle.line2  = 0;
        circle.point  = 0;
        circle.point2 = point;
    } else if (minline == 0) {
        /* second point collision  */
        circle.line   = 0;
        circle.line2  = 0;
        circle.point  = point;
        circle.point2 = minpoint;
    } else {
        var line = minline;
        var endpoint = (line.x1 == point.x) && (line.y1 == point.y);
        endpoint |= (line.x2 == point.x) && (line.y2 == point.y);
        if (endpoint) {
            circle.line   = minline;
            circle.line2  = 0;
            circle.point  = 0;
            circle.point2 = point;
        } else {
            circle.line   = minline;
            circle.line2  = 0;
            circle.point  = point;
            circle.point2 = 0;
        }
    }
    
    if (clockwise) {
        circle.rotangle = pointangle - mindist;
    } else {
        circle.rotangle = pointangle + mindist;
    }
    
    circle.rotx = point.x + circle.r * Math.cos(circle.rotangle);
    circle.roty = point.y + circle.r * Math.sin(circle.rotangle);
    
    circle.movedist = 2 * mindist * circle.r * circle.r;
    
    circle.x = circle.rotx;
    circle.y = circle.roty;
}

function circlepointangle(circle, point) {
    var angle = Math.atan2(point.y - circle.y, point.x - circle.x);
    return angle;
}

function circlelineangle(circle, line) {
    var lineangle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
    var angle;
    var dir = direction(line.x1, line.y1, line.x2, line.y2, circle.x, circle.y);
    if (dir) angle = lineangle - Math.PI / 2;
    else angle = lineangle + Math.PI / 2;
    
    return angle;
}

/* is (angle1 -> angle -> angle2) arc smaller than a half circle? */
function between(angle1, angle, angle2) {
    var arc1 = angledistance(angle1, angle) + angledistance(angle, angle2);
    var arc2 = angledistance(angle, angle1) + angledistance(angle2, angle);
    
    return (arc1 < Math.PI) || (arc2 < Math.PI);
}

function angledistabs(angle1, angle2) {
    var dist1 = angledistance(angle1, angle2);
    var dist2 = angledistance(angle2, angle1);
    
    return (dist1 < dist2) ? dist1 : dist2;
}

/* returns the one angle closer to "angle" from "angle1" and "angle2" */
function anglecloser(angle1, angle, angle2) {
    var dist1 = angledistabs(angle1, angle);
    var dist2 = angledistabs(angle2, angle);
    
    return (dist1 < dist2) ? angle1 : angle2;
}

/* update "circle" to its next state */
function stateto(circle, angle, length) {
    /* handle two obstacle collisions */
    if (circle.point != 0 && circle.point2 != 0) {
        /* two points */
        var angle1 = circlepointangle(circle, circle.point);
        var angle2 = circlepointangle(circle, circle.point2);
        
        if (between(angle1, angle, angle2)) {
            /* can't move */
            circle.movedist = length;
            circle.action = "none";
            return;
        }
        
        var closer = anglecloser(angle1, angle, angle2);
        if (closer == angle1) {
            /* rotate by first point */
        } else {
            /* rotate by second point */
            var point = circle.point;
            circle.point = circle.point2;
            circle.point2 = point;
        }
    }
    if (circle.line != 0 && circle.line2 != 0) {
        /* two lines */
        var angle1 = circlelineangle(circle, circle.line);
        var angle2 = circlelineangle(circle, circle.line2);
        
        if (between(angle1, angle, angle2)) {
            /* can't move */
            circle.movedist = length;
            circle.action = "none";
            return;
        }
        
        var closer = anglecloser(angle1, angle, angle2);
        if (closer == angle1) {
            /* move by first line */
        } else {
            /* move by second line */
            var line = circle.line;
            circle.line  = circle.line2;
            circle.line2 = line;
        }
    }
    if (circle.line != 0 && circle.point != 0) {
        /* line and point */
        var angle1 = circlelineangle(circle, circle.line);
        var angle2 = circlepointangle(circle, circle.point);
        
        if (between(angle1, angle, angle2)) {
            /* can't move */
            circle.movedist = length;
            circle.action = "none";
            return;
        }
        
        var closer = anglecloser(angle1, angle, angle2);
           if (closer == angle1) {
            /* move by line */
            circle.point2 = circle.point;
            circle.point = 0;
        } else {
            /* rotate by point */
            circle.line2 = circle.line;
            circle.line = 0;
        }
    }
    
    if (circle.point == 0) {
        moveto(circle, angle, length);
    } else {
        rotateto(circle, angle, length);
    }
}

function checkpoint(circle, x, y) {
    var dist = distance(circle.x, circle.y, x, y);
    
    if (dist > circle.r) return;
    
    if (circle.point == 0) circle.point = {x: x, y: y};
    else circle.point2 = {x: x, y: y};
    
    /* move away */
    var angle = Math.atan2(circle.y - y, circle.x - x);
    var length = circle.r - dist;
    
    circle.x += length * Math.cos(angle);
    circle.y += length * Math.sin(angle);
}

function checkline(circle, i) {
    var line = lines[i];
    /* check endpoints */
    var dist1 = distance(circle.x, circle.y, line.x1, line.y1);
    var dist2 = distance(circle.x, circle.y, line.x2, line.y2);
    
    var area = trianglearea(circle.x, circle.y, line.x1, line.y1, line.x2, line.y2);
    var linelen = distance(line.x1, line.y1, line.x2, line.y2);
    var dist = 2 * area / linelen;
    
    var lineangle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1);
    var angle1 = lineangle + Math.PI / 2;
    var angle2 = lineangle - Math.PI / 2;
    
    var x1 = circle.x + circle.r * Math.cos(angle1);
    var y1 = circle.y + circle.r * Math.sin(angle1);
    var x2 = circle.x + circle.r * Math.cos(angle2);
    var y2 = circle.y + circle.r * Math.sin(angle2);
    
    var exist1 = lineexist(line, x1, y1);
    var exist2 = lineexist(line, x2, y2);
    
    /* circle-line intersection */
    var inx = circle.x + circle.r * Math.sin();
    
    if (dist1 < circle.r) {
        checkpoint(circle, line.x1, line.y1);
        circle.line = 0;
        circle.line2 = lines[i];
    } else if (dist2 < circle.r) {
        checkpoint(circle, line.x2, line.y2);
        circle.line = 0;
        circle.line2 = lines[i];
    } else if (dist < circle.r && (exist1 || exist2) && line.point != 0) {
        var angle;
        var length = circle.r - dist;
        var dir = direction(circle.x, circle.y, line.x1, line.y1, line.x2, line.y2);
        if (dir) angle = angle1;
        else angle = angle2;
        circle.x += length * Math.cos(angle);
        circle.y += length * Math.sin(angle);
    }
}

/* apply to "circle" a force of size "length" in angle "angle" */
function apply(circle, angle, length) {
    var maxdist = length;

    var count;
    for (count = 0; count < 100; ++count) {
        var prevx = circle.x;
        var prevy = circle.y;
        
        stateto(circle, angle, maxdist);
        maxdist -= circle.movedist;
        
        if (circle.x == prevx && circle.y == prevy) break;
        if (maxdist <= 0) break;
    }
    
    if (circle.point == 0) {
        circle.point2 = 0;
    }
    
    if (circle.line == 0) {
        circle.line2 = 0;
    }
    
    return circle;
}

function update() {
    var mouseangle = Math.atan2(mousey - circle.y, mousex - circle.x);
    var mousedist = distance(mousex, mousey, circle.x, circle.y);
    
    var speed1 = speed * (tick / 1000);
    
    var maxdist = Math.min(speed1, mousedist);
    
    moveangle = mouseangle;
    movedist = maxdist;
    
    var line = circle.line;
    var line2 = circle.line2;
    var point = circle.point;
    var point2 = circle.point2;
    
    apply(circle, moveangle, movedist);
    
    var lineeq = (line == circle.line && line2 == circle.line2);
    var pointeq = (point == circle.point && point2 == circle.point2);
    
    if (!lineeq || !pointeq) {
        if (circle.point == 0 && circle.line == 0) {
            /* no point, no line */
            console.log("Free");
        } else if (circle.point == 0) {
            /* at least one line, no point */
            if (circle.line2 != 0) console.log("Two lines", circle.line, circle.line2);
            else console.log("One line", circle.line);
        } else if (circle.line == 0) {
            /* at least one point, no line */
            if (circle.point2 != 0) console.log("Two points", circle.point, circle.point2);
            else console.log("One point", circle.point);
        } else {
            /* point and line */
            console.log("One point one line", circle.point, circle.line);
        }
    }
    
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
    if (timer != 0) {
        clearTimeout(timer);
        timer = 0;
    } else {
        update();
    }
}

function mousescroll(event) {
    
    var phi = (Math.sqrt(5) + 1) / 2;
    
    if (event.deltaY < 0) {
        if (tick < 640) tick *= phi;
    } else {
        if (tick > 10) tick /= phi;
    }
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

alert("circle follows mouse \n CLICK to PAUSE/PLAY \n SCROLL to add/remove LAG");
window.onload = init;
window.onresize = resize;
window.onmousemove = mousemove;
window.onmouseup = mouseclick;
window.onwheel = mousescroll;