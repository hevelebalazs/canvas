var humanRadius    = 0.5;
var humanMoveSpeed = 10.0;

function Human() {
    return {
        map: null,
        inBuilding: null,
        
        color: Color(),
        
        position: Point()
    };
}

function DrawHuman(renderer, human) {
    var radius = humanRadius;
    var position = human.position;
    
    DrawRect(
        renderer,
        position.y - radius, position.x - radius,
        position.y + radius, position.x + radius,
        human.color
    );
}