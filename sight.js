var canvas;
var context;
var coord;

var lines;

/* position and radius of center */
var centerx;
var centery;
var centerr;

/* help points */
var points = [];

function addpoint(x, y, line, end, point2) {
    /* do not replicate */
    var i;
    for (i = 0; i < points.length; ++i) {
        var point = points[i];
        if (point.x == x && point.y == y) return;
    }
    
    points.push({
        x: x,
        y: y,
        line: line,
        end: end,
        point2: point2
    });
}

/* add point only if it is not hidden */
function addvisible(x, y, line, end, point2) {
    if (ishidden(centerx, centery, x, y, line)) return;
    
    addpoint(x, y, line, end, point2);
}

/* returns the angle of the vector drawn from (x1, y1) to (x2, y2) */
function pointangle(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
}

/* stretch line segment (centerx, centery)->(x, y) from (centerx, centery) */
/* until it hits another line or is as far as centerr */
/* add the so-calculated point to the array of points */
function stretch(x, y) {
    /* calculate how much the segment can be stretched */
    /* start from the edge of line of sight */
    var len = centerr;
    
    /* calculate point position */
    var angle = pointangle(centerx, centery, x, y);
    var dist = distance(centerx, centery, x, y);
    
    var pointx = centerx + len * Math.cos(angle);
    var pointy = centery + len * Math.sin(angle);
    
    /* which way is blocked */
    var blockleft = false;
    var blockright = false;
    
    var linehit;
    /* check if there is a line that blocks the view */
    var i;
    for (i = 0; i < lines.length; ++i) {
        var line = lines[i];
        
        /* if the point is on the line, check which side is blocked */
        if (line.x1 == x && line.y1 == y) {
            var dir = direction(centerx, centery, x, y, line.x2, line.y2);
            if (dir) blockright = true;
            else blockleft = true;
            continue;
        };
        if (line.x2 == x && line.y2 == y) {
            var dir = direction(centerx, centery, x, y, line.x1, line.y1);
            if (dir) blockright = true;
            else blockleft = true;            
            continue;
        };
        
        if (!linecross(line.x1, line.y1, line.x2, line.y2, centerx, centery, pointx, pointy)) continue
        
        /* the line crosses the current segment */
        /* update current endpoint */
        var newx = intersectionx(line.x1, line.y1, line.x2, line.y2, centerx, centery, pointx, pointy);
        var newy = intersectiony(line.x1, line.y1, line.x2, line.y2, centerx, centery, pointx, pointy);
        
        pointx = newx;
        pointy = newy;
        
        var dist1 = distance(pointx, pointy, centerx, centery);
        linehit = line;
        
        if (dist1 < dist) {
            /* distance is smaller than original, point doesn't count */        
            return;
        }
        
    }
    
    if (blockleft && blockright) {
        /* both sides are blocked */
        pointx = x;
        pointy = y;
    }
    
    var end;
    if (linehit) end = false;
    else end = true;
    
    var point = {
        x: x, 
        y: y
    };

    addpoint(pointx, pointy, linehit, end, point);
}

/* distance of point (x, y) from line (x1, y1)->(x2, y2) */
function pointlinedist(x, y, x1, y1, x2, y2) {
    var area = trianglearea(x, y, x1, y1, x2, y2);
    var linelen = distance(x1, y1, x2, y2);
    var dist = 2 * area / linelen;

    return dist;
}

/* distance of point (x, y) from line segment (x1, y1)->(x2, y2) */
function pointsegmentdist(x, y, x1, y1, x2, y2) {
    var linedist = pointlinedist(x, y, x1, y1, x2, y2);
    var linelength = distance(x1, y1, x2, y2);
    
    /* is the point on one side of the line segment? */
    var dist1 = distance(x, y, x1, y1);
    var length1 = Math.sqrt(dist1 * dist1 - linedist * linedist);

    if (length1 > linelength) return distance(x, y, x2, y2);

    var dist2 = distance(x, y, x2, y2);
    var length2 = Math.sqrt(dist2 * dist2 - linedist * linedist);
    
    if (length2 > linelength) return distance(x, y, x1, y1);
    
    return linedist;
}

/* calculate point of line (x1, y1) that is exactly of distance centerr from point (centerx, centery) */
/* if there are more such points, calculate the one closer to point (x1, y1) */
/* it is supposed that there is always such a point */
function getfar(x1, y1, x2, y2) {
    var linedist = pointlinedist(centerx, centery, x1, y1, x2, y2);
    
    var anglecos = linedist / centerr;
    
    var lineangle = pointangle(x1, y1, x2, y2);
    
    var dir = direction(centerx, centery, x1, y1, x2, y2);
    
    var angle;
    if (dir) {
        angle = lineangle - Math.PI / 2;
        angle -= Math.acos(anglecos);
    }
    else {
        angle = lineangle + Math.PI / 2;
        angle += Math.acos(anglecos);
    }
    
    var pointx = centerx + centerr * Math.cos(angle);
    var pointy = centery + centerr * Math.sin(angle);
    
    return {x: pointx, y: pointy};
}

/* draw a triangle */
function addtriangle(x1, y1, x2, y2, x3, y3) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    context.lineTo(x1, y1);
    context.fill();
    context.stroke();
}

/* is point (x, y) hidden from point (fromx, fromy)? */
/* a point is hidden if there is a line that blocks the way */
/* line skip will be skipped */
function ishidden(fromx, fromy, x, y, skip) {
    var i;
    for (i = 0; i < lines.length; ++i) {
        var line = lines[i];
        
        if (line.x1 == skip.x1 && line.y1 == skip.y1 && line.x2 == skip.x2 && line.y2 == skip.y2) {
            // skip
            continue;
        }
        
        var cross = linecross(fromx, fromy, x, y, line.x1, line.y1, line.x2, line.y2);
        if (cross) return true;
    }
    
    return false;
}

/* check line and add points that count as obstacles */
function checkline(line) {
    /* is the line too far to check? */
    var linedist = pointsegmentdist(centerx, centery, line.x1, line.y1, line.x2, line.y2);
    if (linedist > centerr) return;
    
    var x1 = line.x1;
    var y1 = line.y1;
    
    var hit1 = false;
    var hit2 = false;
        
    var dist1 = distance(centerx, centery, x1, y1);
    if (dist1 < centerr) {
        stretch(x1, y1);
        hit1 = true;
    }
    
    var x2 = line.x2;
    var y2 = line.y2;
    
    var dist2 = distance(x2, y2, centerx, centery);
    if (dist2 < centerr) {
        stretch(x2, y2);
        hit2 = true;
    }
    
    /* add far points (points that are not line endpoints) */
    if (hit1 && hit2) {
    }
    else if (hit1) {
        var point = getfar(x2, y2, x1, y1);
        
        addvisible(point.x, point.y, line, true, null);
    }
    else if (hit2) {
        var point = getfar(x1, y1, x2, y2);
        
        addvisible(point.x, point.y, line, true, null);
    }
    else {
        var point1 = getfar(x1, y1, x2, y2);
        var point2 = getfar(x2, y2, x1, y1);

        addvisible(point1.x, point1.y, line, true, null);
        addvisible(point2.x, point2.y, line, true, null);
    }
}

/* compare function for points */
/* points will be sorted in trigonometrical order from the point (centerx, centery) */
function pointcompare(point1, point2) {
    var dir = direction(centerx, centery, point1.x, point1.y, point2.x, point2.y);
    
    return dir;
}

/* is point (x, y) the endpoint of line? */
function lineendpoint(line, x, y) {
    if (!line) return false;

    if (line.x1 == x && line.y1 == y) return true;
    if (line.x2 == x && line.y2 == y) return true;

    return false;
}

/* is there a line with endpoints (x1, y1) and (x2, y2)? */
function isaline(x1, y1, x2, y2) {
    var i;
    for (i = 0; i < lines.length; ++i) {
        var line = lines[i];
        
        if (line.x1 == x1 && line.y1 == y1 && line.x2 == x2 && line.y2 == y2) return true;
        if (line.x1 == x2 && line.y1 == y2 && line.x2 == x1 && line.y2 == y1) return true;
    }
    
    return false;
}

/* highlight every point visible from (x, y) not farther than r */
function drawsight(x, y, r) {
    centerx = x;
    centery = y;
    centerr = r;

    /* find all close line endpoints */
    
    points = [];
    
    var i;
    for (i = 0; i < lines.length; ++i) {
        checkline(lines[i]);
    }
    
    /* sort points */
    points.sort(pointcompare);
    
    /* connect points */
    for (i = 0; i < points.length; ++i) {
        var next = i + 1;
        if (next == points.length) next = 0;
        
        var point = points[i];
        var pointnext = points[next];
        
        var triangle = false;
        
        if (point.line && point.line == pointnext.line) {
            /* draw triangle */
            context.beginPath();
            context.moveTo(centerx, centery);
            context.lineTo(point.x, point.y);
            context.lineTo(pointnext.x, pointnext.y);
            context.moveTo(centerx, centery);
            context.fill();
            context.stroke();
            triangle = true;
        }
        
        if (point.point2 && lineendpoint(pointnext.line, point.point2.x, point.point2.y)) {
            /* draw triangle */
            context.beginPath();
            context.moveTo(centerx, centery);
            context.lineTo(point.point2.x, point.point2.y);
            context.lineTo(pointnext.x, pointnext.y);
            context.moveTo(centerx, centery);
            context.fill();
            context.stroke();
            triangle = true;
        }
        
        if (pointnext.point2 && lineendpoint(point.line, pointnext.point2.x, pointnext.point2.y)) {
            /* draw triangle */
            context.beginPath();
            context.moveTo(centerx, centery);
            context.lineTo(point.x, point.y);
            context.lineTo(pointnext.point2.x, pointnext.point2.y);
            context.moveTo(centerx, centery);
            context.fill();
            context.stroke();
            triangle = true;
        }
        
        if (point.point2 && pointnext.point2 && isaline(point.point2.x, point.point2.y, pointnext.point2.x, pointnext.point2.y)) {
            /* draw triangle */
            context.beginPath();
            context.moveTo(centerx, centery);
            context.lineTo(point.point2.x, point.point2.y);
            context.lineTo(pointnext.point2.x, pointnext.point2.y);
            context.moveTo(centerx, centery);
            context.fill();
            context.stroke();
            triangle = true;
        }
        
        if (!triangle) {
            /* draw arc */
            var angle1 = pointangle(centerx, centery, point.x, point.y);
            var angle2 = pointangle(centerx, centery, pointnext.x, pointnext.y);
            
            context.beginPath();
            context.moveTo(centerx, centery);
            context.arc(centerx, centery, centerr, angle2, angle1);
            context.moveTo(centerx, centery);
            context.fill();
            context.stroke();
        }
    }
    
    /* draw area in special cases */
    if (points.length == 0) {
        /* draw arc */
        context.beginPath();
        context.moveTo(centerx, centery);
        context.arc(centerx, centery, centerr, 0, 2 * Math.PI);
        context.moveTo(centerx, centery);
        context.fill();
        context.stroke();
    }
    
    if (points.length == 2) {
        var angle1 = pointangle(centerx, centery, points[0].x, points[0].y);
        var angle2 = pointangle(centerx, centery, points[1].x, points[1].y);
        
        /* draw arc */
        var angle1 = pointangle(centerx, centery, point.x, point.y);
        var angle2 = pointangle(centerx, centery, pointnext.x, pointnext.y);
        
        if (angledistance(angle1, angle2) > Math.PI) {
            var tmp = angle1;
            angle1 = angle2;
            angle2 = tmp;
        }
            
        context.beginPath();
        context.moveTo(centerx, centery);
        context.arc(centerx, centery, centerr, angle2, angle1);
        context.moveTo(centerx, centery);
        context.fill();
        context.stroke();
    }
    
    for (i = 0; i < points.length; ++i) {
        var point = points[i];
        
        context.beginPath();
        context.moveTo(centerx, centery);
        context.lineTo(point.x, point.y);
        context.lineTo(centerx, centery);
        context.stroke();
    }
}