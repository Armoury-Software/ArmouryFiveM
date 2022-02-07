const Delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const isPlayerInArea = (playerPosX: number, playerPosY: number, playerPosZ: number, areaMinX: number, areaMinY: number, areaMinZ: number, areaMaxX: number, areaMaxY: number, areaMaxZ: number): boolean => {
    return playerPosX >= areaMinX && playerPosX <= areaMaxX && playerPosY >= areaMinY && playerPosY <= areaMaxY && playerPosZ >= areaMinZ && playerPosZ <= areaMaxZ
}

const isPlayerInRangeOfPoint = (playerPosX: number, playerPosY: number, playerPosZ: number, pointX: number, pointY: number, pointZ: number, range: number): boolean => {
    return playerPosX >= pointX - range && playerPosX <= pointX + range && playerPosY >= pointY - range && playerPosY <= pointY + range && playerPosZ >= pointZ - range && playerPosZ <= pointZ + range;
}

const waitUntilThenDo = async (condition: Function, func: Function) => {
    let attempts: number = 0;

    while (!condition()) {
        if (attempts > 50) {
            return;
        }

        await Delay(10);
    }

    func();
};

const calculateDistance = (pos: number[]) => {
    var a = pos[3] - pos[0];
    var b = pos[4] - pos[1];
    var c = pos[5] - pos[2];

    return Math.hypot(a, b, c);
}

const numberWithCommas = (x: number) => {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

const isJSON = (str: string): boolean => {
    if ( /^\s*$/.test(str) ) return false;
    str = str.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@');
    str = str.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']');
    str = str.replace(/(?:^|:|,)(?:\s*\[)+/g, '');
    return (/^[\],:{}\s]*$/).test(str);
}

export { Delay, isPlayerInArea, isPlayerInRangeOfPoint, waitUntilThenDo, numberWithCommas, isJSON };