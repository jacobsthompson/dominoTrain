import {GRID_HEIGHT, GRID_WIDTH} from "./Constants";

function generateStartEnd(startOrEnd){
    let startX = 0;
    let startY = Math.floor(Math.random() * GRID_HEIGHT);
    let startValue = Math.floor(Math.random() * 6) + 1;

    if(startOrEnd === "end"){ startX = GRID_WIDTH-1; }
    return({
        dominoId: startOrEnd,
        col: startY,
        row: startX,
        y: startY,
        x: startX,
        value: startValue
    });
}

function generateDominoValues(count){
    let dominoValues = [];
    const startTile = generateStartEnd("start");
    const endTile = generateStartEnd("end");

    dominoValues.push(startTile.value);
    for(let i = 0; i < count-1; i++){
        let dValue = Math.floor(Math.random() * 6) + 1;
        dominoValues.push(dValue);
        dominoValues.push(dValue);
    }
    dominoValues.push(endTile.value);
    return { solution: dominoValues, start: startTile, end: endTile};
}

export default generateDominoValues;