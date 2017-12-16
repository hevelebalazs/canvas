var TrafficLight_None   = 0;
var TrafficLight_Red    = 1;
var TrafficLight_Yellow = 2;
var TrafficLight_Green  = 3;

var TrafficLightRadius     = 2.0;
var TrafficLightSwitchTime = 3.0;
var TrafficLightYellowTime = 1.0;

function TrafficLight() {
    return {
        position: Point(),
        color: 0,
        timeLeft: 0.0
    };
}

function CopyTrafficLight(to, from) {
    CopyPoint(to.position, from.position);
    
    to.color = from.color;
    to.timeLeft = from.timeLeft;
}

function Intersection() {
    return {
        coordinate: Point(),
        
        leftRoad:   null,
        rightRoad:  null,
        topRoad:    null,
        bottomRoad: null,
        
        leftTrafficLight:   TrafficLight(),
        rightTrafficLight:  TrafficLight(),
        topTrafficLight:    TrafficLight(),
        bottomTrafficLight: TrafficLight()
    };
}

function CopyIntersection(to, from) {
    CopyPoint(to.coordinate, from.coordinate);
    
    to.leftRoad   = from.leftRoad;
    to.rightRoad  = from.rightRoad;
    to.topRoad    = from.topRoad;
    to.bottomRoad = from.bottomRoad;
    
    CopyTrafficLight(to.leftTrafficLight, from.leftTrafficLight);
    CopyTrafficLight(to.rightTrafficLight, from.rightTrafficLight);
    CopyTrafficLight(to.topTrafficLight, from.topTrafficLight);
    CopyTrafficLight(to.bottomTrafficLight, from.bottomTrafficLight);
}

function TrafficLightOfRoad(intersection, road) {
    if (intersection.leftRoad == road)        return intersection.leftTrafficLight;
    else if (intersection.rightRoad == road)  return intersection.rightTrafficLight;
    else if (intersection.topRoad == road)    return intersection.topTrafficLight;
    else if (intersection.bottomRoad == road) return intersection.bottomTrafficLight;
    else return null;
}

function IsPointOnIntersection(point, intersection) {
    var roadWidth = GetIntersectionRoadWidth(intersection);
    var left   = intersection.coordinate.x - (roadWidth * 0.5);
    var right  = intersection.coordinate.x + (roadWidth * 0.5);
    var top    = intersection.coordinate.y - (roadWidth * 0.5);
    var bottom = intersection.coordinate.y + (roadWidth * 0.5);
    
    if (point.x < left || point.x > right) return false;
    if (point.y < top || point.y > bottom) return false;
    
    return true;
}

function StartTrafficLight(trafficLight) {
    trafficLight.color = TrafficLight_Green;
    trafficLight.timeLeft = TrafficLightSwitchTime;
}

function UpdateTrafficLight(trafficLight, seconds) {
    if (trafficLight.color == TrafficLight_Green) {
        trafficLight.timeLeft -= seconds;
        
        if (trafficLight.timeLeft < 0.0) {
            trafficLight.timeLeft += TrafficLightYellowTime;
            trafficLight.color = TrafficLight_Yellow;
        }
    }
    else if (trafficLight.color == TrafficLight_Yellow) {
        trafficLight.timeLeft -= seconds;
        
        if (trafficLight.timeLeft < 0.0) {
            trafficLight.color = TrafficLight_Red;
        }
    }
}

function DrawTrafficLight(renderer, trafficLight) {
    var drawColor = Color();
    
    switch (trafficLight.color) {
        case TrafficLight_Green: {
            drawColor = Color3(0.0, 1.0, 0.0);
            break;
        }
        case TrafficLight_Yellow: {
            drawColor = Color3(1.0, 1.0, 0.0);
            break;
        }
        case TrafficLight_Red: {
            drawColor = Color3(1.0, 0.0, 0.0);
            break;
        }
    }
    
    var position = trafficLight.position;
    var radius = TrafficLightRadius;
    
    DrawRect(
        renderer,
        position.y - radius, position.x - radius,
        position.y + radius, position.x + radius,
        drawColor
    );
}

function InitTrafficLights(intersection) {
    var roadCount = 0;
    if (intersection.leftRoad)   roadCount++;
    if (intersection.rightRoad)  roadCount++;
    if (intersection.topRoad)    roadCount++;
    if (intersection.bottomRoad) roadCount++;
    
    if (roadCount <= 2) return;
    
    var roadWidth = GetIntersectionRoadWidth(intersection);
    
    var coordinate = intersection.coordinate;
    
    if (intersection.leftRoad) {
        intersection.leftTrafficLight.position = Point2(
            coordinate.x - roadWidth * 0.5,
            coordinate.y + roadWidth * 0.25
        );
    }
    if (intersection.rightRoad) {
        intersection.rightTrafficLight.position = Point2(
            coordinate.x + roadWidth * 0.5,
            coordinate.y - roadWidth * 0.25
        );
    }
    if (intersection.topRoad) {
        intersection.topTrafficLight.position = Point2(
            coordinate.x - roadWidth * 0.25,
            coordinate.y - roadWidth * 0.5
        );
    }
    if (intersection.bottomRoad) {
        intersection.bottomTrafficLight.position = Point2(
            coordinate.x + roadWidth * 0.25,
            coordinate.y + roadWidth * 0.5
        );
    }
    
    if (intersection.leftRoad)   intersection.leftTrafficLight.color   = TrafficLight_Red;
    if (intersection.rightRoad)  intersection.rightTrafficLight.color  = TrafficLight_Red;
    if (intersection.topRoad)    intersection.topTrafficLight.color    = TrafficLight_Red;
    if (intersection.bottomRoad) intersection.bottomTrafficLight.color = TrafficLight_Red;
    
    if (intersection.leftRoad)        StartTrafficLight(intersection.leftTrafficLight);
    else if (intersection.rightRoad)  StartTrafficLight(intersection.rightTrafficLight);
    else if (intersection.topRoad)    StartTrafficLight(intersection.topTrafficLight);
    else if (intersection.bottomRoad) StartTrafficLight(intersection.bottomTrafficLight);
}

function UpdateTrafficLights(intersection, seconds) {
    var roadCount = 0;
    if (intersection.leftRoad)   roadCount++;
    if (intersection.rightRoad)  roadCount++;
    if (intersection.topRoad)    roadCount++;
    if (intersection.bottomRoad) roadCount++;
    
    if (roadCount <= 2) return;
    
    if (intersection.leftRoad && intersection.leftTrafficLight.color != TrafficLight_Red) {
        UpdateTrafficLight(intersection.leftTrafficLight, seconds);
        
        if (intersection.leftTrafficLight.color == TrafficLight_Red) {
            if (intersection.topRoad)         StartTrafficLight(intersection.topTrafficLight);
            else if (intersection.rightRoad)  StartTrafficLight(intersection.rightTrafficLight);
            else if (intersection.bottomRoad) StartTrafficLight(intersection.bottomTrafficLight);
        }
    }
    else if (intersection.topRoad && intersection.topTrafficLight.color != TrafficLight_Red) {
        UpdateTrafficLight(intersection.topTrafficLight, seconds);
        
        if (intersection.topTrafficLight.color == TrafficLight_Red) {
            if (intersection.rightRoad)       StartTrafficLight(intersection.rightTrafficLight);
            else if (intersection.bottomRoad) StartTrafficLight(intersection.bottomTrafficLight);
            else if (intersection.leftRoad)   StartTrafficLight(intersection.leftTrafficLight);
        }
    }
    else if (intersection.rightRoad && intersection.rightTrafficLight.color != TrafficLight_Red) {
        UpdateTrafficLight(intersection.rightTrafficLight, seconds);
        
        if (intersection.rightTrafficLight.color == TrafficLight_Red) {
            if (intersection.bottomRoad)    StartTrafficLight(intersection.bottomTrafficLight);
            else if (intersection.leftRoad) StartTrafficLight(intersection.leftTrafficLight);
            else if (intersection.topRoad)  StartTrafficLight(intersection.topTrafficLight);
        }
    }
    else if (intersection.bottomRoad && intersection.bottomTrafficLight.color != TrafficLight_Red) {
        UpdateTrafficLight(intersection.bottomTrafficLight, seconds);
        
        if (intersection.bottomTrafficLight.color == TrafficLight_Red) {
            if (intersection.leftRoad)       StartTrafficLight(intersection.leftTrafficLight);
            else if (intersection.topRoad)   StartTrafficLight(intersection.topTrafficLight);
            else if (intersection.rightRoad) StartTrafficLight(intersection.rightTrafficLight); 
        }
    }
}

function DrawTrafficLights(renderer, intersection) {
    var roadCount = 0;
    if (intersection.leftRoad)   roadCount++;
    if (intersection.rightRoad)  roadCount++;
    if (intersection.topRoad)    roadCount++;
    if (intersection.bottomRoad) roadCount++;
    
    if (roadCount <= 2) return;
    
    if (intersection.leftRoad)   DrawTrafficLight(renderer, intersection.leftTrafficLight);
    if (intersection.rightRoad)  DrawTrafficLight(renderer, intersection.rightTrafficLight);
    if (intersection.topRoad)    DrawTrafficLight(renderer, intersection.topTrafficLight);
    if (intersection.bottomRoad) DrawTrafficLight(renderer, intersection.bottomTrafficLight);
}

function GetIntersectionRoadWidth(intersection) {
    if (intersection.leftRoad)   return intersection.leftRoad.width;
    if (intersection.rightRoad)  return intersection.rightRoad.width;
    if (intersection.topRoad)    return intersection.topRoad.width;
    if (intersection.bottomRoad) return intersection.bottomRoad.width;
    
    return 0.0;
}

function HighlightIntersection(renderer, intersection, color) {
    if (intersection.leftRoad || intersection.rightRoad || intersection.topRoad || intersection.bottomRoad) {
        var roadWidth = GetIntersectionRoadWidth(intersection);
        
        var coordinate = intersection.coordinate;
        
        var left   = coordinate.x - (roadWidth * 0.5);
        var right  = coordinate.x + (roadWidth * 0.5);
        var top    = coordinate.y - (roadWidth * 0.5);
        var bottom = coordinate.y + (roadWidth * 0.5);
        
        DrawRect(renderer, top, left, bottom, right, color);
    }
}

function DrawIntersection(renderer, intersection) {
    var roadWidth = GetIntersectionRoadWidth(intersection);
    
    var coordinate = intersection.coordinate;
    
    var top    = coordinate.y - (roadWidth * 0.5);
    var bottom = coordinate.y + (roadWidth * 0.5);
    var left   = coordinate.x - (roadWidth * 0.5);
    var right  = coordinate.x + (roadWidth * 0.5);
    
    var midX = (left + right) * 0.5;
    var midY = (top + bottom) * 0.5;
    
    var color = Color3(0.5, 0.5, 0.5);
    DrawRect(renderer, top, left, bottom, right, color);
    
    var stripeWidth = roadWidth * 0.05;
    var stripeColor = Color3(1.0, 1.0, 1.0);
    
    var roadCount = 0;
    
    if (intersection.leftRoad)   roadCount++;
    if (intersection.rightRoad)  roadCount++;
    if (intersection.topRoad)    roadCount++;
    if (intersection.bottomRoad) roadCount++;
    
    if (roadCount > 2) {
        if (intersection.topRoad) {
            DrawRect(renderer, top, left, top + stripeWidth, right, stripeColor);
        }
        if (intersection.leftRoad) {
            DrawRect(renderer, top, left, bottom, left + stripeWidth, stripeColor);
        }
        if (intersection.bottomRoad) {
            DrawRect(renderer, bottom - stripeWidth, left, bottom, right, stripeColor);
        }
        if (intersection.rightRoad) {
            DrawRect(renderer, top, right - stripeWidth, bottom, right, stripeColor);
        }
    }
    else {
        if (intersection.topRoad) {
			DrawRect(renderer, top, midX - (stripeWidth * 0.5), midY + (stripeWidth * 0.5), midX + (stripeWidth * 0.5), stripeColor);
		}
		if (intersection.leftRoad) {
			DrawRect(renderer, midY - (stripeWidth * 0.5), left, midY + (stripeWidth * 0.5), midX + (stripeWidth * 0.5), stripeColor);
		}
		if (intersection.bottomRoad) {
			DrawRect(renderer, midY - (stripeWidth * 0.5), midX - (stripeWidth * 0.5), bottom, midX + (stripeWidth * 0.5), stripeColor);
		}
		if (intersection.rightRoad) {
			DrawRect(renderer, midY - (stripeWidth * 0.5), midX - (stripeWidth * 0.5), midY + (stripeWidth * 0.5), right, stripeColor);
		}
    }
}