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
    movedist: 0,           /* how much circle moves */
    /* move */
    line: -1, linei: -1,   /* index of touching line */
    line2: -1, linei2: -1, /* second touching line */
    tox: 0, toy: 0,        /* move target */
    x1: 0, y1: 0,          /* helper points */
    tox1: 0, toy1: 0,      /* helper points */
    hitx: 0, hity: 0,      /* first hit point */
    angle: 0,              /* move angle */
    length: 0,             /* move distance */
    /* rotate */
    point: -1, pointi: -1,    /* rotation point */
    point2: -1, pointi2 : -1, /* second touching point */
    rotx: 0, roty: 0,         /* center after rotation */
    rotdist: 0                /* rotation distance */
};

var last;

var circles = [];

var lines = [{ x1:  -5, y1: -1,  x2:  5, y2:  1 },
             { x1:   5, y1: .5,  x2:  0, y2: -3 },
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
            context.arc(circle.pointi.x, circle.pointi.y, 2 * circle.r + padding, circle.pointangle, circle.rotangle);
        } else {
            context.arc(circle.pointi.x, circle.pointi.y, 2 * circle.r + padding, circle.rotangle, circle.pointangle);
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
    
    if (circle.action == "move") {
        /* draw connecting line */     
        context.lineWidth = 2 * circle.r;
        context.beginPath();
        context.moveTo(circle.x, circle.y);
        context.lineTo(circle.hitx, circle.hity);
        context.stroke();
        
        /* draw first hit point */
        context.beginPath();
        context.arc(circle.hitx, circle.hity, circle.r, 0, 2 * Math.PI);
        context.fill();
    }
    if (circle.action == "rotate") {
        /* draw connecting arc */
        context.beginPath();
        
        if (!circle.clockwise) {
            context.arc(circle.pointi.x, circle.pointi.y, 2 * circle.r, circle.pointangle, circle.rotangle);
        } else {
            context.arc(circle.pointi.x, circle.pointi.y, 2 * circle.r, circle.rotangle, circle.pointangle);
        }
        context.fill();
        
        /* draw final circle */
        context.beginPath();
        context.arc(circle.rotx, circle.roty, circle.r, 0, 2 * Math.PI);
        context.fill();
    }
    
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
    
    /* draw all circles */
    var i;
    for (i = 0; i < circles.length; ++i) {
        fillcircle(circles[i]);
    }
    
    for (i = 0; i < circles.length; ++i) {
        drawcircle(circles[i]);
    }
    
    /* draw lines */
    context.lineWidth = 2 / coord;
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
    
    if (point1 <= circle.r) dist = circle.length;
    if (point2 <= circle.r) dist = circle.length;
    
    return dist;
}

/* move circle to (x, y) or to first obstacle on its way */
/* does not actually move circle, but updates movement values */
function moveto(circle, x, y) {
    /* init movement */
    circle.tox = x;
    circle.toy = y;
    
    if (x == circle.x && y == circle.y) return;
    
    circle.angle = Math.atan2(circle.toy - circle.y, circle.tox - circle.x);
    circle.length = distance(circle.x, circle.y, circle.tox, circle.toy);
    
    var endx, endy;
    var enddist;
    var alongline = false;
    /* is it touching a line? */
    if (circle.linei != -1) {
        var line = lines[circle.linei];
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
            var length = parallel(x - circle.x, y - circle.y, lineangle);
            
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
            
            /* calculate intersection distance form end point */
            var inx = circle.x + circle.r * Math.cos(angle);
            var iny = circle.y + circle.r * Math.sin(angle);
            
            enddist = distance(inx, iny, endx, endy);
            
            if (enddist < length) length = enddist;
            
            /* update circle movement angle and distance  */
            circle.angle = lineangle;
            circle.length = length;
            circle.tox = circle.x + length * Math.cos(lineangle);
            circle.toy = circle.y + length * Math.sin(lineangle);
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
    
    circle.line = -1;
    circle.point = -1;
    
    /* find first colliding point */
    var minpoint = -1;
    
    for (i = 0; i < lines.length; ++i) {
        var line = lines[i];
        
        var dist1 = pointdist(circle, line.x1, line.y1);
        /* is circle already touching this? */
        var touch1 = (circle.pointi != -1) && (circle.pointi.x == line.x1) && (circle.pointi.y == line.y1);
        touch1 |= (circle.pointi2 != -1) && (circle.pointi2.x == line.x1) && (circle.pointi2.y == line.y1);
        touch1 |= (alongline) && (endx == line.x1) && (endy == line.y1);
        
        if (!touch1 && dist1 < mindist) {
            mindist = dist1;
            minpoint = {x: line.x1, y: line.y1};
        }
        
        var dist2 = pointdist(circle, line.x2, line.y2);
        /* is circle already touching this? */
        var touch2 = (circle.pointi != -1) && (circle.pointi.x == line.x2) && (circle.pointi.y == line.y2);
        touch2 |= (circle.pointi2 != -1) && (circle.pointi2.x == line.x2) && (circle.pointi2.y == line.y2);
        touch2 |= (alongline) && (endx == line.x2) && (endy == line.y2);
        
        if (!touch2 && dist2 < mindist) {
            mindist = dist2;
            minpoint = {x: line.x2, y: line.y2};
        }
    }
    
    /* find first colliding line */
    var minline = -1;
    
    for (i = 0; i < lines.length; ++i) {
        if (i == circle.linei) {
            /* skip touching line */
            continue;
        }
        
        if (i == circle.linei2) {
            /* skip second line */
            continue;
        }
        
        var line = lines[i];
        var dist = linedist(circle, line);
        
        if (dist < mindist) {
            mindist = dist;
            minline = i;
            minpoint = -1;
        }
    }
    
    circle.action = "move";
    
    circle.hitx = circle.x + mindist * Math.cos(circle.angle);
    circle.hity = circle.y + mindist * Math.sin(circle.angle);
    
    /* update state */
    if (!alongline) {
        circle.line   = minline;
        circle.line2  = -1;
        circle.point  = minpoint;
        circle.point2 = -1;
    } else {
        if (mindist == enddist) {
            /* reached end of line */
            circle.line   = -1;
            circle.line2  = circle.linei;
            circle.point  = {x: endx, y: endy};
            circle.point2 = -1;
        } else {
            circle.line   = circle.linei;
            circle.line2  = minline;
            circle.point  = minpoint;
            circle.point2 = -1;
        }
    }
    
    circle.movedist = distance(circle.x, circle.y, circle.hitx, circle.hity);
}

/* get how much circle can rotate before colliding with point (x, y) */
/* if no such collision, circle.rotdist will be returned */
function pointrot(circle, x, y) {
    /* are points close enough? */
    var point = circle.pointi;
    
    /* skip same point */
    if (point.x == x && point.y == y) return circle.rotdist;
    
    if (circle.pointi2) {
        var point2 = circle.pointi2;
        
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
    var point = circle.pointi;
    
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
    
    if (dist == 0) {
        /* endpoint */
        angle1 = lineangle + Math.PI / 2;
        angle2 = lineangle - Math.PI / 2;
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
    
    if (dist1 < dist2) return dist1;
    else return dist2;
}

/* rotate circle until it faces (x, y) or touches first obstacle */
/* does not actually move circle, but updates rotation values */
function rotateto(circle, x, y) {
    var point = circle.pointi;

    var pointangle = Math.atan2(circle.y - point.y, circle.x - point.x);
    var moveangle = Math.atan2(y - circle.y, x - circle.x);
    
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
        moveto(circle, x, y);
        return;
    }
    
    /* which direction to rotate? */
    rotdist = angledistance(pointangle, rotangle);
    
    var clockwise = (dist <= Math.PI);
    circle.clockwise = clockwise;
    
    circle.action = "rotate";
    
    circle.rotx = point.x + circle.r * Math.cos(rotangle);
    circle.roty = point.y + circle.r * Math.sin(rotangle);
    
    var mindist;
    /* find closest obstacle */
    if (!clockwise) mindist = angledistance(pointangle, rotangle);
    else mindist = angledistance(rotangle, pointangle);
    
    circle.line = -1;
    circle.point = circle.pointi;
    
    circle.rotdist = mindist;
    /* find first colliding point */
    var minpoint = -1;
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
    var minline = -1;
    for (i = 0; i < lines.length; ++i) {
        if (i == circle.linei2) {
            /* skip second line */
            continue;
        }
        
        var line = lines[i];
        
        var dist = linerot(circle, line);
        if (dist < mindist) {
            mindist = dist;
            minline = i;
            minpoint = -1;
        }
    }
    
    if (mindist == circle.rotdist) {
        /* full rotation */
        circle.line   = -1;
        circle.line2  = -1;
        circle.point  = -1;
        circle.point2 = point;
    } else if (minline == -1) {
        /* second point collision  */
        circle.line   = -1;
        circle.line2  = -1;
        circle.point  = point;
        circle.point2 = minpoint;
    } else {
        var line = lines[minline];
        var endpoint = (line.x1 == point.x) && (line.y1 == point.y);
        endpoint |= (line.x2 == point.x) && (line.y2 == point.y);
        if (endpoint) {
            circle.line   = minline;
            circle.line2  = -1;
            circle.point  = -1;
            circle.point2 = point;
        } else {
            circle.line   = minline;
            circle.line2  = -1;
            circle.point  = point;
            circle.point2 = -1;
        }
    }
    
    if (clockwise) {
        circle.rotangle = pointangle - mindist;
    } else {
        circle.rotangle = pointangle + mindist;
    }
    
    circle.rotx = point.x + circle.r * Math.cos(circle.rotangle);
    circle.roty = point.y + circle.r * Math.sin(circle.rotangle);
    
    circle.movedist = 2 * circle.r * mindist;
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

/* get next text of "circle" towards point (x, y) */
function stateto(circle, x, y) {
    var moveangle = Math.atan2(y - circle.y, x - circle.x);
    /* handle two obstacle collisions */
    if (circle.pointi != -1 && circle.pointi2 != -1) {
        /* two points */
        var angle1 = circlepointangle(circle, circle.pointi);
        var angle2 = circlepointangle(circle, circle.pointi2);
        
        if (between(angle1, moveangle, angle2)) {
            /* can't move */
            circle.action = "none";
            return;
        }
        
        var closer = anglecloser(angle1, moveangle, angle2);
        if (closer == angle1) {
            /* rotate by first point */
        } else {
            /* rotate by second point */
            var point = circle.pointi;
            circle.pointi = circle.pointi2;
            circle.pointi2 = point;
        }
    }
    if (circle.linei != -1 && circle.linei2 != -1) {
        /* two lines */
        var angle1 = circlelineangle(circle, lines[circle.linei]);
        var angle2 = circlelineangle(circle, lines[circle.linei2]);
        
        if (between(angle1, moveangle, angle2)) {
            /* can't move */
            circle.action = "none";
            return;
        }
        
        var closer = anglecloser(angle1, moveangle, angle2);
        if (closer == angle1) {
            /* move by first line */
        } else {
            /* move by second line */
            var line = circle.linei;
            circle.linei = circle.linei2;
            circle.linei2 = line;
        }
    }
    if (circle.linei != -1 && circle.pointi != -1) {
        /* line and point */
        var angle1 = circlelineangle(circle, lines[circle.linei]);
        var angle2 = circlepointangle(circle, circle.pointi);
        
        if (between(angle1, moveangle, angle2)) {
            /* can't move */
            circle.action = "none";
            return;
        }
        
        var closer = anglecloser(angle1, moveangle, angle2);
           if (closer == angle1) {
            /* move by line */
            circle.pointi2 = circle.pointi;
            circle.pointi = -1;
        } else {
            /* rotate by point */
            circle.linei2 = circle.linei;
            circle.linei = -1;
        }
    }
    
    if (circle.pointi == -1) {
        moveto(circle, x, y);
    } else {
        rotateto(circle, x, y);
    }
}

/* get next state from "circle" */
function nextstate(circle) {
    var next = {
        x: circle.x, y: circle.y,
        r: circle.r,
        action: "nothing",
        movedist: 0,           /* how much circle moves */
        /* move */
        line: -1, linei: -1,   /* index of touching line */
        line2: -1, linei2: -1, /* second touching line */
        tox: 0, toy: 0,        /* move target */
        x1: 0, y1: 0,          /* helper points */
        tox1: 0, toy1: 0,      /* helper points */
        hitx: 0, hity: 0,      /* first hit point */
        angle: 0,              /* move angle */
        length: 0,             /* move distance */
        /* rotate */
        point: -1, pointi: -1,    /* rotation point */
        point2: -1, pointi2 : -1, /* second touching point */
        rotx: 0, roty: 0,         /* center after rotation */
        rotdist: 0                /* rotation distance */
    };
    
    /* position */
    if (circle.action == "move") {
        next.x = circle.hitx;
        next.y = circle.hity;
    }
    
    if (circle.action == "rotate") {
        next.x = circle.rotx;
        next.y = circle.roty;
    }
    
    next.linei   = circle.line;
    next.linei2  = circle.line2;
    next.pointi  = circle.point;
    next.pointi2 = circle.point2;
    
    return next;
}

function mousemove(event) {
    /* save mouse coordinates */
    mousex = event.clientX;
    mousey = event.clientY;
    
    /* transform from pixel to coordinates */
    mousex = (mousex - canvas.width / 2) / coord;
    mousey = (mousey - canvas.height / 2) / coord;
    
    var mouseangle = Math.atan2(mousey - circle.y, mousex - circle.x);
    var maxdist = distance(mousex, mousey, circle.x, circle.y);

    var tox = circle.x + maxdist * Math.cos(mouseangle);
    var toy = circle.y + maxdist * Math.sin(mouseangle);
    stateto(circle, tox, toy);
    maxdist -= circle.movedist;
    
    /* build array of states */
    var state = circle;
    circles = [state];
    
    for (var count = 0; count < 100; ++count) {
        var next = nextstate(state);
        
        var dist = distance(state.x, state.y, next.x, next.y);
        
        if (dist < 1e-10) {
            /* very small distance */
            break;
        }
        if (maxdist <= 0) return;
        
        tox = next.x + maxdist * Math.cos(mouseangle);
        toy = next.y + maxdist * Math.sin(mouseangle);
        stateto(next, tox, toy);
        maxdist -= next.movedist;
        
        state = next;
        circles.push(state);
    }
    
    last = state;
}

function mouseclick() {
    circle = last;
    
    if (circle.linei == -1) {
        circle.linei  = circle.linei2;
        circle.linei2 = -1;
    }
    if (circle.pointi == -1) {
        circle.pointi  = circle.pointi2;
        circle.pointi2 = -1;
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

window.onload = init;
window.onresize = resize;
window.onmousemove = mousemove;
window.onmouseup = mouseclick;