function Bezier4() {
    return {
        points: GenArray(Point, 4)
    }
}

function TurnBezier4(startPoint, endPoint) {
    var result = Bezier4();
    
    var turnRatio = Distance(startPoint.position, endPoint.position) * 0.33;
    
    CopyPoint(result.points[0], startPoint.position);
    CopyPoint(result.points[1], PointSum(startPoint.position, PointProd(turnRatio, startPoint.direction)));
    CopyPoint(result.points[2], PointDiff(endPoint.position, PointProd(turnRatio, endPoint.direction)));
    CopyPoint(result.points[3], endPoint.position);
    
    return result;
}

function Bezier4Interpolation(point1, ratio1, point2, ratio2) {
    var part1 = PointProd(ratio1, point1);
    var part2 = PointProd(ratio2, point2);
    
    var result = PointSum(part1, part2);
    return result;
}

function Bezier4Point(bezier4, ratio) {
    var ratio2 = (1.0 - ratio);
    
    var p12 = Bezier4Interpolation(bezier4.points[0], ratio2, bezier4.points[1], ratio);
    var p23 = Bezier4Interpolation(bezier4.points[1], ratio2, bezier4.points[2], ratio);
    var p34 = Bezier4Interpolation(bezier4.points[2], ratio2, bezier4.points[3], ratio);
    
    var p123 = Bezier4Interpolation(p12, ratio2, p23, ratio);
    var p234 = Bezier4Interpolation(p23, ratio2, p34, ratio);
    
    var p1234 = Bezier4Interpolation(p123, ratio2, p234, ratio);
    
    return p1234;
}

function Bezier4DirectedPoint(bezier4, ratio) {
    var ratio2 = (1.0 - ratio);
    
    var p12 = Bezier4Interpolation(bezier4.points[0], ratio2, bezier4.points[1], ratio);
    var p23 = Bezier4Interpolation(bezier4.points[1], ratio2, bezier4.points[2], ratio);
    var p34 = Bezier4Interpolation(bezier4.points[2], ratio2, bezier4.points[3], ratio);
    
    var p123 = Bezier4Interpolation(p12, ratio2, p23, ratio);
    var p234 = Bezier4Interpolation(p23, ratio2, p34, ratio);
    
    var p1234 = Bezier4Interpolation(p123, ratio2, p234, ratio);
    
    var result = DirectedPoint();
    result.position = p1234;
    result.direction = PointDirection(p123, p234);
    
    return result;
}

function DrawBezier4(bezier4, renderer, color, lineWidth, segmentCount) {
    var point = bezier4.points[0];
    
    for (var i = 1; i <= segmentCount; ++i) {
        var ratio = i / segmentCount;
        var nextPoint = Bezier4Point(bezier4, ratio);
        
        DrawLine(renderer, point, nextPoint, color, lineWidth);
        
        point = nextPoint;
    }
}