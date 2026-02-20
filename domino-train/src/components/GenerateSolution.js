import {GRID_HEIGHT, GRID_WIDTH} from "./Constants";

function seededRandomization(seed) {
  return function() {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash;
}

function shuffle(arr, random) {
  	for (let i = arr.length - 1; i > 0; i--) {
    	const j = Math.floor(random() * (i + 1));
    	[arr[i], arr[j]] = [arr[j], arr[i]];
  	}
  	return arr;
}

function generateStartEnd(random){
    let startX = 0;
    let startY = Math.floor(random() * GRID_HEIGHT);
    let startValue = Math.floor(random() * 6) + 1;

    let endX = GRID_WIDTH-1;
    let endY = Math.floor(random() * GRID_HEIGHT);
    let endValue = Math.floor(random() * 6) + 1;
    if(Math.abs(startY - endY) % 2 !== 0){
        if(endY === GRID_HEIGHT-1){
            endY--;
        } else if(endY === 0){
            endY++;
        } else {
            random() >= 0.5 ? endY++ : endY--;
        }
    }

    const startTile = {
        dominoId: "start",
        y: startY,
        x: startX,
        value: startValue
    }

    const endTile = {
        dominoId: "end",
        y: endY,
        x: endX,
        value: endValue
    }

    return({startTile, endTile});
}

function generateDominoValues(count, seed = null){
    const random = seed !== null ? seededRandomization(hashString(seed)) : Math.random.bind(Math);

    let dominoValues = [];
    const { startTile, endTile } = generateStartEnd(random);

    dominoValues.push(startTile.value);
    for(let i = 0; i < count-1; i++){
        let dValue = Math.floor(random() * 6) + 1;
        dominoValues.push(dValue);
        dominoValues.push(dValue);
    }
    dominoValues.push(endTile.value);

    let swapList = [];
    for(let i = 0; i < count; i++){
        const swap = random() > 0.5;
        if(swap){
            let tempValue = dominoValues[i*2];
            dominoValues[i*2] = dominoValues[i*2+1];
            dominoValues[i*2+1] = tempValue;
        }
        swapList.push([dominoValues[i*2], dominoValues[i*2+1]]);
    }

    swapList = shuffle(swapList, random);

    const solution = []
    for(let i = 0; i < swapList.length; i++){
        solution.push(swapList[i][0]);
        solution.push(swapList[i][1]);
    }

    return { solution: solution, start: startTile, end: endTile};
}

export default generateDominoValues;