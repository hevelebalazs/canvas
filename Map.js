function Map() {
    return {
        intersections: null,
        intersectionCount: 0,
    
        roads: null,
        roadCount: 0,
    
        buildings: null,
        buildingCount: 0,
    
        width: 0.0,
        height: 0.0
    };
}

function GetRoadIndex(map, road) {
    for (var i = 0; i < map.roadCount; ++i) {
        if (map.roads[i] == road) return i;
    }
    
    return -1;
}

function GetIntersectionIndex(map, intersection) {
    for (var i = 0; i < map.intersectionCount; ++i) {
        if (map.intersections[i] == intersection) return i;
    }
    
    return -1;
}

function RandomIntersection(map) {
    var intersectionIndex = Math.floor(Math.random() * map.intersectionCount);
    
    return map.intersections[intersectionIndex];
}

function ClosestRoadOrIntersection(map, point) {
    var result = MapElem();
    result.type = MapElemNone;
    
    var closestRoad = null;
    var minDistanceSquare = 0.0;
    
    for (var i = 0; i < map.roadCount; ++i) {
        var road = map.roads[i];
        
        var betweenX = 
            ((road.endPoint1.x <= point.x) && (point.x <= road.endPoint2.x)) ||
            ((road.endPoint2.x <= point.x) && (point.x <= road.endPoint1.x));
            
        var betweenY =
            ((road.endPoint1.y <= point.y) && (point.y <= road.endPoint2.y)) ||
            ((road.endPoint2.y <= point.y) && (point.y <= road.endPoint1.y));
            
        if (betweenX || betweenY) {
            var distanceSquare = DistanceSquareFromRoad(road, point);
            
            if (!closestRoad || distanceSquare < minDistanceSquare) {
                closestRoad = road;
                minDistanceSquare = distanceSquare;
                
                result.type = MapElemRoad;
                result.road = road;
            }
        }
    }
    
    var closestIntersection = 0;
    for (var i = 0; i < map.intersectionCount; ++i) {
        var intersection = map.intersections[i];
        
        var halfRoadWidth = GetIntersectionRoadWidth(intersection) * 0.5;
        
        var betweenX = (Math.abs(intersection.coordinate.x - point.x) <= halfRoadWidth);
        var betweenY = (Math.abs(intersection.coordinate.y - point.y) <= halfRoadWidth);
        
        if (betweenX || betweenY) {
            var distanceSquare = DistanceSquare(intersection.coordinate, point);
            
            if ((!closestRoad && !closestIntersection) || (distanceSquare < minDistanceSquare)) {
                closestIntersection = intersection;
                minDistanceSquare = distanceSquare;
                
                result.type = MapElemIntersection;
                result.intersection = intersection;
            }
        }
    }
    
    return result;
}

function BuildingAtPoint(map, point) {
    var result = null;
    
    for (var i = 0; i < map.buildingCount; ++i) {
        var building = map.buildings[i];
        
        if (IsPointInBuilding(point, building)) result = building;
    }
    
    return result;
}

function RandomBuilding(map) {
    var buildingIndex = Math.floor(Math.random() * map.buildingCount);
    
    return map.buildings[buildingIndex];
}

function ClosestExtBuildingCrossInfo(map, radius, closePoint, farPoint) {
    var result = BuildingCrossInfo();
    var minDistanceSquare = 0.0;
    
    for (var i = 0; i < map.buildingCount; ++i) {
        var crossInfo = ExtBuildingClosestCrossInfo(map.buildings[i], radius, closePoint, farPoint);
        
        if (crossInfo.building != null) {
            var distanceSquare = DistanceSquare(closePoint, crossInfo.crossPoint);
            
            if (result.building == null || distanceSquare < minDistanceSquare) {
                minDistanceSquare = distanceSquare;
                result = crossInfo;
            }
        }
    }
    
    return result;
}

function ClosestCrossedBuilding(map, pointClose, pointFar, excludedBuilding) {
    var result = null;
    var minDistanceSquare = 0.0;
    
    for (var i = 0; i < map.buildingCount; ++i) {
        var building = map.buildings[i];
        
        if (building == excludedBuilding) continue;
        
        if (IsBuildingCrossed(building, pointClose, pointFar)) {
            var closestCrossPoint = ClosestBuildingCrossPoint(building, pointClose, pointFar);
            
            var distanceSquare = DistanceSquare(pointClose, closestCrossPoint);
            
            if (result == null || distanceSquare < minDistanceSquare) {
                result = building;
                minDistanceSquare = distanceSquare;
            }
        }
    }
    
    return result;
}

function MapElemAtPoint(map, point) {
    var result = MapElem();
    result.type = MapElemNone;
    
    for (var i = 0; i < map.roadCount; ++i) {
        if (IsPointOnRoad(point, map.roads[i])) {
            result.type = MapElemRoad;
            result.road = map.roads[i];
            return result;
        }
    }
    
    for (var i = 0; i < map.buildingCount; ++i) {
        if (IsPointInBuilding(point, map.buildings[i])) {
            result.type = MapElemBuilding;
            result.building = map.buildings[i];
            return result;
        }
        
        if (IsPointOnBuildingConnector(point, map.buildings[i])) {
            result.type = MapElemBuildingConnector;
            result.building = map.buildings[i];
            return result;
        }
    }
    
    for (var i = 0; i < map.roadCount; ++i) {
        if (IsPointOnIntersection(point, map.intersections[i])) {
            result.type = MapElemIntersection;
            result.intersection = map.intersections[i];
            return result;
        }
    }
    
    return result;
}

function DrawMap(renderer, map) {
    var color = Color3(0.0, 1.0, 0.0);
    DrawRect(renderer, 0, 0, map.height, map.width, color);
    
    for (var i = 0; i < map.intersectionCount; ++i) {
        DrawIntersection(renderer, map.intersections[i]);
    }
    
    for (var i = 0; i < map.roadCount; ++i) {
        DrawRoad(renderer, map.roads[i]);
    }
    
    for (var i = 0; i < map.buildingCount; ++i) {
        DrawConnectRoad(renderer, map.buildings[i]);
        DrawBuilding(renderer, map.buildings[i]);
    }
    
    for (var i = 0; i < map.intersectionCount; ++i) {
        DrawTrafficLights(renderer, map.intersections[i]);
    }
}