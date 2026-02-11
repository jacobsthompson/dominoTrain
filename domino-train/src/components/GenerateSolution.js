import {GRID_HEIGHT, GRID_WIDTH} from "./Constants";

function generateStartEnd(){
    let startX = 0;
    let startY = Math.floor(Math.random() * GRID_HEIGHT);
    let startValue = Math.floor(Math.random() * 6) + 1;

    let endX = GRID_WIDTH-1;
    let endY = Math.floor(Math.random() * GRID_HEIGHT);
    let endValue = Math.floor(Math.random() * 6) + 1;
    if(Math.abs(startY - endY) % 2 !== 0){
        if(endY === GRID_HEIGHT-1){
            endY--;
        } else {
            endY++;
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

function generateDominoValues(count){
    let dominoValues = [];
    const { startTile, endTile } = generateStartEnd();

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