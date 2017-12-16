function PlayerVehicle() {
    return {
        vehicle: Vehicle(),
        
        mass: 0.0,
        
        engineForce: 0.0,
        maxEngineForce: 0.0,
        breakForce: 0.0,
        
        turnDirection: 0.0,
        
        velocity: Point(),
        
        secondsRed: 0.0
    };
}

function TurnPlayerVehicleRed(playerVehicle, seconds) {
    if (playerVehicle.secondsRed < seconds) playerVehicle.secondsRed = seconds;
}

function UpdatePlayerVehicle(playerVehicle, seconds) {
    var vehicle = playerVehicle.vehicle;
    
    var speed = VectorLength(playerVehicle.velocity);
    
    var direction = RotationVector(vehicle.angle);
    
    var frontWheel = PointProd(vehicle.length * 0.5, direction);
    var rearWheel  = PointProd(-vehicle.length * 0.5, direction);
    
    var maxControlSpeed = 10.0;
    var controlTurnAngle = Math.PI * 0.5;
    
    var turnAngle = controlTurnAngle * playerVehicle.turnDirection;;
    if (speed > maxControlSpeed) turnAngle *= (maxControlSpeed / speed);
    
    var backwards = false;
    if (DotProduct(direction, playerVehicle.velocity) < 0.0) backwards = true;
    
    var turnDirection = Point();
    if (backwards) turnDirection = RotationVector(vehicle.angle - turnAngle);
    else           turnDirection = RotationVector(vehicle.angle + turnAngle);
    
    frontWheel = PointSum(frontWheel, PointProd(seconds * speed, turnDirection));
    rearWheel  = PointSum(rearWheel, PointProd(seconds * speed, direction));
    
    vehicle.angle = Math.atan2(frontWheel.y - rearWheel.y, frontWheel.x - rearWheel.x);
    
    var cDrag = 0.4257;
    var cRR = 12.8;
    
    var fTraction = PointProd(playerVehicle.engineForce, direction);
    var fDrag = PointProd(-cDrag * speed, playerVehicle.velocity);
    var fRR = PointProd(-cRR, playerVehicle.velocity);
    
    var force = PointSum(PointSum(fTraction, fDrag), fRR);
    
    force = PointProd((1.0 / 50.0), force);
    
    playerVehicle.velocity = PointSum(playerVehicle.velocity, PointProd(seconds, force));
    
    var parallel = PointProd(DotProduct(playerVehicle.velocity, direction), direction);
	var perpendicular = PointDiff(playerVehicle.velocity, parallel);

	playerVehicle.velocity = PointSum(parallel, PointProd(0.5, perpendicular));
    
    vehicle.position = PointSum(vehicle.position, PointProd(seconds, playerVehicle.velocity));
    
    if (playerVehicle.secondsRed > 0.0) {
        vehicle.color = Color3(1.0, 0.0, 0.0);
        
        playerVehicle.secondsRed -= seconds;
        
        if (playerVehicle.secondsRed < 0.0) {
            playerVehicle.secondsRed = 0.0;
            vehicle.color = Color3(0.0, 0.0, 1.0);
        }
    }
}