function Point() {
    return {
        x: 0.0,
        y: 0.0
    };
}

function Point2(x, y) {
    return {
        x: x,
        y: y
    };
}

function DirectedPoint() {
    return {
        position: Point(),
        direction: Point()
    };
}

function CopyPoint(to, from) {
    to.x = from.x;
    to.y = from.y;
}

function CopyDirectedPoint(to, from) {
    CopyPoint(to.position, from.position);
    CopyPoint(to.direction, from.direction);
}

function PointSum(point1, point2) {
    var result = Point();
    result.x = (point1.x + point2.x);
    result.y = (point1.y + point2.y);
    return result;
}

function PointDiff(point1, point2) {
    var result = Point();
    result.x = (point1.x - point2.x);
    result.y = (point1.y - point2.y);
    return result;
}

function PointProd(times, point) {
    var result = Point();
    result.x = (times * point.x);
    result.y = (times * point.y);
    return result;
}

function PointEqual(point1, point2) {
    return ((point1.x == point2.x) && (point1.y == point2.y));
}