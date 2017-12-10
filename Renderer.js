function Color() {
    return {
        red: 0.0,
        green: 0.0,
        blue: 0.0
    };
}

function Color3(red, green, blue) {
    return {
        red: red,
        green: green,
        blue: blue
    };
}

function CopyColor(to, from) {
    to.red   = from.red;
    to.green = from.green;
    to.blue  = from.blue;
}

function Camera() {
    return {
        pixelCoordRatio: 0.0,
        center: Point(),
        screenSize: Point(),
        
        zoomSpeed: 0.0,
        zoomTargetRatio: 0.0
    };
}

function Renderer() {
    return {
        canvas: null,
        context: null,
        
        camera: Camera()
    };
}

function SmoothZoom(camera, pixelCoordRatio) {
    camera.zoomTargetRatio = pixelCoordRatio;
}

function UpdateCamera(camera, seconds) {
    if (camera.pixelCoordRatio == camera.zoomTargetRatio) {
        return;
    }
    else if (camera.pixelCoordRatio < camera.zoomTargetRatio) {
        camera.pixelCoordRatio += seconds * camera.zoomSpeed;
        if (camera.pixelCoordRatio > camera.zoomTargetRatio) {
            camera.pixelCoordRatio = camera.zoomTargetRatio;
        }
    }
    else {
        camera.pixelCoordRatio -= seconds * camera.zoomSpeed;
        if (camera.pixelCoordRatio < camera.zoomTargetRatio) {
            camera.pixelCoordRatio = camera.zoomTargetRatio;
        }
    }
}

function CoordXtoPixel(camera, coordX) {
    return (0.5 * camera.screenSize.x) + (camera.pixelCoordRatio * (coordX - camera.center.x));
}

function CoordYtoPixel(camera, coordY) {
    return (0.5 * camera.screenSize.y) + (camera.pixelCoordRatio * (coordY - camera.center.y));
}

function PixelToCoord(camera, pixel) {
    var screenCenter = PointProd(0.5, camera.screenSize);
    
    return PointSum(camera.center, PointProd(1.0 / camera.pixelCoordRatio, PointDiff(pixel, screenCenter)));
}

function CoordToPixel(camera, coord) {
    var screenCenter = PointProd(0.5, camera.screenSize);
    
    return PointSum(screenCenter, PointProd(camera.pixelCoordRatio, PointDiff(coord, camera.center)));
}

function ByteHex(val) {
    var hex = val.toString(16);
    
    if (val < 16) hex = "0" + hex;
    
    return hex;
}

function GetColorCode(color) {
    var red   = Math.floor(color.red * 255);
    var green = Math.floor(color.green * 255);
    var blue  = Math.floor(color.blue * 255);
    
    var colorCode = "#" + ByteHex(red) + ByteHex(green) + ByteHex(blue);
    
    return colorCode;
}

function ClearScreen(renderer, color) {
    var canvas = renderer.canvas;
    var context = renderer.context;
    var colorCode = GetColorCode(color);
    
    context.restore();
    context.fillStyle = colorCode;
    context.rect(0, 0, canvas.width, canvas.height);
    context.fill();
}

function DrawLine(renderer, point1, point2, color, lineWidth) {
    var direction = PointDirection(point2, point1);
    
    var tmp = direction.x;
    direction.x = -direction.y;
    direction.y = tmp;
    
    var halfLineWidth = lineWidth * 0.5;
    var drawPoints = GenArray(Point, 4);
    
    drawPoints[0] = PointDiff(point1, PointProd(halfLineWidth, direction));
    drawPoints[1] = PointSum (point1, PointProd(halfLineWidth, direction));
    drawPoints[2] = PointSum (point2, PointProd(halfLineWidth, direction));
    drawPoints[3] = PointDiff(point2, PointProd(halfLineWidth, direction));
    DrawQuad(renderer, drawPoints, color);
}

function DrawRect(renderer, top, left, bottom, right, color) {
    var colorCode = GetColorCode(color);
    
    var camera = renderer.camera;
    var leftPixel   = CoordXtoPixel(camera, left);
    var rightPixel  = CoordXtoPixel(camera, right);
    var topPixel    = CoordYtoPixel(camera, top);
    var bottomPixel = CoordYtoPixel(camera, bottom);
    
    var context = renderer.context;
    context.fillStyle = colorCode;
    context.beginPath();
        context.moveTo(leftPixel, topPixel);
        context.lineTo(rightPixel, topPixel);
        context.lineTo(rightPixel, bottomPixel);
        context.lineTo(leftPixel, bottomPixel);
    context.fill();
}

function DrawQuad(renderer, points, color) {
    var colorCode = GetColorCode(color);
    
    var pixels = [
        CoordToPixel(renderer.camera, points[0]),
        CoordToPixel(renderer.camera, points[1]),
        CoordToPixel(renderer.camera, points[2]),
        CoordToPixel(renderer.camera, points[3])
    ];
    
    var context = renderer.context;
    context.fillStyle = colorCode;
    context.beginPath();
        context.moveTo(pixels[0].x, pixels[0].y);
        context.lineTo(pixels[1].x, pixels[1].y);
        context.lineTo(pixels[2].x, pixels[2].y);
        context.lineTo(pixels[3].x, pixels[3].y);
    context.fill();
}