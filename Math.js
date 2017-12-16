function Min2(x, y) {
    if (x < y) return x;
    else return y;
}

function Max2(x, y) {
    if (x > y) return x;
    else return y;
}

function RandomBetween(min, max) {
    return (min) + ((max - min) * Math.random());
}

function IsBetween(test, min, max) {
    return (min <= test && test <= max);
}

function IsPointInRect(point, left, right, top, bottom) {
    if (point.x < left || point.x > right) return false;
    if (point.y < top || point.y > bottom) return false;
    
    return true;
}