function GameState() {
    return {
        renderer: Renderer(),
        map: Map(),
        
        pathHelper: PathHelper(),
        
        autoVehicleCount: 100,
        autoVehicles: GenArray(AutoVehicle, 100),
        
        playerHuman: PlayerHuman(),
        playerVehicle: PlayerVehicle(),
        
        isPlayerVehicle: false,
    };
}

function TogglePlayerVehicle(gameState) {
    var playerPosition = Point();
    
    if (gameState.isPlayerVehicle) CopyPoint(playerPosition, gameState.playerVehicle.vehicle.position);
    else CopyPoint(playerPosition, gameState.playerHuman.human.position);
    
    var playerOnElem = MapElemAtPoint(gameState.map, playerPosition);
    
    if (playerOnElem.type == MapElemRoad || playerOnElem.type == MapElemIntersection) {
        if (gameState.isPlayerVehicle) {
            gameState.isPlayerVehicle = false;
            CopyPoint(gameState.playerHuman.human.position, playerPosition);
        }
        else {
            gameState.isPlayerVehicle = true;
            CopyPoint(gameState.playerVehicle.vehicle.position, playerPosition);
        }
    }
}

function GameInit(gameState, windowWidth, windowHeight) {
    gameState.map = CreateGridMap(windowWidth, windowHeight, 100);    
    gameState.pathHelper = PathHelperForMap(gameState.map);
    
    var playerHuman = gameState.playerHuman;
    var intersection = RandomIntersection(gameState.map);
    CopyPoint(playerHuman.human.position, intersection.coordinate);
    playerHuman.human.map = gameState.map;
    
    var playerVehicle = gameState.playerVehicle;
    var vehicle = playerVehicle.vehicle;
    
    playerVehicle.maxEngineForce = 1000.0;
    playerVehicle.breakForce     = 1000.0;
    playerVehicle.mass           = 200.0;
    
    vehicle.angle  = 0.0;
    vehicle.length = 8.0;
    vehicle.width  = 5.0;
    vehicle.color  = Color3(0.0, 0.0, 1.0);
    
    for (var i = 0; i < gameState.autoVehicleCount; ++i) {
        var randomBuilding = RandomBuilding(gameState.map);
        
        var autoVehicle = gameState.autoVehicles[i];
        var vehicle = autoVehicle.vehicle;
        
        vehicle.angle = 0.0;
        vehicle.color = Color3(0.0, 0.0, 1.0);
        CopyPoint(vehicle.position, randomBuilding.connectPointClose);
        vehicle.length = 7.5;
        vehicle.width = 5.0;
        vehicle.map = gameState.map;
        vehicle.maxSpeed = 30.0;
        autoVehicle.inBuilding = randomBuilding;
        autoVehicle.moveHelper = gameState.pathHelper;
    }
    
    var camera = gameState.renderer.camera;
    
    camera.zoomSpeed = 2.0;
    camera.pixelCoordRatio = 10.0;
    camera.screenSize = Point2(windowWidth, windowHeight);
    camera.center = PointProd(0.5, camera.screenSize);
}

function GameUpdate(gameState, seconds, mousePosition) {
    for (var i = 0; i < gameState.map.intersectionCount; ++i) {
        var intersection = gameState.map.intersections[i];
        
        UpdateTrafficLights(intersection, seconds);
    }
    
    for (var i = 0; i < gameState.autoVehicleCount; ++i) {
        var autoVehicle = gameState.autoVehicles[i];
        UpdateAutoVehicle(autoVehicle, seconds);
    }
    
    if (gameState.isPlayerVehicle) {
        var onElemBefore = MapElemAtPoint(gameState.map, gameState.playerVehicle.vehicle.position);
        
        UpdatePlayerVehicle(gameState.playerVehicle, seconds);
        
        var onElemAfter = MapElemAtPoint(gameState.map, gameState.playerVehicle.vehicle.position);
        
        if (onElemAfter.type == MapElemNone) {
            TurnPlayerVehicleRed(gameState.playerVehicle, 0.2);
        }
        else if (onElemAfter.type == MapElemRoad) {
            var road = onElemAfter.road;
            
            var laneIndex = LaneIndex(road, gameState.playerVehicle.vehicle.position);
            var laneDirection = LaneDirection(road, laneIndex);
            
            var vehicleDirection = RotationVector(gameState.playerVehicle.vehicle.angle);
            var angleCos = DotProduct(laneDirection, vehicleDirection);
            
            var minAngleCos = 0.0;
            
            if (angleCos < minAngleCos) TurnPlayerVehicleRed(gameState.playerVehicle, 0.2);
        }
        else if (onElemAfter.type == MapElemIntersection) {
            var intersection = onElemAfter.intersection;
            
            if (onElemBefore.type == MapElemRoad) {
                var road = onElemBefore.road;
                var trafficLight = TrafficLightOfRoad(intersection, road);
                
                if (trafficLight != null && trafficLight.color == TrafficLight_Red) {
                    TurnPlayerVehicleRed(gameState.playerVehicle, 0.5);
                }
            }
        }
    }
    else {
        UpdatePlayerHuman(gameState.playerHuman, seconds);
    }

    var camera = gameState.renderer.camera;
    camera.center = gameState.playerHuman.human.position;
    
    if (gameState.isPlayerVehicle) {
        CopyPoint(camera.center, gameState.playerVehicle.vehicle.position);
        
        var speed = VectorLength(gameState.playerVehicle.velocity);
        
        camera.zoomTargetRatio = 13.0 - (speed / 4.0);
    }
    else {
        CopyPoint(camera.center, gameState.playerHuman.human.position);
        
        if (gameState.playerHuman.human.inBuilding) {
            camera.zoomTargetRatio = 20.0;
        }
        else {
            camera.zoomTargetRatio = 10.0;
        }
    }
    
    UpdateCamera(camera, seconds);
}

function GameDraw(gameState) {
    var renderer = gameState.renderer;
    
    var clearColor = Color3(0.0, 0.0, 0.0);
    ClearScreen(renderer, clearColor);
    
    var inBuilding = gameState.playerHuman.human.inBuilding;
    
    if (inBuilding) {
        DrawBuildingInside(renderer, inBuilding);
    }
    else {    
        DrawMap(renderer, gameState.map);
        
        for (var i = 0; i < gameState.autoVehicleCount; ++i) {
            var autoVehicle = gameState.autoVehicles[i];
            DrawVehicle(renderer, autoVehicle.vehicle);
        }
    }
   
    if (gameState.isPlayerVehicle) DrawVehicle(gameState.renderer, gameState.playerVehicle.vehicle);
    else DrawHuman(gameState.renderer, gameState.playerHuman.human);
}