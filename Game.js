function GameState() {
    return {
        renderer: Renderer(),
        map: Map(),
        
        selectedBuilding: null,
        highlightedBuilding: null,
        
        pathHelper: PathHelper(),
        buildingPath: Path(),
        
        autoVehicleCount: 100,
        autoVehicles: GenArray(AutoVehicle, 100),
        
        playerHuman: PlayerHuman()
    };
}

function GameInit(gameState, windowWidth, windowHeight) {
    gameState.map = CreateGridMap(windowWidth, windowHeight, 100);    
    gameState.pathHelper = PathHelperForMap(gameState.map);
    
    var playerHuman = gameState.playerHuman;
    var intersection = RandomIntersection(gameState.map);
    CopyPoint(playerHuman.human.position, intersection.coordinate);
    playerHuman.human.map = gameState.map;
    
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
    
    camera.zoomSpeed = 10.0;
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
    
    UpdatePlayerHuman(gameState.playerHuman, seconds);
    
    gameState.highlightedBuilding = BuildingAtPoint(gameState.map, mousePosition);
    
    if (gameState.selectedBuilding && gameState.highlightedBuilding && gameState.selectedBuilding != gameState.highlightedBuilding) {
        ClearPath(gameState.buildingPath);
        
        var selectedBuildingElem = MapElem();
        selectedBuildingElem.type = MapElemBuilding;
        selectedBuildingElem.building = gameState.selectedBuilding;
        
        var highlightedBuildingElem = MapElem();
        highlightedBuildingElem.type = MapElemBuilding;
        highlightedBuildingElem.building = gameState.highlightedBuilding;
        
        gameState.buildingPath = ConnectElems(gameState.map, selectedBuildingElem, highlightedBuildingElem, gameState.pathHelper);
    }
    
    var camera = gameState.renderer.camera;
    camera.center = gameState.playerHuman.human.position;
    
    if (gameState.playerHuman.human.inBuilding != null) {
        camera.zoomTargetRatio = 20.0;
    }
    else {
        camera.zoomTargetRatio = 10.0;
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
        
        if (gameState.selectedBuilding) {
            var highlightColor = Color3(0.0, 1.0, 1.0);
            HighlightBuilding(renderer, gameState.selectedBuilding, highlightColor);
        }

        if (gameState.highlightedBuilding) {
            var highlightColor = Color3(0.0, 1.0, 1.0);
            HighlightBuilding(renderer, gameState.highlightedBuilding, highlightColor);
        }
        
        if ((gameState.buildingPath.nodeCount > 0) && (gameState.selectedBuilding != null) && (gameState.highlightedBuilding != null)
            && (gameState.selectedBuilding != gameState.highlightedBuilding)
        ) {
            var color = Color3(0.0, 0.8, 0.8);
            DrawBezierPath(gameState.buildingPath, gameState.renderer, color, 3.0);
        }
        
        for (var i = 0; i < gameState.autoVehicleCount; ++i) {
            var autoVehicle = gameState.autoVehicles[i];
            DrawVehicle(renderer, autoVehicle.vehicle);
        }
    }
    
    DrawHuman(gameState.renderer, gameState.playerHuman.human);
}