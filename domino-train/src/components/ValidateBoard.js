import {GRID_HEIGHT, GRID_WIDTH} from "./Constants";

function printGrid(grid, message) {
    console.log('=======',message,'=======');
    grid.forEach((row,y) => {
        const rowString = row.map((cell,x) => {
            if(cell === null){
                return '.';
            }
            return cell.value;
        }).join(' ');
        console.log(`Row ${y}: ${rowString}`);
    });
    console.log("=======================");
}

function compareGrid(grid1, grid2){
    let gridsEqual = true;

    for(let col = 0; col < GRID_HEIGHT; col++){
        for(let row = 0; row < GRID_WIDTH; row++){
            if(grid1[col][row] !== grid2[col][row]){
                gridsEqual = false;
                return gridsEqual;
            }
        }
    }
    return gridsEqual;
}

function setTile(newTile, newX, newY, previousTile){
    return ({
        dominoId: newTile.dominoId,
        x: newX,
        y: newY,
        value: newTile.value,
        prevTile: previousTile
    });
}

function searchAdjacent (grid, x, y) {
    return ([{tile: grid[y+1]?.[x], x: x, y: y+1}, {tile: grid[y-1]?.[x], x: x, y: y-1}, {tile: grid[y]?.[x+1], x: x+1, y: y}, {tile: grid[y]?.[x-1], x: x-1, y: y}]);
}

function findValidAdjacent(grid, visitedSet, currTile, endTile, foundGoal){
    const validTiles = [];

    if ((currTile.x === endTile.x && currTile.y === endTile.y && currTile.value === endTile.value) && !foundGoal){
            validTiles.push(currTile);
            return validTiles;
    }

    const adjTiles = searchAdjacent(grid, currTile.x, currTile.y);
    for(const tile of adjTiles){
        const tileKey = `${tile.x},${tile.y}`;

        if ((tile.tile?.value === currTile.value || tile.tile?.dominoId === currTile.dominoId) && (!visitedSet.has(tileKey))) {
            let validTile = setTile(tile.tile, tile.x, tile.y, currTile);
            validTiles.push(validTile);
        }
    }
    return validTiles;
}

function confirmValidAdjacent(grid, currTile, startTile, endTile){
    const validTiles = [];
    const adjTiles = searchAdjacent(grid, currTile.x, currTile.y);

    if ((currTile.x === startTile.x && currTile.y === startTile.y) || (currTile.x === endTile.x && currTile.y === endTile.y)){
            validTiles.push(currTile);
    }

    for(const tile of adjTiles){
        if(tile.tile !== null && tile.tile !== undefined) {
            if (tile.tile.value === currTile.value || tile.tile.dominoId === currTile.dominoId) {
                validTiles.push(tile);
            }
        }
    }
    return validTiles;
}

function remove2x2Squares(grid){
    let inSquareDominos = {};
    for(let col = 0; col < GRID_HEIGHT-1; col++){
        for(let row = 0; row < GRID_WIDTH-1; row++){
            if(
                (grid[col][row] !== null && grid[col][row] !== undefined) &&
                (grid[col+1][row] !== null && grid[col][row] !== undefined) &&
                (grid[col][row+1] !== null && grid[col][row] !== undefined) &&
                (grid[col+1][row+1] !== null && grid[col][row] !== undefined)
            ){
                inSquareDominos[grid[col][row].dominoId] = (inSquareDominos[grid[col][row].dominoId] || 0) + 1;
                inSquareDominos[grid[col+1][row].dominoId] = (inSquareDominos[grid[col+1][row].dominoId] || 0) + 1;
                inSquareDominos[grid[col][row+1].dominoId] = (inSquareDominos[grid[col][row+1].dominoId] || 0) + 1;
                inSquareDominos[grid[col+1][row+1].dominoId] = (inSquareDominos[grid[col+1][row+1].dominoId] || 0) + 1;
            }
        }
    }

    const mostTouchedDominoCount = Math.max(...Object.values(inSquareDominos))
    const mostTouchedDominos = Object.entries(inSquareDominos)
        .filter(([dominoId, count]) => count === mostTouchedDominoCount)
        .map(([dominoId, count]) => parseInt(dominoId));

    let validAdjacentDominos = {};
    for(let col = 0; col < GRID_HEIGHT; col++) {
        for (let row = 0; row < GRID_WIDTH; row++) {
            let currentTile = grid[col][row];
            if(currentTile !== null && currentTile !== undefined){
                if(mostTouchedDominos.includes(currentTile.dominoId)){
                    validAdjacentDominos[currentTile.dominoId] = 0;
                    const adjTiles = searchAdjacent(grid, currentTile.x, currentTile.y);
                    for(const tile of adjTiles){
                        if(tile?.tile?.value === currentTile.value && !(mostTouchedDominos.includes(tile?.tile?.dominoId))){
                            validAdjacentDominos[currentTile.dominoId] = validAdjacentDominos[currentTile.dominoId] + 1;
                        }
                    }
                }

            }
        }
    }

    const leastValidDominoCount = Math.min(...Object.values(validAdjacentDominos));
    return grid.map(row =>
        row.map(cell => {
            if (cell === null) return null;
            return validAdjacentDominos[cell.dominoId] === leastValidDominoCount ? null : cell;
        })
    );
}

function correctPath(grid, startingTile, endTile){
    const ids = {};
    for(let col = 0; col < GRID_HEIGHT; col++){
        for(let row = 0; row < GRID_WIDTH; row++){
            if(grid[col][row] !== null){
                let currentTile = grid[col][row];
                let adjTiles = confirmValidAdjacent(grid, currentTile, startingTile, endTile);
                if(adjTiles.length > 1){
                    ids[currentTile.dominoId] = (ids[currentTile.dominoId] || 0) + 1;
                }
            }
        }
    }

    const trimmedGrid = grid.map(row =>
        row.map(cell => {
            if (cell === null) return null;
            return ids[cell.dominoId] > 1 ? cell : null;
        })
    );

    return remove2x2Squares(trimmedGrid);
}

function BFS(grid, startingTile, endTile){
    let currentTile = {dominoId: startingTile.dominoId, x: startingTile.x, y: startingTile.y, value: startingTile.value, prevTile: null};
    const verifiedGrid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
    const visitedSet = new Set();
    let tilesToSearch = [];
    let foundGoal = false;

    if(grid[currentTile.y]?.[currentTile.x]?.value === currentTile.value){
        currentTile = setTile(grid[currentTile.y][currentTile.x], currentTile.x, currentTile.y, currentTile);
        tilesToSearch.push(currentTile);
        visitedSet.add(`${currentTile.x},${currentTile.y}`);

        while(tilesToSearch.length !== 0){
            currentTile = tilesToSearch.shift();
            verifiedGrid[currentTile.y][currentTile.x] = currentTile;

            let adjTiles = findValidAdjacent(grid, visitedSet, currentTile, endTile, foundGoal);
            if(adjTiles.length !== 0){
                for(const tile of adjTiles){
                    tilesToSearch.push(tile);
                    visitedSet.add(`${tile.x},${tile.y}`);
                }
            }

            if (currentTile.x === endTile.x && currentTile.y === endTile.y && currentTile.value === endTile.value){
                foundGoal = true;
            }
        }
    }
    return { verifiedGrid, foundGoal};
}

function calculateScore(grid){
    const ids = {};
    for(let col = 0; col < GRID_HEIGHT; col++){
        for(let row = 0; row < GRID_WIDTH; row++){
            if(grid[col][row] !== null){
                let currentTile = grid[col][row];
                ids[currentTile.dominoId] = 1;
            }
        }
    }

    return Object.keys(ids).length;
}

function validateDominoPath(grid, startingTile, endTile) {
    let score = 0;
    let { verifiedGrid, foundGoal} = BFS(grid, startingTile, endTile);
    let correctedGrid = correctPath(verifiedGrid, startingTile, endTile);

    while(!compareGrid(verifiedGrid, correctedGrid)){
        let newSearch = BFS(correctedGrid, startingTile, endTile);
        verifiedGrid = newSearch.verifiedGrid;
        foundGoal = newSearch.foundGoal;
        correctedGrid = correctPath(verifiedGrid, startingTile, endTile);
    }

    if (foundGoal) {
        score = calculateScore(verifiedGrid);
        // printGrid(verifiedGrid, "SUCCESS");
        return { verifiedGrid, score};
    } else {
        score = 0;
        verifiedGrid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
        // printGrid(verifiedGrid, "FAILURE");
        return { verifiedGrid, score };
    }

}

export default validateDominoPath;