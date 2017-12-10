function PlayerHuman() {
    return {
        human: Human(),
        
        moveUp:    false,
        moveDown:  false,
        moveLeft:  false,
        moveRight: false,
        
        moveDirection: Point()
    };
}

function MoveHuman(human, moveVector) {
    var map = human.map;
    
    var distanceToGo = VectorLength(moveVector);
    
    while (distanceToGo > 0.0) {
        var go = true;
        var isTouchingLine = false;
        var crossInfo = BuildingCrossInfo();
        crossInfo.type = CrossNone;
        
        var pointToGo = PointSum(human.position, moveVector);

        if (human.inBuilding != null) {
            var isInBuilding = IsPointInExtBuilding(human.position, human.inBuilding, humanRadius);
    
            if (isInBuilding) {
                crossInfo = ExtBuildingInsideClosestCrossInfo(human.inBuilding, humanRadius, human.position, pointToGo);
            }
            else {
                human.inBuilding = null;
            }
        }
        else {
            crossInfo = ClosestExtBuildingCrossInfo(human.map, humanRadius, human.position, pointToGo);
            
            if (crossInfo.type == CrossEntrance) {
                human.inBuilding = crossInfo.building;
            }
        }
        
        if (crossInfo.type == CrossWall) {
            var crossedBuilding = crossInfo.building;
            
            var crossPoint = crossInfo.crossPoint;
            
            var distanceTaken = Distance(human.position, crossPoint);
            
            var moveNormal = PointProd(1.0 / VectorLength(moveVector), moveVector);
            
            var wallDirection = PointDiff(crossInfo.corner1, crossInfo.corner2);
            moveVector = ParallelVector(moveVector, wallDirection);
            
            distanceToGo = VectorLength(moveVector);
            
            go = false;
        }
        
        if (go) {
            human.position = pointToGo;
            distanceToGo = 0.0;
        }
    }
}

function UpdatePlayerHuman(playerHuman, seconds) {
    playerHuman.moveDirection = Point2(0.0, 0.0);
    
    var moveX = false;
    var moveY = false;
    
    if (playerHuman.moveLeft) {
        playerHuman.moveDirection.x = -1.0;
        moveX = true;
    }
    
    if (playerHuman.moveRight) {
        playerHuman.moveDirection.x = 1.0;
        moveX = true;
    }
    
    if (playerHuman.moveUp) {
        playerHuman.moveDirection.y = -1.0;
        moveY = true;
    }
    
    if (playerHuman.moveDown) {
        playerHuman.moveDirection.y = 1.0;
        moveY = true;
    }
    
    if (moveX && moveY) playerHuman.moveDirection = PointProd(1.0 / Math.sqrt(2.0), playerHuman.moveDirection);
    
    var moveVector = PointProd(humanMoveSpeed * seconds, playerHuman.moveDirection);
    
    MoveHuman(playerHuman.human, moveVector);
}