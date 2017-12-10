function AutoVehicle() {
    return {
        vehicle: Vehicle(),
        
        inBuilding: null,
        
        movePath: Path(),
        
        moveHelper: null,
        moveNode: null,
        moveTargetBuilding: null,
        
        moveStartPoint: DirectedPoint(),
        moveEndPoint: DirectedPoint(),
        moveBezier4: Bezier4(),
        moveTotalSeconds: 0.0,
        moveSeconds: 0.0
    };
}

function InitAutoVehicleMovement(autoVehicle) {
    autoVehicle.moveBezier4 = TurnBezier4(autoVehicle.moveStartPoint, autoVehicle.moveEndPoint);
    
    var moveDistance = Distance(autoVehicle.moveStartPoint.position, autoVehicle.moveEndPoint.position);
    
    autoVehicle.moveTotalSeconds = (moveDistance / autoVehicle.vehicle.maxSpeed);
    autoVehicle.moveSeconds = 0.0;
}

function MoveAutoVehicleToBuilding(autoVehicle, building) {
    ClearPath(autoVehicle.movePath);
    
    var targetElem = MapElem();
    targetElem.type = MapElemBuilding;
    targetElem.building = autoVehicle.inBuilding;
    
    var nextElem = MapElem();
    nextElem.type = MapElemBuilding;
    nextElem.building = building;
    
    autoVehicle.movePath = ConnectElems(autoVehicle.vehicle.map, targetElem, nextElem, autoVehicle.moveHelper);
    
    if (autoVehicle.movePath.nodeCount == 0) {
        autoVehicle.moveNode = null;
    }
    else {
        autoVehicle.moveNode = autoVehicle.movePath.nodes[0];
        
        CopyDirectedPoint(autoVehicle.moveStartPoint, StartNodePoint(autoVehicle.moveNode));
        CopyDirectedPoint(autoVehicle.moveEndPoint, NextNodePoint(autoVehicle.moveNode, autoVehicle.moveStartPoint));
        
        InitAutoVehicleMovement(autoVehicle);
        
        autoVehicle.moveTargetBuilding = building;
    }
}

function UpdateAutoVehicle(autoVehicle, seconds) {
    var vehicle = autoVehicle.vehicle;
    
    if (autoVehicle.moveTargetBuilding != null) {
        while (seconds > 0.0) {
            var moveNode = autoVehicle.moveNode;
            
            if (moveNode == null) {
                autoVehicle.inBuilding = autoVehicle.moveTargetBuilding;
                autoVehicle.moveTargetBuilding = null;
                break;
            }
           
            if (moveNode != null) {
                var stop = false;
                
                if (IsNodeEndPoint(moveNode, autoVehicle.moveEndPoint)) {
                    var nextNode = moveNode.next;
                    
                    if (nextNode != null) {
                        var moveElem = moveNode.elem;
                        var nextElem = nextNode.elem;
                        
                        if (moveElem.type == MapElemRoad && nextElem.type == MapElemIntersection) {
                            var road = moveElem.road;
                            var intersection = nextElem.intersection;
                            var trafficLight = null;
                            
                            if (intersection.leftRoad == road)        trafficLight = intersection.leftTrafficLight;
                            else if (intersection.rightRoad == road)  trafficLight = intersection.rightTrafficLight;
                            else if (intersection.topRoad == road)    trafficLight = intersection.topTrafficLight;
                            else if (intersection.bottomRoad == road) trafficLight = intersection.bottomTrafficLight;
                            
                            if ((trafficLight != null) 
                                && (trafficLight.color == TrafficLight_Red || trafficLight.color == TrafficLight_Yellow)
                            ) {
                                stop = true;
                            }
                        }
                    }
                }
                
                if (stop) {
                    var distanceLeft = Distance(vehicle.position, autoVehicle.moveEndPoint.position);
                    
                    if (distanceLeft < vehicle.length * 0.5) break;
                }
                
                autoVehicle.moveSeconds += seconds;
                
                if (autoVehicle.moveSeconds >= autoVehicle.moveTotalSeconds) {
                    CopyDirectedPoint(autoVehicle.moveStartPoint, autoVehicle.moveEndPoint);
                    
                    seconds = autoVehicle.moveSeconds - autoVehicle.moveTotalSeconds;
                    
                    if (IsNodeEndPoint(moveNode, autoVehicle.moveStartPoint)) {
                        moveNode = moveNode.next;
                        autoVehicle.moveNode = moveNode;
                        
                        if (moveNode == null) continue;
                    }
                    else {
                        CopyDirectedPoint(autoVehicle.moveEndPoint, NextNodePoint(moveNode, autoVehicle.moveStartPoint));
                        
                        InitAutoVehicleMovement(autoVehicle);
                    }
                }
                else {
                    seconds = 0.0;
                    
                    var moveRatio = (autoVehicle.moveSeconds / autoVehicle.moveTotalSeconds);
                    
                    var position = Bezier4DirectedPoint(autoVehicle.moveBezier4, moveRatio);
                    MoveVehicle(vehicle, position);
                }
            }
        }
    }
    else {
        var targetBuilding = RandomBuilding(vehicle.map);
        MoveAutoVehicleToBuilding(autoVehicle, targetBuilding);
    }
}