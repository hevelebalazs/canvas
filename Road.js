function Road() {
    return {
        endPoint1: Point(),
        endPoint2: Point(),
        
        intersection1: null,
        intersection2: null,
        
        width: 0.0
    };
}

function CopyRoad(to, from) {
    CopyPoint(to.endPoint1, from.endPoint1);
    CopyPoint(to.endPoint2, from.endPoint2);
    
    to.intersection1 = from.intersection1;
    to.intersection2 = from.intersection2;
    
    to.width = from.width;
}

function RoadLeavePoint(road, endPointIndex) {
    var result = DirectedPoint();
    
    var startPoint = Point();
    var endPoint = Point();
    
    if (endPointIndex == 1) {
        CopyPoint(startPoint, road.endPoint2);
        CopyPoint(endPoint, road.endPoint1);
    }
    else {
        CopyPoint(startPoint, road.endPoint1);
        CopyPoint(endPoint, road.endPoint2);
    }
    
    var moveUnitVector = PointDirection(startPoint, endPoint);
    var sideUnitVector = Point2(-moveUnitVector.y, moveUnitVector.x);
    
    result.position = PointSum(endPoint, PointProd(road.width * 0.25, sideUnitVector));
    result.direction = moveUnitVector;
    
    return result;
}

function RoadEnterPoint(road, endPointIndex) {
    var result = DirectedPoint();
    
    var startPoint = Point();
    var endPoint = Point();
    
    if (endPointIndex == 1) {
        CopyPoint(startPoint, road.endPoint1);
        CopyPoint(endPoint, road.endPoint2);
    }
    else {
        CopyPoint(startPoint, road.endPoint2);
        CopyPoint(endPoint, road.endPoint1);
    }
    
    var moveUnitVector = PointDirection(startPoint, endPoint);
    var sideUnitVector = Point2(-moveUnitVector.y, moveUnitVector.x);
    
    result.position = PointSum(startPoint, PointProd(road.width * 0.25, sideUnitVector));
    result.direction = moveUnitVector;
    
    return result;
}

function DistanceSquareFromRoad(road, point) {
    var closest = ClosestRoadPoint(road, point);
    
    return DistanceSquare(point, closest);
}

function ClosestRoadPoint(road, point) {
    var result = Point();
    
    if (road.endPoint1.x == road.endPoint2.x) {
        var minY = road.endPoint1.y;
        var maxY = road.endPoint2.y;
        
        if (minY > maxY) {
            var tmp = minY;
            minY = maxY;
            maxY = tmp;
        }
        
        result.x = road.endPoint1.x;
        
        if (minY <= point.y && point.y <= maxY) {
            result.y = point.y;
        }
        else if (point.y < minY) {
            result.y = minY;
        }
        else {
            result.y = maxY;
        }
    }
    else if (road.endPoint1.y == road.endPoint2.y) {
        var minX = road.endPoint1.x;
        var maxX = road.endPoint2.x;
        
        if (minX > maxX) {
            var tmp = minX;
            minX = maxX;
            maxX = tmp;
        }
        
        result.y = road.endPoint1.y;
        
        if (minX <= point.x && point.x <= maxX) {
            result.x = point.x;
        }
        else if (point.x < minX) {
            result.x = minX;
        }
        else {
            result.x = maxX;
        }
    }
    
    return result;
}

function IsPointOnRoad(point, road) {
    var left   = Min2(road.endPoint1.x, road.endPoint2.x);
    var right  = Max2(road.endPoint1.x, road.endPoint2.x);
    var top    = Min2(road.endPoint1.y, road.endPoint2.y);
    var bottom = Max2(road.endPoint1.y, road.endPoint2.y);
    
    if (left == right) {
        left  -= road.width * 0.5;
        right += road.width * 0.5;
    }
    
    if (top == bottom) {
        top    -= road.width * 0.5;
        bottom += road.width * 0.5;
    }
    
    if (point.x < left || point.x > right) return false;
    if (point.y < top || point.y > bottom) return false;
    
    return true;
}

function IsPointOnRoadSide(point, road) {
    var result = false;
    
    if (road.endPoint1.x == road.endPoint2.x) {
        result = ((point.x == road.endPoint1.x - road.width * 0.5) || (point.x == road.endPoint1.x + road.width * 0.5));
    }
    else if (road.endPoint1.y == road.endPoint2.y) {
        result = ((point.y == road.endPoint1.y - road.width * 0.5) || (point.y == road.endPoint1.y + road.width * 0.5));
    }
    
    return result;
}

function DistanceOnLane(road, laneIndex, point) {
    var startPoint = RoadEnterPoint(road, laneIndex);
    var vector = PointDiff(point, startPoint.position);
    
    var parallelVector = ParallelVector(vector, startPoint.direction);
    
    var length = VectorLength(parallelVector);
    
    return length;
}

function TurnPointFromLane(road, laneIndex, point) {
    var result = DirectedPoint();
    
    var startPoint = RoadEnterPoint(road, laneIndex);
    var vector = PointDiff(point, startPoint.position);
    
    var parallelVector = ParallelVector(vector, startPoint.direction);
    
    result.position = PointDiff(
        PointSum(startPoint.position, parallelVector),
        PointProd(road.width * 0.25, startPoint.direction)
    );
    
    CopyPoint(result.direction, startPoint.direction);
    
    return result;
}

function TurnPointToLane(road, laneIndex, point) {
    var result = DirectedPoint();
    
    var startPoint = RoadEnterPoint(road, laneIndex);
    var vector = PointDiff(point, startPoint.position);
    
    var parallelVector = ParallelVector(vector, startPoint.direction);
    
    result.position = PointSum(
        PointSum(startPoint.position, parallelVector),
        PointProd(road.width * 0.25, startPoint.direction)
    );
    CopyPoint(result.direction, startPoint.direction);
    
    return result;
}

function HighlightRoad(renderer, road, color) {
    var left   = Min2(road.endPoint1.x, road.endPoint2.x);
    var right  = Max2(road.endPoint1.x, road.endPoint2.x);
    var top    = Min2(road.endPoint1.y, road.endPoint2.y);
    var bottom = Max2(road.endPoint1.y, road.endPoint2.y);
    
    if (left == right) {
        left  -= road.width * 0.5;
        right += road.width * 0.5;
    }
    
    if (top == bottom) {
        top    -= road.width * 0.5;
        bottom += road.width * 0.5;
    }
    
    DrawRect(renderer, top, left, bottom, right, color);
}

function LaneIndex(road, point) {
    var result = 0;
    var turnsRight = TurnsRight(road.endPoint1, road.endPoint2, point);
    
    if (turnsRight) result = 1;
    else result = -1;
    
    return result;
}

function LaneDirection(road, laneIndex) {
    var result = Point();
    
    if (laneIndex == 1)       result = PointDirection(road.endPoint1, road.endPoint2);
    else if (laneIndex == -1) result = PointDirection(road.endPoint2, road.endPoint1);
    
    return result;
}

function DrawRoad(renderer, road) {
    var stripeWidth = road.width * 0.05;
    
    var top    = 0.0;
    var left   = 0.0;
    var bottom = 0.0;
    var right  = 0.0;
    
    var stripeLeft   = 0.0;
    var stripeRight  = 0.0;
    var stripeTop    = 0.0;
    var stripeBottom = 0.0;
    
    if (road.endPoint1.x == road.endPoint2.x) {
        left   = road.endPoint1.x - (road.width * 0.5);
        right  = road.endPoint2.x + (road.width * 0.5);
        top    = road.endPoint1.y;
        bottom = road.endPoint2.y;
        
        stripeLeft   = road.endPoint1.x - (stripeWidth * 0.5);
        stripeRight  = road.endPoint2.x + (stripeWidth * 0.5);
        stripeTop    = road.endPoint1.y;
        stripeBottom = road.endPoint2.y;
    }
    else if (road.endPoint1.y == road.endPoint2.y) {
        left   = road.endPoint1.x;
        right  = road.endPoint2.x;
        top    = road.endPoint1.y - (road.width * 0.5);
        bottom = road.endPoint2.y + (road.width * 0.5);
        
        stripeLeft   = road.endPoint1.x;
        stripeRight  = road.endPoint2.x;
        stripeTop    = road.endPoint1.y - (stripeWidth * 0.5);
        stripeBottom = road.endPoint2.y + (stripeWidth * 0.5);
    }
    
    roadColor = Color3(0.5, 0.5, 0.5);
    DrawRect(renderer, top, left, bottom, right, roadColor);
    
    stripeColor = Color3(1.0, 1.0, 1.0);
    DrawRect(renderer, stripeTop, stripeLeft, stripeBottom, stripeRight, stripeColor);
}