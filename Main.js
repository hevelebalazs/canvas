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
    globalGameState.selectedBuilding = globalGameState.highlightedBuilding;
}

function KeyDown(event) {
    var key = event.key;

    var playerHuman = globalGameState.playerHuman;
    if (key == 'w')      playerHuman.moveUp    = true;
    else if (key == 's') playerHuman.moveDown  = true;
    else if (key == 'a') playerHuman.moveLeft  = true;
    else if (key == 'd') playerHuman.moveRight = true;
}

function KeyUp(event) {
    var key = event.key;

    var playerHuman = globalGameState.playerHuman;
    if (key == 'w')      playerHuman.moveUp    = false;
    else if (key == 's') playerHuman.moveDown  = false;
    else if (key == 'a') playerHuman.moveLeft  = false;
    else if (key == 'd') playerHuman.moveRight = false;
}

function Update() {
    var mousePosition = Point2(globalMouseX, globalMouseY);
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