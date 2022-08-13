const Delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const isPlayerInArea = (playerPosX: number, playerPosY: number, playerPosZ: number, areaMinX: number, areaMinY: number, areaMinZ: number, areaMaxX: number, areaMaxY: number, areaMaxZ: number): boolean => {
    return playerPosX >= areaMinX && playerPosX <= areaMaxX && playerPosY >= areaMinY && playerPosY <= areaMaxY && playerPosZ >= areaMinZ && playerPosZ <= areaMaxZ
}

const isPlayerInRangeOfPoint = (playerPosX: number, playerPosY: number, playerPosZ: number, pointX: number, pointY: number, pointZ: number, range: number): boolean => {
    return calculateDistance([playerPosX, playerPosY, playerPosZ, pointX, pointY, pointZ]) <= range;
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

export const calculateDistance = (pos: number[]) => {
    var a = pos[3] - pos[0];
    var b = pos[4] - pos[1];
    var c = pos[5] - pos[2];

    return Math.hypot(a, b, c);
}

export const calculateDistanceInKm = (pos: number[]) => {
    var a = pos[3] - pos[0];
    var b = pos[4] - pos[1];
    var c = pos[5] - pos[2];

    return Math.hypot(a, b, c) * 0.004;
}

export const getRandomPositionInsideArea = (x1: number, x2: number, y1: number, y2: number): [number, number] => {
    const sortedXs = [x1, x2].sort((current, previous) => current <= previous ? -1 : 1);
    const sortedYs = [y1, y2].sort((current, previous) => current <= previous ? -1 : 1);
    const [lowestX, highestX] = [sortedXs[0], sortedXs.slice(-1)[0]];
    const [lowestY, highestY] = [sortedYs[0], sortedYs.slice(-1)[0]];

    return [lowestX + (Math.random() * (highestX - lowestX)), lowestY + (Math.random() * (highestY - lowestY))];
}

export const isPositionIn2DArea = (x: number, y: number, x1: number, x2: number, y1: number, y2: number): boolean => {
    const sortedXs = [x1, x2].sort((current, previous) => current <= previous ? -1 : 1);
    const sortedYs = [y1, y2].sort((current, previous) => current <= previous ? -1 : 1);
    const [lowestX, highestX] = [sortedXs[0], sortedXs.slice(-1)[0]];
    const [lowestY, highestY] = [sortedYs[0], sortedYs.slice(-1)[0]];

    return x >= lowestX && x <= highestX && y >= lowestY && y <= highestY;
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

export const phoneFormatted = (phone: number) => {
    const filteredValue: string = phone.toString().replace('-', '');
    if (filteredValue.length > 3) {
        return `${filteredValue.substring(0, 3)}-${filteredValue.substring(3)}`;
    }

    return phone.toString();
}

const suffixes: string[] = ['k', 'M', 'G', 'T', 'P', 'E'];

export const toThousandsString = (input: number, args?: number): string | number => {
    let isNegative: boolean = input < 0;
    input = Math.abs(input);

    if (Number.isNaN(input)) {
        return null;
    }

    if (input < 1000) {
        return input;
    }

    const exp: number = Math.floor(Math.log(input) / Math.log(1000));
    return (
        (isNegative ? '-' : '') + (input / Math.pow(1000, exp)).toFixed(args) + suffixes[exp - 1]
    );
}

export const fromThousandsString = (input: string): number => {
    const existingSuffix: string =
        (input.match(/[a-zA-Z]/) || []).pop() || '';

    if (!existingSuffix) {
        return Number(input);
    }

    const existingNumber: number = Number(input.match(/\d+/)[0]);
    return (
        existingNumber *
        Math.pow(
            1000,
            1 +
                suffixes
                    .map((suffix: string) => suffix.toLowerCase())
                    .indexOf(existingSuffix.toLowerCase())
        )
    );
}

export const toTitleCase = (str) => {
    return str.replace(
        /\w\S*/g,
        function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

export { Delay, isPlayerInArea, isPlayerInRangeOfPoint, waitUntilThenDo, numberWithCommas, isJSON };