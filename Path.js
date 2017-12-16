function PathNode() {
    return {
        elem: MapElem(),
        next: null
    };
}

function CopyPathNode(to, from) {
    CopyMapElem(to.elem, from.elem);
    
    to.next = from.next;
}

function Path() {
    return {
        nodeCount: 0,
        nodes: null
    };
}

function PathHelper() {
    return {
        nodeCount: 0,
        nodes: null,
        
        isIntersectionHelper: null,
        isRoadHelper: null,
        sourceIndex: null
    };
}

function ClearPath(path) {
    path.nodes = null;
    path.nodeCount = 0;
}

function EmptyPath() {
    var path = Path();
    return path;
}

function PushNode(path, node) {
    if (path.nodes == null) path.nodes = [];
    
    path.nodes[path.nodeCount] = node;
    path.nodeCount++;
}

function ElemNode(elem) {
    var node = PathNode();
    node.elem = elem;
    return node;
}

function PushElem(path, elem) {
    var node = ElemNode(elem);
    
    PushNode(path, node);
}

function RoadNode(road) {
    var node = PathNode();
    node.elem.type = MapElemRoad;
    node.elem.road = road;
    return node;
}

function IntersectionNode(intersection) {
    var node = PathNode();
    node.elem.type = MapElemIntersection;
    node.elem.intersection = intersection;
    return node;
}

function BuildingNode(building) {
    var node = PathNode();
    node.elem.type = MapElemBuilding;
    node.elem.building = building;
    return node;
}

function PushRoad(path, road) {
    var node = RoadNode(road);
    
    PushNode(path, node);
}

function PushIntersection(path, intersection) {
    var node = IntersectionNode(intersection);
    
    PushNode(path, node);
}

function PushBuilding(path, building) {
    var node = BuildingNode(building);
    
    PushNode(path, node);
}

function PushFromBuildingToRoadElem(path, building) {
    while (building.connectElem.type == MapElemBuilding) {
        PushBuilding(path, building);
        building = building.connectElem.building;
    }
    
    PushBuilding(path, building);
}

function PushFromRoadElemToBuilding(path, building) {
    var startIndex = path.nodeCount;
    PushFromBuildingToRoadElem(path, building);
    var endIndex = path.nodeCount - 1;
    
    InvertSegment(path, startIndex, endIndex);
}

function AddRoadToHelper(map, road, sourceIndex, pathHelper) {
    var roadIndex = GetRoadIndex(map, road);
    
    if (pathHelper.isRoadHelper[roadIndex] == 0) {
        pathHelper.isRoadHelper[roadIndex] = 1;
        
        pathHelper.nodes[pathHelper.nodeCount] = RoadNode(road);
        pathHelper.sourceIndex[pathHelper.nodeCount] = sourceIndex;
        pathHelper.nodeCount++;
    }
}

function AddIntersectionToHelper(map, intersection, sourceIndex, pathHelper) {
    var intersectionIndex = GetIntersectionIndex(map, intersection);
    
    if (pathHelper.isIntersectionHelper[intersectionIndex] == 0) {
        pathHelper.isIntersectionHelper[intersectionIndex] = 1;
        
        pathHelper.nodes[pathHelper.nodeCount] = IntersectionNode(intersection);
        pathHelper.sourceIndex[pathHelper.nodeCount] = sourceIndex;
        pathHelper.nodeCount++;
    }
}

function PushConnectRoadElems(path, map, elemStart, elemEnd, helper) {
    for (var i = 0; i < map.intersectionCount; ++i) helper.isIntersectionHelper[i] = 0;
    for (var i = 0; i < map.roadCount; ++i) helper.isRoadHelper[i] = 0;
    
    helper.nodeCount = 0;
    
    if (elemStart.type == MapElemRoad) {
        AddRoadToHelper(map, elemStart.road, -1, helper);
    }
    else if (elemStart.type == MapElemIntersection) {
        AddIntersectionToHelper(map, elemStart.intersection, -1, helper);
    }
    
    if (MapElemEqual(elemStart, elemEnd)) {
        PushElem(path, elemStart);
        return;
    }
    
    var roadEnd = null;
    if (elemEnd.type == MapElemRoad) roadEnd = elemEnd.road;
    
    var intersectionEnd = null;
    if (elemEnd.type == MapElemIntersection) intersectionEnd = elemEnd.intersection;
    
    for (var i = 0; i < helper.nodeCount; ++i) {
        var node = helper.nodes[i];
        var elem = node.elem;
        
        if (elem.type == MapElemRoad) {
            var road = elem.road;
            
            AddIntersectionToHelper(map, road.intersection1, i, helper);
            if ((intersectionEnd != null) && (road.intersection1 == intersectionEnd)) break;
            
            AddIntersectionToHelper(map, road.intersection2, i, helper);
            if ((intersectionEnd != null) && (road.intersection2 == intersectionEnd)) break;
        }
        else if (elem.type == MapElemIntersection) {
            var intersection = elem.intersection;
            
            if (intersection.leftRoad) {
                AddRoadToHelper(map, intersection.leftRoad, i, helper);
                if ((roadEnd != null) && (intersection.leftRoad == roadEnd)) break;
            }
            
            if (intersection.rightRoad) {
                AddRoadToHelper(map, intersection.rightRoad, i, helper);
                if ((roadEnd != null) && (intersection.rightRoad == roadEnd)) break;
            }
            
            if (intersection.topRoad) {
                AddRoadToHelper(map, intersection.topRoad, i, helper);
                if ((roadEnd != null) && (intersection.topRoad == roadEnd)) break;
            }
            
            if (intersection.bottomRoad) {
                AddRoadToHelper(map, intersection.bottomRoad, i, helper);
                if ((roadEnd != null) && (intersection.bottomRoad == roadEnd)) break;
            }
        }
    }
    
    var startIndex = path.nodeCount;
    
    var nodeIndex = helper.nodeCount - 1;
    while (nodeIndex > -1) {
        var node = helper.nodes[nodeIndex];
        
        PushNode(path, node);
        
        nodeIndex = helper.sourceIndex[nodeIndex];
    }
    
    var endIndex = path.nodeCount - 1;
    
    InvertSegment(path, startIndex, endIndex);
}

function InvertSegment(path, startIndex, endIndex) {
    while (startIndex < endIndex) {
        var tmpNode = PathNode();
        CopyPathNode(tmpNode, path.nodes[startIndex]);
        CopyPathNode(path.nodes[startIndex], path.nodes[endIndex]);
        CopyPathNode(path.nodes[endIndex], tmpNode);
        
        ++startIndex;
        --endIndex;
    }
}

function PathHelperForMap(map) {
    var helper = PathHelper();
    helper.nodes = GenArray(PathNode, (map.intersectionCount + map.roadCount));
    helper.isIntersectionHelper = GenArray(Integer, map.intersectionCount);
    helper.isRoadHelper = GenArray(Integer, map.roadCount);
    helper.sourceIndex = GenArray(Integer, (map.intersectionCount + map.roadCount));
    
    return helper;
}

function CommonAncestor(building1, building2) {
    while (building1.connectTreeHeight != building2.connectTreeHeight) {
        if (building1.connectTreeHeight > building2.connectTreeHeight) {
            building1 = building1.connectElem.building;
        }
        if (building2.connectTreeHeight > building1.connectTreeHeight) {
            building2 = building2.connectElem.building;
        }
    }
    
    while (building1 != null && building2 != null && building1.connectTreeHeight > 1 && building2.connectTreeHeight > 1) {
        if (building1 == building2) return building1;
        
        building1 = building1.connectElem.building;
        building2 = building2.connectElem.building;
    }
    
    if (building1 == building2) return building1;
    else return null;
}

function PushDownTheTree(path, buildingStart, buildingEnd) {
    while (buildingStart != buildingEnd) {
        PushBuilding(path, buildingStart);
        
        buildingStart = buildingStart.connectElem.building;
    }
    
    PushBuilding(path, buildingEnd);
}

function PushUpTheTree(path, buildingStart, buildingEnd) {
    var startIndex = path.nodeCount;
    
    PushDownTheTree(path, buildingEnd, buildingStart);
    
    var endIndex = path.nodeCount - 1;
    
    InvertSegment(path, startIndex, endIndex);
}

function GetConnectRoadElem(building) {
    while (building.connectElem.type == MapElemBuilding) {
        building = building.connectElem.building;
    }
    
    return building.connectElem;
}

function ConnectElems(map, elemStart, elemEnd, helper) {
    var path = EmptyPath();
    
    if (elemStart.type == MapElemBuilding && elemEnd.type == MapElemBuilding
        && elemStart.building == elemEnd.building) return path;
        
    if (elemStart.type == MapElemIntersection && elemEnd.type == MapElemIntersection
        && elemStart.intersection == elemEnd.intersection) return path;
        
    if (elemStart.type == MapElemRoad && elemEnd.type == MapElemRoad
        && elemStart.road == elemEnd.road) return path;
        
    var finished = false;
    
    var endConnectRoad = null;
    var startConnectRoad = null;
    
    if (elemStart.type == MapElemBuilding && elemEnd.type == MapElemBuilding) {
        var buildingStart = elemStart.building;
        var buildingEnd = elemEnd.building;
        
        var commonAncestor = CommonAncestor(buildingStart, buildingEnd);
        
        if (commonAncestor != null) {
            if (commonAncestor == buildingEnd) {
                PushDownTheTree(path, buildingStart, buildingEnd);
            }
            else if (commonAncestor == buildingStart) {
                PushUpTheTree(path, buildingStart, buildingEnd);
            }
            else {
                PushDownTheTree(path, buildingStart, commonAncestor);
                path.nodeCount--;
                PushUpTheTree(path, commonAncestor, buildingEnd);
            }
            
            finished = true;
        }
    }
    
    if (!finished) {
        var roadElemStart = MapElem();
        if (elemStart.type == MapElemBuilding) {
            var startBuilding = elemStart.building;
            
            PushFromBuildingToRoadElem(path, startBuilding);
            CopyMapElem(roadElemStart, GetConnectRoadElem(startBuilding));
            
            if (roadElemStart.type == MapElemRoad) startConnectRoad = roadElemStart.road;
        }
        else {
            CopyMapElem(roadElemStart, elemStart);
        }
        
        var roadElemEnd = MapElem();
        if (elemEnd.type == MapElemBuilding) {
            var endBuilding = elemEnd.building;
            
            CopyMapElem(roadElemEnd, GetConnectRoadElem(endBuilding));
            
            if (roadElemEnd.type == MapElemRoad) endConnectRoad = roadElemEnd.road;
        }
        else {
            CopyMapElem(roadElemEnd, elemEnd);
        }
        
        if (startConnectRoad != null && endConnectRoad != null && startConnectRoad == endConnectRoad) {
            var startLaneIndex = LaneIndex(startConnectRoad, elemStart.building.connectPointFarShow);
            var endLaneIndex = LaneIndex(endConnectRoad, elemEnd.building.connectPointFarShow);
            
            if (startLaneIndex == endLaneIndex) {
                var startDistance = DistanceOnLane(startConnectRoad, startLaneIndex, elemStart.building.connectPointFarShow);
                var endDistance = DistanceOnLane(endConnectRoad, endLaneIndex, elemEnd.building.connectPointFarShow);
                
                if (startDistance < endDistance) {
                    startConnectRoad = null;
                    endConnectRoad = null;
                }
            }
        }
        
        if (startConnectRoad != null) {
            var startBuilding = elemStart.building;
            
            var laneIndex = LaneIndex(startConnectRoad, startBuilding.connectPointFarShow);
            
            var startIntersection = null;
            if (laneIndex == 1)       startIntersection = startConnectRoad.intersection2;
            else if (laneIndex == -1) startIntersection = startConnectRoad.intersection1;
            
            if (startIntersection != null) {
                roadElemStart.type = MapElemIntersection;
                roadElemStart.intersection = startIntersection;
            }
        }
        
        if (endConnectRoad != null) {
            var endBuilding = elemEnd.building;
            
            var laneIndex = LaneIndex(endConnectRoad, endBuilding.connectPointFarShow);
            
            var endIntersection = null;
            if (laneIndex == 1)       endIntersection = endConnectRoad.intersection1;
            else if (laneIndex == -1) endIntersection = endConnectRoad.intersection2;
            
            if (endIntersection != null) {
                roadElemEnd.type = MapElemIntersection;
                roadElemEnd.intersection = endIntersection;
            }
        }
        
        if (startConnectRoad != null) PushRoad(path, startConnectRoad);
        
        PushConnectRoadElems(path, map, roadElemStart, roadElemEnd, helper);
        
        if (endConnectRoad != null) PushRoad(path, endConnectRoad);
        
        if (elemEnd.type == MapElemBuilding) {
            PushFromRoadElemToBuilding(path, elemEnd.building);
        }
    }
    
    if (path.nodeCount == 0) return path;
    
    for (var i = 0; i < path.nodeCount - 1; ++i) {
        path.nodes[i].next = path.nodes[i + 1];
    }
    
    path.nodes[path.nodeCount - 1].next = null;
    
    return path;
}

function NextPointAroundBuilding(building, startPoint, targetPoint) {
    if (startPoint.x == building.left && startPoint.y < building.bottom) {
        if (targetPoint.x == building.left && targetPoint.y > startPoint.y) return targetPoint;
        else return Point2(building.left, building.bottom);
    }
    else if (startPoint.y == building.bottom && startPoint.x < building.right) {
        if (targetPoint.y == building.bottom && targetPoint.x > startPoint.x) return targetPoint;
        else return Point2(building.right, building.bottom);
    }
    else if (startPoint.x == building.right && startPoint.y > building.top) {
        if (targetPoint.x == building.right && targetPoint.y < startPoint.y) return targetPoint;
        else return Point2(building.right, building.top);
    }
    else if (startPoint.y == building.top && startPoint.x > building.left) {
        if (targetPoint.y == building.top && targetPoint.x < startPoint.x) return targetPoint;
        else return Point2(building.left, building.top);
    }
    else {
        return targetPoint;
    }
}

function StartNodePoint(node) {
    var position = Point();
    var direction = Point();
    
    var elem = node.elem;
    if (elem.type == MapElemBuilding) {
        var building = elem.building;
        
        position = building.connectPointClose;
        direction = PointDirection(building.connectPointClose, building.connectPointFar);
    }
    else if (elem.type == MapElemIntersection) {
        position = elem.intersection.coordinate;
    }
    
    var result = DirectedPoint();
    result.position = position;
    result.direction = direction;
    return result;
}

function NextFromBuildingToNothing(startPoint, building) {
    var result = DirectedPoint();
    
    if (PointEqual(startPoint.position, building.connectPointFar) || PointEqual(startPoint.position, building.connectPointFarShow)) {
        result.position = building.connectPointClose;
        result.direction = PointDirection(building.connectPointFar, building.connectPointClose);
    }
    else {
        result.position = NextPointAroundBuilding(building, startPoint.position, building.connectPointClose);
    }
    
    return result;
}

function EndFromBuildingToNothing(point, building) {
    var result = PointEqual(point.position, building.connectPointClose);
    return result;
}

function NextFromBuildingToBuilding(startPoint, building, nextBuilding) {
    var result = DirectedPoint();
    
    if (building.connectElem.type == MapElemBuilding && building.connectElem.building == nextBuilding) {
        if (PointEqual(startPoint.position, building.connectPointClose)) {
            result.position = building.connectPointFar;
        }
        else {
            result.position = NextPointAroundBuilding(building, startPoint.position, building.connectPointClose);
        }
    }
    else if (nextBuilding.connectElem.type == MapElemBuilding && nextBuilding.connectElem.building == building) {
        if (PointEqual(startPoint.position, building.connectPointFar) || PointEqual(startPoint.position, building.connectPointFarShow)) {
            result.position = building.connectPointClose;
        }
        else {
            result.position = NextPointAroundBuilding(building, startPoint.position, nextBuilding.connectPointFar);
        }
    }
    
    return result;
}

function EndFromBuildingToBuilding(point, building, nextBuilding) {
    var result = false;
    
    if (building.connectElem.type == MapElemBuilding && building.connectElem.building == nextBuilding) {
        result = PointEqual(point.position, building.connectPointFar);
    }
    else if (nextBuilding.connectElem.type == MapElemBuilding && nextBuilding.connectElem.building == building) {
        result = PointEqual(point.position, nextBuilding.connectPointFar);
    }
    
    return result;
}

function NextFromBuildingToRoad(startPoint, building, road) {
    var result = DirectedPoint();
    
    if (PointEqual(startPoint.position, building.connectPointClose)) {
        result.position = building.connectPointFarShow;
        result.direction = PointDirection(building.connectPointClose, building.connectPointFarShow);
    }
    else {
        result.position = NextPointAroundBuilding(building, startPoint.position, building.connectPointClose);
    }
    
    return result;
}

function EndFromBuildingToRoad(point, building, road) {
    var result = PointEqual(point.position, building.connectPointFarShow);
    return result;
}

function NextFromBuildingToIntersection(startPoint, building, intersection) {
    var result = DirectedPoint();
    
    if (PointEqual(startPoint.position, building.connectPointClose)) {
        result.position = building.connectPointFarShow;
        result.direction = PointDirection(building.connectPointClose, building.connectPointFarShow);
    }
    else {
        result.position = NextPointAroundBuilding(building, startPoint.position, building.connectPointClose);
    }
    
    return result;
}

function EndFromBuildingToIntersection(point, building, intersection) {
    var result = PointEqual(point.position, building.connectPointFarShow);
    return result;
}

function NextFromRoadToBuilding(startPoint, road, building) {
    var result = DirectedPoint();
    
    var onRoadSide = IsPointOnRoadSide(startPoint.position, road);
    
    if (onRoadSide) {
        var laneIndex = LaneIndex(road, startPoint.position);
        result = TurnPointToLane(road, laneIndex, startPoint.position);
    }
    else {
        var laneIndex = LaneIndex(road, building.connectPointFarShow);
        var turnPoint = TurnPointFromLane(road, laneIndex, building.connectPointFarShow);
        var turnPointDistance = DistanceOnLane(road, laneIndex, turnPoint.position);
        var startDistance = DistanceOnLane(road, laneIndex, startPoint.position);
        
        if (startDistance > turnPointDistance || PointEqual(startPoint.position, turnPoint.position)) {
            CopyPoint(result.position, building.connectPointFarShow);
            CopyPoint(result.direction, PointDirection(building.connectPointFarShow, building.connectPointClose));
        }
        else {
            CopyDirectedPoint(result, turnPoint);
        }
    }
    
    return result;
}

function EndFromRoadToBuilding(point, road, building) {
    var result = PointEqual(point.position, building.connectPointFarShow);
    return result;
}

function NextFromRoadToIntersection(startPoint, road, intersection) {
    var result = DirectedPoint();
    
    var onRoadSide = IsPointOnRoadSide(startPoint.position, road);
    
    if (onRoadSide) {
        var laneIndex = LaneIndex(road, startPoint.position);
        result = TurnPointToLane(road, laneIndex, startPoint.position);
    }
    else if (intersection == road.intersection1) {
        result = RoadLeavePoint(road, 1);
    }
    else if (intersection == road.intersection2) {
        result = RoadLeavePoint(road, 2);
    }
    else {
        result.position = intersection.coordinate;
    }
    
    return result;
}

function EndFromRoadToIntersection(point, road, intersection) {
    var result = false;
    
    var endPoint = Point();
    if (intersection == road.intersection1)      endPoint = RoadLeavePoint(road, 1).position;
    else if (intersection == road.intersection2) endPoint = RoadLeavePoint(road, 2).position;
    else                                         endPoint = intersection.coordinate;
    
    result = PointEqual(point.position, endPoint);
    
    return result;
}

function NextFromIntersectionToBuilding(startPoint, intersection, building) {
    var result = DirectedPoint();
    
    result.position = building.connectPointFarShow;
    result.direction = PointDirection(building.connectPointFarShow, building.connectPointClose);
    
    return result;
}

function EndFromIntersectionToBuilding(point, intersection, building) {
    var result = PointEqual(point.position, building.connectPointFarShow);
    return result;
}

function NextFromIntersectionToRoad(point, intersection, road) {
    var result = DirectedPoint();
    
    if (road.intersection1 == intersection) {
        result = RoadEnterPoint(road, 1);
    }
    else if (road.intersection2 == intersection) {
        result = RoadEnterPoint(road, 2);
    }
    else {
        result.position = intersection.coordinate;
    }
    
    return result;
}

function EndFromIntersectionToRoad(point, intersection, road) {
    var result = false;
    
    var endPoint = Point();
    if (road.intersection1 == intersection)      endPoint = RoadEnterPoint(road, 1).position;
    else if (road.intersection2 == intersection) endPoint = RoadEnterPoint(road, 2).position;
    else                                         endPoint = intersection.coordinate;
    
    result = PointEqual(point.position, endPoint);
    
    return result;
}

function NextNodePoint(node, startPoint) {
    var result = DirectedPoint();
    
    var elem = node.elem;
    var next = node.next;
    
    if (elem.type == MapElemBuilding) {
        var building = elem.building;
        
        if (next == null)                               result = NextFromBuildingToNothing(startPoint, building);
        else if (next.elem.type == MapElemBuilding)     result = NextFromBuildingToBuilding(startPoint, building, next.elem.building);
        else if (next.elem.type == MapElemRoad)         result = NextFromBuildingToRoad(startPoint, building, next.elem.road);
        else if (next.elem.type == MapElemIntersection) result = NextFromBuildingToIntersection(startPoint, building, next.elem.intersection);
    }
    else if (elem.type == MapElemRoad) {
        var road = elem.road;
        
        if (next == null) ;
        else if (next.elem.type == MapElemBuilding)     result = NextFromRoadToBuilding(startPoint, road, next.elem.building);
        else if (next.elem.type == MapElemIntersection) result = NextFromRoadToIntersection(startPoint, road, next.elem.intersection);
    }
    else if (elem.type == MapElemIntersection) {
        var intersection = elem.intersection;
        
        if (next != null && next.elem.type == MapElemBuilding)  result = NextFromIntersectionToBuilding(startPoint, intersection, next.elem.building);
        else if (next != null && next.elem.type == MapElemRoad) result = NextFromIntersectionToRoad(startPoint, intersection, next.elem.road);
        else result.position = elem.intersection.coordinate;
    }
    
    return result;
}

function IsNodeEndPoint(node, point) {
    var result = false;
    
    var elem = node.elem;
    var next = node.next;
    
    if (elem.type == MapElemBuilding) {
        var building = elem.building;
        
        if (next == null)                               result = EndFromBuildingToNothing(point, building);
        else if (next.elem.type == MapElemBuilding)     result = EndFromBuildingToBuilding(point, building, next.elem.building);
        else if (next.elem.type == MapElemRoad)         result = EndFromBuildingToRoad(point, building, next.elem.road);
        else if (next.elem.type == MapElemIntersection) result = EndFromBuildingToIntersection(point, building, next.elem.intersection);
    }
    else if (elem.type == MapElemRoad) {
        var road = elem.road;
        
        if (next == null) ;
        else if (next.elem.type == MapElemBuilding)     result = EndFromRoadToBuilding(point, road, next.elem.building);
        else if (next.elem.type == MapElemIntersection) result = EndFromRoadToIntersection(point, road, next.elem.intersection);
    }
    else if (elem.type == MapElemIntersection) {
        var intersection = elem.intersection;
        
        if (next != null && next.elem.type == MapElemBuilding)  result = EndFromIntersectionToBuilding(point, intersection, next.elem.building);
        else if (next != null && next.elem.type == MapElemRoad) result = EndFromIntersectionToRoad(point, intersection, next.elem.road);
    }
    
    return result;
}

function DrawBezierPath(path, renderer, color, lineWidth) {
    var bezier4 = Bezier4();
    if (path.nodeCount > 0) {
        var node = path.nodes[0];
        var point = StartNodePoint(node);
        
        while (node != null) {
            if (IsNodeEndPoint(node, point)) {
                node = node.next;
            }
            else {
                var nextPoint = NextNodePoint(node, point);
                bezier4 = TurnBezier4(point, nextPoint);
                DrawBezier4(bezier4, renderer, color, lineWidth, 10);
                
                point = nextPoint;
            }
        }
    }
}