function Vehicle() {
    return {
        position: Point(),
        
        angle: 0.0,
        
        color: Color(),
        
        length: 0.0,
        width: 0.0,
        
        maxSpeed: 0.0,
        
        map: null
    };
}

function MoveVehicle(vehicle, point) {
    CopyPoint(vehicle.position, point.position);
    vehicle.angle = VectorAngle(point.direction);
}

function DrawVehicle(renderer, vehicle) {
    var addWidth = PointProd((vehicle.width * 0.5), RotationVector(vehicle.angle + Math.PI * 0.5));
    var addLength = PointProd((vehicle.length * 0.5), RotationVector(vehicle.angle));
    
    var side1 = PointSum(vehicle.position, addWidth);
    var side2 = PointDiff(vehicle.position, addWidth);
    
    var points = [
        PointSum(side1, addLength),
        PointDiff(side1, addLength),
        PointDiff(side2, addLength),
        PointSum(side2, addLength)
    ];
    
    DrawQuad(renderer, points, vehicle.color);
}