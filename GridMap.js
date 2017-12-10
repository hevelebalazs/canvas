function GridPosition() {
    return {
        row: 0,
        col: 0
    };
}

function GridPosition2(row, col) {
    return {
        row: row,
        col: col
    };
}

function CopyGridPosition(gridPosition) {
    return {
        row: gridPosition.row,
        col: gridPosition.col
    };
}

var GRIDMAP_LEFT  = 0;
var GRIDMAP_RIGHT = 1;
var GRIDMAP_UP    = 2;
var GRIDMAP_DOWN  = 3;

function BuildArea() {
    return {
        left:   0.0,
        right:  0.0,
        top:    0.0,
        bottom: 0.0
    };
}

function CopyBuildArea(to, from) {
    to.left   = from.left;
    to.right  = from.right;
    to.top    = from.top;
    to.bottom = from.bottom;
}

function RandomBetween(left, right) {
    return (left) + ((right - left) * Math.random());
}

function GenerateBuildings(map, fromArea, buildingPadding, minBuildingSide, maxBuildingSide) {
    var area = BuildArea();
    CopyBuildArea(area, fromArea);
    
    area.left   += RandomBetween(0.0, buildingPadding);
    area.right  -= RandomBetween(0.0, buildingPadding);
    area.top    += RandomBetween(0.0, buildingPadding);
    area.bottom -= RandomBetween(0.0, buildingPadding);
    
    var areaWidth = area.right - area.left;
    var areaHeight = area.bottom - area.top;
    
    if (areaWidth < buildingPadding) return;
    if (areaHeight < buildingPadding) return;
    
    if ((areaWidth > maxBuildingSide) ||
        ((areaWidth >= buildingPadding + 2.0 * minBuildingSide) && (RandomBetween(0.0, 1.0) < 0.5))
    ){
        var areaLeft = BuildArea();
        CopyBuildArea(areaLeft, area);
        areaLeft.right = ((area.left + area.right) / 2.0);
        
        var areaRight = BuildArea();
        CopyBuildArea(areaRight, area);
        areaRight.left = ((area.left + area.right) / 2.0);
        
        GenerateBuildings(map, areaLeft, buildingPadding, minBuildingSide, maxBuildingSide);
        GenerateBuildings(map, areaRight, buildingPadding, minBuildingSide, maxBuildingSide);
    }
    else if ((areaHeight >= maxBuildingSide) ||
        ((areaHeight >= buildingPadding + 2.0 * minBuildingSide) && (RandomBetween(0.0, 1.0) < 0.5))
    ) {
        var areaTop = BuildArea();
        CopyBuildArea(areaTop, area);
        areaTop.bottom = ((area.top + area.bottom) / 2.0);
        
        var areaBottom = BuildArea();
        CopyBuildArea(areaBottom, area);
        areaBottom.top = ((area.top + area.bottom) / 2.0);
        
        GenerateBuildings(map, areaTop, buildingPadding, minBuildingSide, maxBuildingSide);
        GenerateBuildings(map, areaBottom, buildingPadding, minBuildingSide, maxBuildingSide);
    }
    else {
        var building = map.buildings[map.buildingCount];
        building.left   = area.left;
        building.right  = area.right;
        building.top    = area.top;
        building.bottom = area.bottom;
        
        map.buildingCount++;
    }
}

function ConnectIntersections(intersection1, intersection2, road, roadWidth) {
    if (intersection1.coordinate.y == intersection2.coordinate.y) {
        var left = null;
        var right = null;
        
        if (intersection1.coordinate.x < intersection2.coordinate.x) {
            left = intersection1;
            right = intersection2;
        }
        else {
            left = intersection2;
            right = intersection1;
        }
        
        road.endPoint1.x = left.coordinate.x + (roadWidth * 0.5);
        road.endPoint1.y = left.coordinate.y;
        
        road.endPoint2.x = right.coordinate.x - (roadWidth * 0.5);
        road.endPoint2.y = right.coordinate.y;
        
        left.rightRoad = road;
        right.leftRoad = road;
        
        road.intersection1 = left;
        road.intersection2 = right;
    }
    else {
        var top = null;
        var bottom = null;
        
        if (intersection1.coordinate.y < intersection2.coordinate.y) {
            top = intersection1;
            bottom = intersection2;
        }
        else {
            top = intersection2;
            bottom = intersection1;
        }
        
        road.endPoint1.x = top.coordinate.x;
        road.endPoint1.y = top.coordinate.y + (roadWidth * 0.5);
        
        road.endPoint2.x = bottom.coordinate.x;
        road.endPoint2.y = bottom.coordinate.y - (roadWidth * 0.5);
        
        bottom.topRoad = road;
        top.bottomRoad = road;
        
        road.intersection1 = top;
        road.intersection2 = bottom;
    }
    
    road.width = roadWidth;
}

function CalculateTreeHeight(building) {
    if (building.connectElem.type == MapElemBuilding) {
        var connectBuilding = building.connectElem.building;
        
        CalculateTreeHeight(connectBuilding);
        
        building.connectTreeHeight = connectBuilding.connectTreeHeight + 1;
    }
    else {
        building.connectTreeHeight = 1;
    }
}

function CreateGridMap(width, height, intersectionDistance) {
    var map = Map();
    
    map.width = width;
    map.height = height;
    
    var colCount = Math.floor(width / intersectionDistance);
    var rowCount = Math.floor(height / intersectionDistance);
    
    var rightOffset = width - ((colCount - 1) * intersectionDistance)
    var bottomOffset = height - ((rowCount - 1) * intersectionDistance);
    
    var leftTop = Point2(rightOffset * 0.5, bottomOffset * 0.5);
    
    var intersectionCount = colCount * rowCount;
    map.intersections = GenArray(Intersection, intersectionCount);
    map.intersectionCount = intersectionCount;
    
    var intersectionIndex = 0;
    for (var row = 0; row < rowCount; ++row) {
        for (var col = 0; col < colCount; ++col) {
            map.intersections[intersectionIndex].coordinate = PointSum(
                leftTop,
                PointProd(intersectionDistance, Point2(col, row))
            );
            
            intersectionIndex++;
        }
    }
    
    var connectedPositions = GenArray(GridPosition, intersectionCount);
    var connectedCount = 0;
    
    var maxRoadCount = colCount * (rowCount - 1) + (colCount - 1) * rowCount;
    var roadCount = Math.floor(maxRoadCount / 2);
    var createdRoadCount = 0;
    
    map.roads = GenArray(Road, roadCount);
    map.roadCount = roadCount;
    
    var roadWidth = intersectionDistance * 0.2;
    
    var startRow = Math.floor(Math.random() * rowCount);
    var startCol = Math.floor(Math.random() * colCount);
    
    connectedPositions[connectedCount] = GridPosition2(startRow, startCol);
    connectedCount++;
    
    while (createdRoadCount < roadCount) {
        var startIndex = Math.floor(Math.random() * connectedCount);
        var startPosition = CopyGridPosition(connectedPositions[startIndex]);
        var startIntersection = map.intersections[startPosition.row * colCount + startPosition.col];
        
        var direction = Math.floor(Math.random() * 4);
        
        while (createdRoadCount < roadCount) {
            var createRoad = true;
        
            var endPosition = CopyGridPosition(startPosition);
            
            if (direction == GRIDMAP_RIGHT) {
                if (startIntersection.rightRoad) createRoad = false;
                endPosition.col++;
            }
            else if (direction == GRIDMAP_LEFT) {
                if (startIntersection.leftRoad) createRoad = false;
                endPosition.col--;
            }
            else if (direction == GRIDMAP_DOWN) {
                if (startIntersection.bottomRoad) createRoad = false;
                endPosition.row++;
            }
            else if (direction == GRIDMAP_UP) {
                if (startIntersection.topRoad) createRoad = false;
                endPosition.row--;
            }
            
            if (endPosition.col < 0 || endPosition.col >= colCount) createRoad = false;
            if (endPosition.row < 0 || endPosition.row >= rowCount) createRoad = false;
            
            if (!createRoad) break;
            
            var endIntersection = map.intersections[endPosition.row * colCount + endPosition.col];
            
            var endConnected = false;
            
            if (!endIntersection.bottomRoad && !endIntersection.topRoad &&
                !endIntersection.leftRoad && !endIntersection.rightRoad) {
                endConnected = false;
                connectedPositions[connectedCount] = GridPosition2(endPosition.row, endPosition.col);
                connectedCount++;
            }
            else {
                endConnected = true;
            }
            
            ConnectIntersections(startIntersection, endIntersection, map.roads[createdRoadCount], roadWidth);
            createdRoadCount++;
            
            startIntersection = endIntersection;
            startPosition = CopyGridPosition(endPosition);
            
            if (endConnected) {
                if (Math.random() < 0.5) break;
            }
            else {
                if (Math.random() < 0.2) break;
            }
        }
    }
    
    var maxAreaCount = (rowCount + 1) * (colCount + 1);
    map.buildings = GenArray(Building, 4 * maxAreaCount);
    
    map.buildingCount = 0;
    
    var buildingPadding = intersectionDistance * 0.1;
    
    var gridAreas = GenArray(Null, maxAreaCount);
    
    var buildAreas = GenArray(BuildArea, maxAreaCount);
    var buildAreaCount = 0;
    
    for (var row = 0; row <= rowCount; ++row) {
        var isNewBuilding = false;
        var newArea = BuildArea();
        var roadAbove = false;
        
        newArea.top = ((row - 1) * intersectionDistance) + buildingPadding + leftTop.y;
        newArea.bottom = (row * intersectionDistance) - buildingPadding + leftTop.y;
        
        for (var col = 0; col <= colCount; ++col) {
            var areaAbove = null;
            if (row > 0) areaAbove = gridAreas[(row - 1) * (colCount + 1) + (col - 1)];
            
            var topLeftIntersection = null;
            if (row > 0 && col > 0) topLeftIntersection = map.intersections[(row - 1) * colCount + (col - 1)];
            
            var topRightIntersection = null;
            if (row > 0 && col < colCount) topRightIntersection = map.intersections[(row - 1) * colCount + (col)];
            
            var bottomLeftIntersection = null;
            if (row < rowCount && col > 0) bottomLeftIntersection = map.intersections[(row) * colCount + (col - 1)];
            
            var bottomRightIntersection = null;
            if (row < rowCount && col < colCount) bottomRightIntersection = map.intersections[(row) * colCount + (col)];
            
            var roadOnLeft   = (topLeftIntersection != null) && (topLeftIntersection.bottomRoad != null);
            var roadOnRight  = (topRightIntersection != null) && (topRightIntersection.bottomRoad != null);
            var roadOnTop    = (topLeftIntersection != null) && (topLeftIntersection.rightRoad != null);
            var roadOnBottom = (bottomLeftIntersection != null) && (bottomLeftIntersection.rightRoad != null);
            
            var createArea = false;
            
            var isNearRoad = (roadOnLeft || roadOnRight || roadOnTop || roadOnBottom );
            
            if (isNearRoad) {
                if (isNewBuilding) {
                    if (roadOnLeft) {
                        createArea = true;
                        isNewBuilding = false;
                    }
                    else {
                        newArea.right += intersectionDistance;
                        
                        roadAbove |= roadOnTop;
                    }
                }
            }
            else if (isNewBuilding) {
                createArea = true;
            }
            
            if (createArea) {
                if (!roadAbove && areaAbove &&
                    areaAbove.left == newArea.left &&
                    areaAbove.right == newArea.right
                ) {
                    areaAbove.bottom += intersectionDistance;
                    
                    gridAreas[(row) * (colCount + 1) + (col - 1)] = areaAbove;
                }
                else {
                    CopyBuildArea(buildAreas[buildAreaCount], newArea);
                    gridAreas[(row) * (colCount + 1) + (col - 1)] = buildAreas[buildAreaCount];
                    buildAreaCount++;
                }
                
                isNewBuilding = false;
            }
            
            if (isNearRoad && !isNewBuilding) {
                isNewBuilding = true;
                newArea.left = ((col - 1) * intersectionDistance) + buildingPadding + leftTop.x;
                newArea.right = (col * intersectionDistance) - buildingPadding + leftTop.x;
                
                roadAbove = roadOnTop;
            }
        }
    }
    
    for (var i = 0; i < buildAreaCount; ++i) {
        GenerateBuildings(map, buildAreas[i], buildingPadding, intersectionDistance * 0.25, intersectionDistance * 1.0);
    }
    
    var realIntersectionCount = 0;
    for (var i = 0; i < intersectionCount; ++i) {
        var oldIntersection = map.intersections[i];
        var newIntersection = map.intersections[realIntersectionCount];
        var isIntersectionReal = false;
        
        if (oldIntersection.leftRoad) {
            if (oldIntersection.leftRoad.intersection1 == oldIntersection) {
                oldIntersection.leftRoad.interesction1 = newIntersection;
            }
            else {
                oldIntersection.leftRoad.intersection2 = newIntersection;
            }
            isIntersectionReal = true;
        }
        
        if (oldIntersection.rightRoad) {
            if (oldIntersection.rightRoad.intersection1 == oldIntersection) {
                oldIntersection.rightRoad.intersection1 = newIntersection;
            }
            else {
                oldIntersection.rightRoad.intersection2 = newIntersection;
            }
            isIntersectionReal = true;
        }
        
        if (oldIntersection.topRoad) {
            if (oldIntersection.topRoad.intersection1 == oldIntersection) {
                oldIntersection.topRoad.intersection1 = newIntersection;
            }
            else {
                oldIntersection.topRoad.intersection2 = newIntersection;
            }
            isIntersectionReal = true;
        }
        
        if (oldIntersection.bottomRoad) {
            if (oldIntersection.bottomRoad.intersection1 == oldIntersection) {
                oldIntersection.bottomRoad.intersection1 = newIntersection;
            }
            else {
                oldIntersection.bottomRoad.intersection2 = newIntersection;
            }
            isIntersectionReal = true;
        }
        
        if (isIntersectionReal) {
            CopyIntersection(newIntersection, oldIntersection);
            realIntersectionCount++;
        }
    }
    
    map.intersectionCount = realIntersectionCount;
    
    for (var i = 0; i < map.intersectionCount; ++i) {
        var intersection = map.intersections[i];
        
        InitTrafficLights(intersection);
    }
    
    buildingConnectRoadWidth = roadWidth / 5.0;
    
    for (var i = 0; i < map.buildingCount; ++i) {
        var building = map.buildings[i];
        
        var center = Point();
        center.x = (building.left + building.right) * 0.5;
        center.y = (building.top + building.bottom) * 0.5;
        
        var closestElem = ClosestRoadOrIntersection(map, center);
        ConnectBuildingToElem(building, closestElem);
        
        var crossedBuilding = ClosestCrossedBuilding(map, building.connectPointClose, building.connectPointFar, building);
        if (crossedBuilding) {
            crossedBuilding.roadAround = true;
            
            var elem = MapElem();
            elem.type = MapElemBuilding;
            elem.building = crossedBuilding;
            
            ConnectBuildingToElem(building, elem);
        }
    }
    
    wallHelper = WallHelper();
    wallHelper.maxWallCount = 100;
    wallHelper.wallCount = 0;
    wallHelper.walls = GenArray(Line, wallHelper.maxWallCount);
    wallHelper.hasDoor = GenArray(False, wallHelper.maxWallCount);
    wallHelper.doors = GenArray(Line, wallHelper.maxWallCount);
    
    for (var i = 0; i < map.buildingCount; ++i) {
        var building = map.buildings[i];
        
        if (building.connectTreeHeight == 0) {
            CalculateTreeHeight(building);
        }
        
        building.type = Math.floor(Math.random() * 4);
        
        wallHelper.wallCount = 0;
        GenerateBuildingInside(building, wallHelper);
    }
    
    return map;
}