function False() {
    return false;
}

function Integer() {
    return 0;
}

function Null() {
    return null;
}

function GenArray(typeFunc, count) {
    var result = [];
    
    for (var i = 0; i < count; ++i) {
        result[i] = typeFunc();
    }
    
    return result;
}