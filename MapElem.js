var MapElemNone         = 0;
var MapElemRoad         = 1;
var MapElemIntersection = 2;
var MapElemBuilding     = 3;

function MapElem() {
    return {
        type: 0,
        
        building:     null,
        intersection: null,
        road:         null
    }
}

function CopyMapElem(to, from) {
    to.type = from.type;
    
    to.building     = from.building;
    to.intersection = from.intersection;
    to.road         = from.road;
}

function MapElemEqual(elem1, elem2) {
    if (elem1.type == MapElemRoad && elem2.type == MapElemRoad
        && elem1.road == elem2.road) return true;
        
    if (elem1.type == MapElemIntersection && elem2.type == MapElemIntersection
        && elem1.intersection == elem2.intersection) return true;
        
    if (elem1.type == MapElemBuilding && elem2.type == MapElemBuilding
        && elem1.building == elem2.building) return true;
        
    return false;
}