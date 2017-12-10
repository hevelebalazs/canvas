function Line() {
    return {
        x1: 0.0,
        y1: 0.0,
        x2: 0.0,
        y2: 0.0
    };
}

function CopyLine(to, from) {
    to.x1 = from.x1;
    to.y1 = from.y1;
    to.x2 = from.x2;
    to.y2 = from.y2;
}

function DistanceSquare(point1, point2) {
    return (point1.x - point2.x) * (point1.x - point2.x) +
        (point1.y - point2.y) * (point1.y - point2.y);
}

function CityDistance(point1, point2) {
    return Math.abs(point1.x - point2.x) + Math.abs(point1.y - point2.y);
}

function Distance(point1, point2) {
    var dx = (point1.x - point2.x);
    var dy = (point1.y - point2.y);
    
    return Math.sqrt((dx * dx) + (dy * dy));
}

function VectorLength(vector) {
    return Math.sqrt((vector.x * vector.x) + (vector.y * vector.y));
}

function VectorAngle(vector) {
    return Math.atan2(vector.y, vector.x);
}

function RotationVector(angle) {
    return Point2(Math.cos(angle), Math.sin(angle));
}

function PointDirection(startPoint, endPoint) {
    var vector = Point2(endPoint.x - startPoint.x, endPoint.y - startPoint.y);
    vector = NormalVector(vector);
    
    return vector;
}

function TurnsRight(point1, point2, point3) {
    var dx1 = point2.x - point1.x;
    var dy1 = point2.y - point1.y;
    var dx2 = point3.x - point2.x;
    var dy2 = point3.y - point2.y;
    
    var det = (dx1 * dy2) - (dx2 * dy1);
    
    return (det > 0.0);
}

function DoLinesCross(line11, line12, line21, line22) {
    var right1 = TurnsRight(line11, line21, line22);
    var right2 = TurnsRight(line12, line21, line22);
    if (right1 == right2) return false;
    
    var right3 = TurnsRight(line21, line11, line12);
    var right4 = TurnsRight(line22, line11, line12);
    if (right3 == right4) return false;
    
    return true;
}

function Determinant(a, b, c, d) {
    return (a * d) - (b * c);
}

function LineIntersection(line11, line12, line21, line22) {
    var det1  = Determinant(line11.x, line11.y, line12.x, line12.y);
    var detX1 = Determinant(line11.x,      1.0, line12.x,      1.0);
    var detY1 = Determinant(line11.y,      1.0, line12.y,      1.0);
    
    var det2  = Determinant(line21.x, line21.y, line22.x, line22.y);
    var detX2 = Determinant(line21.x,      1.0, line22.x,      1.0);
    var detY2 = Determinant(line21.y,      1.0, line22.y,      1.0);
    
    var detXUp = Determinant(det1, detX1, det2, detX2);
    var detYUp = Determinant(det1, detY1, det2, detY2);
    
    detX1 = Determinant(line11.x, 1.0, line12.x, 1.0);
    detY1 = Determinant(line11.y, 1.0, line12.y, 1.0);
    detX2 = Determinant(line21.x, 1.0, line22.x, 1.0);
    detY2 = Determinant(line21.y, 1.0, line22.y, 1.0);
    
    var detDown = Determinant(detX1, detY1, detX2, detY2);
    
    if (detDown == 0.0) return Point2(0.0, 0.0);
    else return Point2((detXUp / detDown), (detYUp / detDown));
}

function DotProduct(vector1, vector2) {
    return ((vector1.x * vector2.x) + (vector1.y * vector2.y));
}

function NormalVector(vector) {
    var length = VectorLength(vector);
    
    if (length == 0.0) return vector;
    
    return PointProd(1.0 / length, vector);
}

function ParallelVector(vector, base) {
    var unitBase = NormalVector(base);
    
    var result = PointProd(DotProduct(vector, unitBase), unitBase);
    
    return result;
}