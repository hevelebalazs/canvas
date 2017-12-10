var buildingConnectRoadWidth = 0.0;

var entranceWidth = 3.0;
var wallWidth     = 0.5;

var doorWidth   = 3.0;
var minRoomSide = 5.0;
var maxRoomSide = 20.0;

function WallHelper() {
    return {
        maxWallCount: 0,
        wallCount: 0,
        walls: null,
        hasDoor: false,
        doors: null
    };
}

var CrossNone     = 0;
var CrossWall     = 1;
var CrossEntrance = 2;

function Min2(x, y) {
    if (x < y) return x;
    else return y;
}

function Max2(x, y) {
    if (x > y) return x;
    else return y;
}

function BuildingCrossInfo() {
    return {
        building: null,
        crossPoint: Point(),
        corner1: Point(),
        corner2: Point(),
        type: 0
    };
}

var BuildingType_Black = 0;
var BuildingType_Red   = 1;
var BuildingType_Green = 2;
var BuildingType_Blue  = 3;

function BuildingInside() {
    return {
        wallCount: 0,
        walls: null
    };
}

function Building() {
    return {
        type: 0,
        
        left:   0.0,
        right:  0.0,
        top:    0.0,
        bottom: 0.0,
        
        roadAround: false,
        
        connectPointClose: Point(),
        connectPointFarShow: Point(),
        connectPointFar: Point(),
        
        entrancePoint1: Point(),
        entrancePoint2: Point(),
        
        connectTreeHeight: 0,
        
        connectElem: MapElem(),
        
        inside: null
    };
}

function HorizontalWall(left, right, y) {
    var wall = Line();
    wall.x1 = left;
    wall.y1 = y;
    wall.x2 = right;
    wall.y2 = y;
    return wall;
}

function VerticalWall(top, bottom, x) {
    var wall = Line();
    wall.x1 = x;
    wall.y1 = top;
    wall.x2 = x;
    wall.y2 = bottom;
    return wall;
}

function AddHelperWall(helper, wall) {
    if (helper.wallCount < helper.maxWallCount) {
        helper.walls[helper.wallCount] = wall;
        helper.hasDoor[helper.wallCount] = false;
        helper.wallCount++;
    }
}

function AddHelperWallWithDoor(helper, wall, door) {
    if (helper.wallCount < helper.maxWallCount) {
        helper.walls[helper.wallCount] = wall;
        helper.hasDoor[helper.wallCount] = true;
        helper.doors[helper.wallCount] = door;
        helper.wallCount++;
    }
}

function GenerateWalls(building, wallHelper, 
                       leftWallIndex, rightWallIndex, topWallIndex, bottomWallIndex,
                       minRoomSide, maxRoomSide) {
    var left   = wallHelper.walls[leftWallIndex].x1;
    var right  = wallHelper.walls[rightWallIndex].x1;
    var top    = wallHelper.walls[topWallIndex].y1;
    var bottom = wallHelper.walls[bottomWallIndex].y1;
    
    var width = (right - left);
    var height = (bottom - top);
    
    var cutDistance = RandomBetween(minRoomSide, maxRoomSide);
    
    var canCutHorizontally = (cutDistance <= height - minRoomSide);
    var cutY = top + cutDistance;
    {
        var doorCount = 0;
        var doors = GenArray(Line, 2);
        
        if (wallHelper.hasDoor[leftWallIndex]) {
            CopyLine(doors[doorCount], wallHelper.doors[leftWallIndex]);
            doors[doorCount].y1 -= wallWidth * 0.5;
            doors[doorCount].y2 += wallWidth * 0.5;
            doorCount++;
        }
        if (wallHelper.hasDoor[rightWallIndex]) {
            CopyLine(doors[doorCount], wallHelper.doors[rightWallIndex]);
            doors[doorCount].y1 -= wallWidth * 0.5;
            doors[doorCount].y2 += wallWidth * 0.5;
            doorCount++;
        }
        
        if (doorCount == 2 && (doors[0].y1 < doors[1].y2 && doors[1].y1 < doors[0].y2)) {
            var door = Line();
            door.y1 = Min2(doors[0].y1, doors[1].y1);
            door.y2 = Max2(doors[0].y2, doors[1].y2);
            
            doorCount = 1;
            doors[0] = door;
        }
        
        if (doorCount > 0 && (doors[0].y1 < cutY && cutY < doors[0].y2)) {
            var topY = doors[0].y1;
            var topDist1 = topY - top;
            var topDist2 = bottom - topY;
            
            var bottomY = doors[0].y2;
            var bottomDist1 = bottomY - top;
            var bottomDist2 = bottom - bottomY;
            
            if (topDist1 >= minRoomSide && topDist2 >= minRoomSide) {
                cutY = topY;
                canCutHorizontally = true;
            }
            else if (bottomDist1 >= minRoomSide && bottomDist2 >= minRoomSide) {
                cutY = bottomY;
                canCutHorizontally = true;
            }
            else {
                canCutHorizontally = false;
            }
        }
        
        if (doorCount > 1 && (doors[1].y1 < cutY && cutY < doors[1].y2)) {
            var topY = doors[1].y1;
            var topDist1 = topY - top;
            var topDist2 = bottom - topY;
            
            var bottomY = doors[1].y2;
            var bottomDist1 = bottomY - top;
            var bottomDist2 = bottom - bottomY;
            
            if (topDist1 >= minRoomSide && topDist2 >= minRoomSide) {
                cutY = topY;
                canCutHorizontally = true;
            }
            else if (bottomDist1 >= minRoomSide && bottomDist2 >= minRoomSide) {
                cutY = bottomY;
                canCutHorizontally = true;
            }
            else {
                canCutHorizontally = false;
            }
        }
    }
    
    var canCutVertically = (cutDistance <= width - minRoomSide);
    var cutX = left + cutDistance;
    {
        var doorCount = 0;
        var doors = GenArray(Line, 2);
        
        if (wallHelper.hasDoor[topWallIndex]) {
            CopyLine(doors[doorCount], wallHelper.doors[topWallIndex]);
            doors[doorCount].x1 -= wallWidth * 0.5;
            doors[doorCount].x2 += wallWidth * 0.5;
            doorCount++;
        }
        if (wallHelper.hasDoor[bottomWallIndex]) {
            CopyLine(doors[doorCount], wallHelper.doors[bottomWallIndex]);
            doors[doorCount].x1 -= wallWidth * 0.5;
            doors[doorCount].x2 += wallWidth * 0.5;
            doorCount++;
        }
        
        if (doorCount == 2 && (doors[0].x1 < doors[1].x2 && doors[1].x1 < doors[0].x2)) {
            var door = Line();
            door.x1 = Min2(doors[0].x1, doors[1].x1);
            door.x2 = Max2(doors[0].x2, doors[1].x2);
            
            doorCount = 1;
            doors[0] = door;
        }
        
        if (doorCount > 0 && (doors[0].x1 < cutX && cutX < doors[0].x2)) {
            var leftX = doors[0].x1;
            var leftDist1 = leftX - left;
            var leftDist2 = right - leftX;
            
            var rightX = doors[0].x2;
            var rightDist1 = rightX - left;
            var rightDist2 = right - rightX;
            
            if (leftDist1 >= minRoomSide && leftDist2 >= minRoomSide) {
                cutX = leftX;
                canCutVertically = true;
            }
            else if (rightDist1 >= minRoomSide && rightDist2 >= minRoomSide) {
                cutX = rightX;
                canCutVertically = true;
            }
            else {
                canCutVertically = false;
            }
        }
        
        if (doorCount > 1 && (doors[1].x1 < cutX && cutX < doors[1].x2)) {
            var leftX = doors[1].x1;
            var leftdist1 = leftX - left;
            var leftDist2 = right - leftX;
            
            var rightX = doors[1].x2;
            var rightDist1 = rightX - left;
            var rightDist2 = right - rightX;
            
            if (leftDist1 >= minRoomSide && leftDist2 >= minRoomSide) {
                cutX = leftX;
                canCutVertically = true;
            }
            else if (rightDist1 >= minRoomSide && rightDist2 >= minRoomSide) {
                cutX = rightX
                canCutVertically = true;
            }
            else {
                canCutVertically = false;
            }
        }
    }
    
    var cutHorizontally = false;
    var cutVertically = false;
    
    if (canCutHorizontally && canCutVertically) {
        var random = RandomBetween(0.0, 1.0);
        
        if (random < 0.5) cutHorizontally = true;
        else cutVertically = true;
    }
    else if (canCutHorizontally) {
        cutHorizontally = true;
    }
    else if (canCutVertically) {
        cutVertically = true;
    }
    
    var inside = building.inside;
    
    if (cutVertically) {
        var wallIndex = wallHelper.wallCount;
        
        var wall = VerticalWall(top, bottom, cutX);
        
        var centerY = RandomBetween(
            Min2(wall.y1, wall.y2) + (doorWidth * 0.5),
            Max2(wall.y1, wall.y2) - (doorWidth * 0.5)
        );
        
        var door = Line();
        door.x1 = wall.x1;
        door.y1 = centerY - doorWidth * 0.5;
        door.x2 = wall.x2;
        door.y2 = centerY + doorWidth * 0.5;
        
        AddHelperWallWithDoor(wallHelper, wall, door);
        
        GenerateWalls(building, wallHelper,     wallIndex, rightWallIndex, topWallIndex, bottomWallIndex, minRoomSide, maxRoomSide);
        GenerateWalls(building, wallHelper, leftWallIndex,      wallIndex, topWallIndex, bottomWallIndex, minRoomSide, maxRoomSide);
    }
    else if (cutHorizontally) {
        var wallIndex = wallHelper.wallCount;
        
        var wall = HorizontalWall(left, right, cutY);
        
        var centerX = RandomBetween(
            Min2(wall.x1, wall.x2) + (doorWidth * 0.5),
            Max2(wall.x1, wall.x2) - (doorWidth * 0.5)
        );
        
        var door = Line();
        door.x1 = centerX - doorWidth * 0.5;
        door.y1 = wall.y1;
        door.x2 = centerX + doorWidth * 0.5;
        door.y2 = wall.y2;
        AddHelperWallWithDoor(wallHelper, wall, door);
        
        GenerateWalls(building, wallHelper, leftWallIndex, rightWallIndex,    wallIndex, bottomWallIndex, minRoomSide, maxRoomSide);
        GenerateWalls(building, wallHelper, leftWallIndex, rightWallIndex, topWallIndex,       wallIndex, minRoomSide, maxRoomSide);
    }
}

function GenerateBuildingInside(building, wallHelper) {
    var inside = BuildingInside();
    building.inside = inside;
    
    var buildingWidth = (building.right - building.left);
    var buildingHeight = (building.bottom - building.top);
    
    var maxWallCount = 4 + (Math.floor(buildingWidth / minRoomSide) * Math.floor(buildingHeight / minRoomSide));
    
    var halfWallWidth = wallWidth * 0.5;
    
    var entrance = Line();
    entrance.x1 = building.entrancePoint1.x;
    entrance.y1 = building.entrancePoint1.y;
    entrance.x2 = building.entrancePoint2.x;
    entrance.y2 = building.entrancePoint2.y;
    
    var leftWall = VerticalWall(building.top, building.bottom, building.left + halfWallWidth);
    if (entrance.x1 == building.left && entrance.x2 == building.left) {
        AddHelperWallWithDoor(wallHelper, leftWall, entrance);
    }
    else {
        AddHelperWall(wallHelper, leftWall);
    }
    
    var rightWall = VerticalWall(building.top, building.bottom, building.right - halfWallWidth);
    if (entrance.x1 == building.right && entrance.x2 == building.right) {
        AddHelperWallWithDoor(wallHelper, rightWall, entrance);
    }
    else {
        AddHelperWall(wallHelper, rightWall);
    }
    
    var topWall = HorizontalWall(building.left, building.right, building.top + halfWallWidth);
    if (entrance.y1 == building.top && entrance.y2 == building.top) {
        AddHelperWallWithDoor(wallHelper, topWall, entrance);
    }
    else {
        AddHelperWall(wallHelper, topWall);
    }
    
    var bottomWall = HorizontalWall(building.left, building.right, building.bottom - halfWallWidth);
    if (entrance.y1 == building.bottom && entrance.y2 == building.bottom) {
        AddHelperWallWithDoor(wallHelper, bottomWall, entrance);
    }
    else {
        AddHelperWall(wallHelper, bottomWall);
    }
    
    GenerateWalls(building, wallHelper, 0, 1, 2, 3, minRoomSide, maxRoomSide);
    
    var wallCount = 0;
    for (var i = 0; i < wallHelper.wallCount; ++i) {
        if (wallHelper.hasDoor[i]) wallCount += 2;
        else wallCount += 1;
    }
    
    inside.wallCount = 0;
    inside.walls = GenArray(Line, wallCount);
    
    for (var i = 0; i < wallHelper.wallCount; ++i) {
        var wall = wallHelper.walls[i];
        
        if (wallHelper.hasDoor[i]) {
            var door = wallHelper.doors[i];
            
            if (wall.x1 == wall.x2) {
                var topWall = VerticalWall(
                    Min2(wall.y1, wall.y2),
                    Min2(door.y1, door.y2),
                    wall.x1
                );
                var bottomWall = VerticalWall(
                    Max2(door.y1, door.y2),
                    Max2(wall.y1, wall.y2),
                    wall.x1
                );
                
                inside.walls[inside.wallCount] = topWall;
                inside.wallCount++;
                inside.walls[inside.wallCount] = bottomWall;
                inside.wallCount++;
            }
            else if (wall.y1 == wall.y2) {
                var leftWall = HorizontalWall(
                    Min2(wall.x1, wall.x2),
                    Min2(door.x1, door.x2),
                    wall.y1
                );
                var rightWall = HorizontalWall(
                    Max2(door.x1, door.x2),
                    Max2(wall.x1, wall.x2),
                    wall.y1
                );
                
                inside.walls[inside.wallCount] = leftWall;
                inside.wallCount++;
                inside.walls[inside.wallCount] = rightWall;
                inside.wallCount++;
            }
        }
        else {
            inside.walls[inside.wallCount] = wall;
            inside.wallCount++;
        }
    }
}

function ConnectBuildingToElem(building, elem) {
    var center = Point2(
        (building.left + building.right) * 0.5,
        (building.top + building.bottom) * 0.5
    );
    
    if (elem.type == MapElemNone) {
    }
    else if (elem.type == MapElemRoad) {
        var road = elem.road;
        
        if (road.endPoint1.x == road.endPoint2.x) {
            building.connectPointFar.x = road.endPoint1.x;
            building.connectPointFar.y = center.y;
            building.connectPointFarShow.y = center.y;
            building.connectPointClose.y = center.y;
            
            if (building.right < road.endPoint1.x) {
                building.connectPointFarShow.x = road.endPoint1.x - (road.width * 0.5);
                building.connectPointClose.x = building.right;
            }
            else {
                building.connectPointFarShow.x = road.endPoint1.x + (road.width * 0.5);
                building.connectPointClose.x = building.left;
            }
        }
        else if (road.endPoint1.y == road.endPoint2.y) {
            building.connectPointFar.y = road.endPoint1.y;
            building.connectPointFar.x = center.x;
            building.connectPointFarShow.x = center.x;
            building.connectPointClose.x = center.x;
            
            if (building.bottom < road.endPoint1.y) {
                building.connectPointFarShow.y = road.endPoint1.y - (road.width * 0.5);
                building.connectPointClose.y = building.bottom;
            }
            else {
                building.connectPointFarShow.y = road.endPoint1.y + (road.width * 0.5);
                building.connectPointClose.y = building.top;
            }
        }
    }
    else if (elem.type == MapElemIntersection) {
        var intersection = elem.intersection;
        
        var halfRoadWidth = GetIntersectionRoadWidth(intersection) * 0.5;
        
        var betweenX = (Math.abs(center.x - intersection.coordinate.x) <= halfRoadWidth);
        var betweenY = (Math.abs(center.y - intersection.coordinate.y) <= halfRoadWidth);
        
        if (betweenX) {
            building.connectPointFar.y = intersection.coordinate.y;
            building.connectPointFar.x = center.x;
            building.connectPointFarShow.x = center.x;
            building.connectPointClose.x = center.x;
            
            if (center.y > intersection.coordinate.y) {
                building.connectPointFarShow.y = building.connectPointFar.y + halfRoadWidth;
                building.connectPointClose.y = building.top;
            }
            else {
                building.connectPointFarShow.y = building.connectPointFar.y - halfRoadWidth;
                building.connectPointClose.y = building.bottom;
            }
        }
        else if (betweenY) {
            building.connectPointFar.x = intersection.coordinate.x;
            building.connectPointFar.y = center.y;
            building.connectPointFarShow.y = center.y;
            building.connectPointClose.y = center.y;
            
            if (center.x > intersection.coordinate.x) {
                building.connectPointFarShow.x = building.connectPointFar.x + halfRoadWidth;
                building.connectPointClose.x = building.left;
            }
            else {
                building.connectPointFarShow.x = building.connectPointFar.x - halfRoadWidth;
                building.connectPointClose.x = building.right;
            }
        }
    }
    else if (elem.type == MapElemBuilding) {
        var connectBuilding = elem.building;
        
        building.connectPointFar = ClosestBuildingCrossPoint(connectBuilding, building.connectPointClose, building.connectPointFar);
        building.connectPointFarShow = building.connectPointFar;
    }
    
    CopyMapElem(building.connectElem, elem);
    
    CopyPoint(building.entrancePoint1, building.connectPointClose);
    CopyPoint(building.entrancePoint2, building.connectPointClose);
    
    if (building.connectPointClose.x == building.left || building.connectPointClose.x == building.right) {
        building.entrancePoint1.y -= entranceWidth * 0.5;
        building.entrancePoint2.y += entranceWidth * 0.5;
    }
    else {
        building.entrancePoint1.x -= entranceWidth * 0.5;
        building.entrancePoint2.x += entranceWidth * 0.5;
    }
}

function ClosestBuildingCrossPoint(building, closePoint, farPoint) {
    var result = Point();
    var minDistanceSquare = 0.0;
    var foundAny = false;
    
    var topLeft     = Point2(building.left, building.top);
    var topRight    = Point2(building.right, building.top);
    var bottomLeft  = Point2(building.left, building.bottom);
    var bottomRight = Point2(building.right, building.bottom);
    
    if (DoLinesCross(topLeft, topRight, closePoint, farPoint)) {
        var intersection = LineIntersection(topLeft, topRight, closePoint, farPoint);
        intersection.y = building.top;
        var distanceSquare = DistanceSquare(closePoint, intersection);
        
        if (foundAny == false || distanceSquare < minDistanceSquare) {
            minDistanceSquare = distanceSquare;
            foundAny = true;
            CopyPoint(result, intersection);
        }
    }
    
    if (DoLinesCross(topRight, bottomRight, closePoint, farPoint)) {
        var intersection = LineIntersection(topRight, bottomRight, closePoint, farPoint);
        intersection.x = building.right;
        var distanceSquare = DistanceSquare(closePoint, intersection);
        
        if (foundAny == false || distanceSuqare < minDistanceSquare) {
            minDistanceSquare = distanceSquare;
            foundAny = true;
            CopyPoint(result, intersection);
        }
    }
    
    if (DoLinesCross(bottomRight, bottomLeft, closePoint, farPoint)) {
        var intersection = LineIntersection(bottomRight, bottomLeft, closePoint, farPoint);
        intersection.y = building.bottom;
        var distanceSquare = DistanceSquare(closePoint, intersection);
        
        if (foundAny == false || distanceSquare < minDistanceSquare) {
            minDistanceSquare = distanceSquare;
            foundAny = true;
            CopyPoint(result, intersection);
        }
    }
    
    if (DoLinesCross(bottomLeft, topLeft, closePoint, farPoint)) {
        var intersection = LineIntersection(bottomLeft, topLeft, closePoint, farPoint);
        intersection.x = building.left;
        var distanceSquare = DistanceSquare(closePoint, intersection);
        
        if (foundAny == false || distanceSquare < minDistanceSquare) {
            minDistanceSquare = distanceSquare;
            foundAny = true;
            CopyPoint(result, intersection);
        }
    }
    
    return result;
}

function IsPointInBuilding(point, building) {
    if (point.x < building.left || point.x > building.right) return false;
    if (point.y < building.top || point.y > building.bottom) return false;
    return true;
}

function IsPointInExtBuilding(point, building, radius) {
    if (point.x < building.left - radius || point.x > building.right + radius) return false;
    if (point.y < building.top - radius || point.y > building.bottom + radius) return false;
    return true;
}

function IsPointOnEdge(point, building) {
    if (point.x == building.left) return true;
    if (point.x == building.right) return true;
    if (point.y == building.top) return true;
    if (point.y == building.bottom) return true;
    
    return false;
}

function IsBuildingCrossed(building, point1, point2) {
    if (IsPointOnEdge(point1, building)) return true;
    if (IsPointOnEdge(point2, building)) return true;
    
    var topLeft     = Point2(building.left, building.top);
    var topRight    = Point2(building.right, building.top);
    var bottomLeft  = Point2(building.left, building.bottom);
    var bottomRight = Point2(building.right, building.bottom);
    
    if (DoLinesCross(topLeft, topRight, point1, point2)) return true;
    if (DoLinesCross(topRight, bottomRight, point1, point2)) return true;
    if (DoLinesCross(bottomRight, bottomLeft, point1, point2)) return true;
    if (DoLinesCross(bottomLeft, topLeft, point1, point2)) return true;
    
    return false;
}

function ExtBuildingClosestCrossInfo(building, radius, closePoint, farPoint) {
    var result = BuildingCrossInfo();
    result.type = CrossNone;
    
    var minDistanceSquare = 0.0;
    var foundAny = false;
    
    var topLeft     = Point2(building.left - radius, building.top - radius);
    var topRight    = Point2(building.right + radius, building.top - radius);
    var bottomLeft  = Point2(building.left - radius, building.bottom + radius);
    var bottomRight = Point2(building.right + radius, building.bottom + radius);
    var points = [topLeft, topRight, bottomRight, bottomLeft, topLeft];
    
    for (var i = 0; i < 4; ++i) {
        var corner1 = points[i];
        var corner2 = points[i + 1];
        
        if (DoLinesCross(corner1, corner2, closePoint, farPoint)) {
            var intersection = LineIntersection(corner1, corner2, closePoint, farPoint);
            var distanceSquare = DistanceSquare(closePoint, intersection);
            
            if (foundAny == false || distanceSquare < minDistanceSquare) {
                minDistanceSquare = distanceSquare;
                foundAny = true;
                
                result.building = building;
                result.crossPoint = intersection;
                result.corner1 = corner1;
                result.corner2 = corner2;
                result.type = CrossWall;
            }
        }
    }
    
    var entrance1 = Point(); 
    CopyPoint(entrance1, building.entrancePoint1);
    var entrance2 = Point(); 
    CopyPoint(entrance2, building.entrancePoint2);
    
    if (entrance1.x == building.left && entrance2.x == building.left) {
        entrance1.x -= radius;
        entrance2.x -= radius;
    }
    else if (entrance1.x == building.right && entrance2.x == building.right) {
        entrance1.x += radius;
        entrance2.x += radius;
    }
    else if (entrance1.y == building.top && entrance2.y == building.top) {
        entrance1.y -= radius;
        entrance2.y -= radius;
    }
    else if (entrance1.y == building.bottom && entrance2.y == building.bottom) {
        entrance1.y += radius;
        entrance2.y += radius;
    }
    
    if (entrance1.x < entrance2.x) {
        entrance1.x += radius;
        entrance2.x -= radius;
    }
    else if (entrance1.x > entrance2.x) {
        entrance1.x -= radius;
        entrance2.x += radius;
    }
    
    if (entrance1.y < entrance2.y) {
        entrance1.y += radius;
        entrance2.y -= radius;
    }
    else if (entrance1.y > entrance2.y) {
        entrance1.y -= radius;
        entrance2.y += radius;
    }
    
    if (DoLinesCross(entrance1, entrance2, closePoint, farPoint)) {
        var intersection = LineIntersection(entrance1, entrance2, closePoint, farPoint);
        
        result.building = building;
        result.crossPoint = intersection;
        result.corner1 = entrance1;
        result.corner2 = entrance2;
        result.type = CrossEntrance;
    }
    
    return result;
}

function ExtBuildingInsideClosestCrossInfo(building, radius, closePoint, farPoint) {
    var result = BuildingCrossInfo();
    result.type = CrossNone;
    
    var minDistanceSquare = 0.0;
    var foundAny = false;
    
    var inside = building.inside;
    for (var i = 0; i < inside.wallCount; ++i) {
        var wall = inside.walls[i];
        
        var endPoint1 = Point2(wall.x1, wall.y1);
        var endPoint2 = Point2(wall.x2, wall.y2);
        
        if (endPoint1.x < endPoint2.x) {
            endPoint1.x -= radius;
            endPoint2.x += radius;
        }
        else if (endPoint1.x > endPoint2.x) {
            endPoint1.x += radius;
            endPoint2.x -= radius;
        }
        
        if (endPoint1.y < endPoint2.y) {
            endPoint1.y -= radius;
            endPoint2.y += radius;
        }
        else if (endPoint1.y > endPoint2.y) {
            endPoint1.y += radius;
            endPoint2.y -= radius;
        }
        
        var add = Point();
        if (endPoint1.x == endPoint2.x) add = Point2(1.0, 0.0);
        else add = Point2(0.0, 1.0);
        
        var wallRadius = radius + (wallWidth * 0.5);
        
        var point1 = PointSum(endPoint1, PointProd(wallRadius, add));
        var point2 = PointSum(endPoint1, PointProd(-wallRadius, add));
        var point3 = PointSum(endPoint2, PointProd(-wallRadius, add));
        var point4 = PointSum(endPoint2, PointProd(wallRadius, add));
        
        var points = [point1, point2, point3, point4, point1];
        
        for (var j = 0; j < 4; ++j) {
            var corner1 = points[j];
            var corner2 = points[j + 1];
            
            if (DoLinesCross(corner1, corner2, closePoint, farPoint)) {
                var intersection = LineIntersection(corner1, corner2, closePoint, farPoint);
                var distanceSquare = DistanceSquare(closePoint, intersection);
                
                if (foundAny == false || distanceSquare < minDistanceSquare) {
                    minDistanceSquare = distanceSquare;
                    foundAny = true;
                    
                    result.building = building;
                    CopyPoint(result.crossPoint, intersection);
                    CopyPoint(result.corner1, corner1);
                    CopyPoint(result.corner2, corner2);
                    result.type = CrossWall;
                }
            }
        }
    }
    
    return result;
}

function HighlightBuilding(renderer, building, color) {
    DrawRect(
        renderer,
        building.top, building.left,
        building.bottom, building.right,
        color
    );
}

function DrawBuilding(renderer, building) {
    var color = Color();
    
    switch (building.type) {
        case BuildingType_Black: {
            color = Color3(0.0, 0.0, 0.0);
            break;
        }
        
        case BuildingType_Red: {
            color = Color3(0.5, 0.0, 0.0);
            break;
        }
        
        case BuildingType_Green: {
            color = Color3(0.0, 0.5, 0.0);
            break;
        }
        
        case BuildingType_Blue: {
            color = Color3(0.0, 0.0, 0.5);
            break;
        }
    }
    
    DrawRect(
        renderer,
        building.top, building.left, 
        building.bottom, building.right,
        color
    );
}

function DrawBuildingInside(renderer, building) {
    var color = Color();
    
    switch (building.type) {
        case BuildingType_Black: {
            color = Color3(0.75, 0.75, 0.75);
            break;
        }
        
        case BuildingType_Red: {
            color = Color3(0.75, 0.0, 0.0);
            break;
        }
        
        case BuildingType_Green: {
            color = Color3(0.0, 0.75, 0.0);
            break;
        }
        
        case BuildingType_Blue: {
            color = Color3(0.0, 0.0, 0.75);
            break;
        }
    }
    
    var wallColor = Color();
    CopyColor(wallColor, color);
    if (wallColor.red   > 0.2) wallColor.red   -= 0.2;
    if (wallColor.green > 0.2) wallColor.green -= 0.2;
    if (wallColor.blue  > 0.2) wallColor.blue  -= 0.2;
    
    DrawRect(renderer, building.top, building.left, building.bottom, building.right, color);
    
    var inside = building.inside;

    for (var i = 0; i < inside.wallCount; ++i) {
        var wall = inside.walls[i];
        
        var point1 = Point2(wall.x1, wall.y1);
        var point2 = Point2(wall.x2, wall.y2);
        
        DrawLine(renderer, point1, point2, wallColor, wallWidth);
    }
}

function DrawConnectRoad(renderer, building) {
    var roadColor = Color3(0.5, 0.5, 0.5);
    
    var roadWidth = buildingConnectRoadWidth;
    
    if (building.roadAround) {
        DrawRect(
            renderer,
            building.top - roadWidth, building.left - roadWidth,
            building.bottom + roadWidth, building.right + roadWidth,
            roadColor
        );
    }
    
    DrawLine(renderer, building.connectPointClose, building.connectPointFarShow, roadColor, buildingConnectRoadWidth);
}