function Road() {
    return {
        endPoint1: Point(),
        endPoint2: Point(),
        
        intersection1: null,
        intersection2: null,
        
        width: 0.0
    };
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