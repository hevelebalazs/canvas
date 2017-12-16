var globalGameState = null;
var globalFrameTimer = 0;
var globalTargetFrameMS = 1000.0 / 60.0;
var globalTargetFrameS = globalTargetFrameMS / 1000.0;
var globalMouseX = 0.0;
var globalMouseY = 0.0;

function Resize() {
    var renderer = globalGameState.renderer;
    var canvas = renderer.canvas;
    
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    Draw();
}

function Draw() {
    GameDraw(globalGameState);
}

function MouseMove(event) {
    globalMouseX = event.clientX;
    globalMouseY = event.clientY;
}

function MouseClick(event) {
}

function KeyDown(event) {
    var key = event.key;

    var playerHuman = globalGameState.playerHuman;
    var playerVehicle = globalGameState.playerVehicle;
    if (key == 'w') {
        playerHuman.moveUp = true;
        playerVehicle.engineForce = playerVehicle.maxEngineForce;
    }
    else if (key == 's') {
        playerHuman.moveDown = true;
        playerVehicle.engineForce = -playerVehicle.breakForce;
    }
    else if (key == 'a') {
        playerHuman.moveLeft = true;
        playerVehicle.turnDirection = -1.0;
    }
    else if (key == 'd') {
        playerHuman.moveRight = true;
        playerVehicle.turnDirection = 1.0;
    }
    else if (key == 'f') {
        TogglePlayerVehicle(globalGameState);
    }
}

function KeyUp(event) {
    var key = event.key;

    var playerHuman = globalGameState.playerHuman;
    var playerVehicle = globalGameState.playerVehicle;
    if (key == 'w') {
        playerHuman.moveUp = false;
        playerVehicle.engineForce = 0.0;
    }
    else if (key == 's') {
        playerHuman.moveDown = false;
        playerVehicle.engineForce = 0.0;
    }
    else if (key == 'a') {
        playerHuman.moveLeft = false;
        playerVehicle.turnDirection = 0.0;
    }
    else if (key == 'd') {
        playerHuman.moveRight = false;
        playerVehicle.turnDirection = 0.0;
    }
}

function Update() {
    var mousePosition = Point2(globalMouseX, globalMouseY);
    mousePosition = PixelToCoord(globalGameState.renderer.camera, mousePosition);
    
    GameUpdate(globalGameState, globalTargetFrameS, mousePosition);

    Draw();
    
    timer = setTimeout(Update, globalTargetFrameMS);
}

function Init() {
    globalGameState = GameState();
    
    var renderer = globalGameState.renderer;
    var canvas = document.getElementById("canvas");
    
    renderer.canvas = canvas;
    renderer.context = canvas.getContext("2d");
    
    GameInit(globalGameState, canvas.offsetWidth, canvas.offsetHeight);
    
    Resize();
    Update();
}
    
window.onload      = Init;
window.onresize    = Resize;
window.onmousemove = MouseMove;
window.onmouseup   = MouseClick;
window.onkeydown   = KeyDown;
window.onkeyup     = KeyUp;