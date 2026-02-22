import {GRID_HEIGHT, GRID_WIDTH} from "./Constants";

// UTILITIES

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

function makeEmptyGrid(){
    return Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
}

// BFS SEARCH TOOLS

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

function BFS(grid, startingTile, endTile){
    let currentTile = {dominoId: startingTile.dominoId, x: startingTile.x, y: startingTile.y, value: startingTile.value, prevTile: null};
    const verifiedGrid = makeEmptyGrid();
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

// CORRECT PATH / TRIM SUCCESSFUL PATH TOOLS

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

function trimPath(grid, startingTile, endTile){
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

    return grid.map(row =>
        row.map(cell => {
            if (cell === null) return null;
            return ids[cell.dominoId] > 1 ? cell : null;
        })
    );
}

function correctPath(grid, startingTile, endTile){
    const trimmedGrid = trimPath(grid, startingTile, endTile);
    return remove2x2Squares(trimmedGrid, startingTile, endTile);
}

// UNSUCCESSFUL + PARTIAL PATH TOOLS

function removeInvalidEnd(grid, endTile){
    let lastTile = grid[endTile.y][endTile.x];
    if(lastTile) {
        const invalidEnd = (lastTile.value !== endTile.value);
        return grid.map(row =>
            row.map(cell => {
                if (cell === null) return null;
                return (cell.dominoId === lastTile.dominoId && invalidEnd) ? null : cell;
            })
        );
    } else {
        return grid;
    }
}

function confirmInvalidAdjacent(grid, currTile, startTile, endTile){
    const invalidTiles = [];
    const adjTiles = searchAdjacent(grid, currTile.x, currTile.y);

    for(const tile of adjTiles){
        if(tile.tile !== null && tile.tile !== undefined) {
            if (tile.tile.value !== currTile.value && tile.tile.dominoId !== currTile.dominoId) {
                invalidTiles.push(tile);
            }
        }
    }

    return invalidTiles;
}

function trimInvalidPath(grid, startingTile, endTile){
    const ids = {};
    for(let col = 0; col < GRID_HEIGHT; col++){
        for(let row = 0; row < GRID_WIDTH; row++){
            if(grid[col][row] !== null){
                let currentTile = grid[col][row];
                let adjTiles = confirmInvalidAdjacent(grid, currentTile, startingTile, endTile);
                if(adjTiles.length > 0){
                    ids[currentTile.dominoId] = (ids[currentTile.dominoId] || 0) + 1;
                }
            }
        }
    }

    return grid.map(row =>
        row.map(cell => {
            if (cell === null) return null;
            return ids[cell.dominoId] > 0 ? null : cell;
        })
    );
}

// SQUARE RULE TOOLS

function fixInvalidSuccess(grid, startingTile, endTile){
    let lastTile = grid[endTile.y][endTile.x];
    if(lastTile) {
        const correctedGrid = trimPath(grid, startingTile, endTile);
        return BFS(correctedGrid, startingTile, endTile).verifiedGrid;
    } else {
        return grid;
    }
}

function removeDomino(grid, dominoToRemove){
    return grid.map(row =>
        row.map(cell => {
            if (cell === null) return null;
            return cell.dominoId === dominoToRemove ? null : cell;
        })
    );
}

function remove2x2Squares(grid, startingTile, endTile){

    let squaredDominos = {};

    for(let col = 0; col < GRID_HEIGHT-1; col++){
        for(let row = 0; row < GRID_WIDTH-1; row++){
            const cells = [grid[col][row], grid[col+1][row], grid[col][row+1], grid[col+1][row+1]];

            if(cells.every(cell => (cell !== null && cell !== undefined))){
                cells.forEach(cell => squaredDominos[cell.dominoId] = (squaredDominos[cell.dominoId] || 0) + 1);
            }
        }
    }

    const squaredDominoIds = Object.entries(squaredDominos).map(([dominoId, instances]) => parseInt(dominoId));
    let validAdjacentTotals = {};

    for(const targetDomino of squaredDominoIds) {
        for (let col = 0; col < GRID_HEIGHT; col++) {
            for (let row = 0; row < GRID_WIDTH; row++) {

                let currentDomino = grid[col][row];

                if(currentDomino === null || currentDomino === undefined) continue;
                if(currentDomino.dominoId === targetDomino) continue;
                if(!squaredDominoIds.includes(currentDomino.dominoId)) continue;

                if(!validAdjacentTotals[currentDomino.dominoId]){ validAdjacentTotals[currentDomino.dominoId] = 0 }
                if(currentDomino.x === startingTile.x && currentDomino.y === startingTile.y){ validAdjacentTotals[currentDomino.dominoId] += 100 }

                const adjTiles = searchAdjacent(grid, currentDomino.x, currentDomino.y);
                for(const tile of adjTiles){
                    if(tile.tile){
                        const currentTile = tile.tile;
                        if(currentTile.value === currentDomino.value && currentTile.dominoId !== targetDomino){
                            validAdjacentTotals[currentDomino.dominoId]++;
                        }
                    }
                }
            }
        }
    }

    const leastValidDominos = Object.entries(validAdjacentTotals).map(([dominoId, count]) => parseInt(dominoId));
    let returnGrids = [];

    for(const invalidDomino of leastValidDominos){
        const removedGrid = removeDomino(grid, invalidDomino);

        let analyzedGrid = BFS(removedGrid, startingTile, endTile).verifiedGrid;
        analyzedGrid = trimInvalidPath(analyzedGrid, startingTile, endTile);
        analyzedGrid = remove2x2Squares(analyzedGrid, startingTile, endTile);
        analyzedGrid = BFS(analyzedGrid, startingTile, endTile).verifiedGrid;

        const returnScore = calculateScore(analyzedGrid);
        returnGrids.push({grid: removedGrid, score: returnScore});
    }

    const leastValidGridScore = Math.max(...returnGrids.map(grid => grid.score));

    const returnGrid = returnGrids
        .filter(grid => grid.score === leastValidGridScore)
        .map(grid => grid.grid);

    return returnGrid[0] ? returnGrid[0] : grid;
}

// VALIDATE DOMINO PATH MAIN FUNCTION

function validateDominoPath(grid, startingTile, endTile) {
    let score = 0;
    let { verifiedGrid, foundGoal} = BFS(grid, startingTile, endTile);
    let correctedGrid = correctPath(verifiedGrid, startingTile, endTile);
    const initialGrid = verifiedGrid;

    while(!compareGrid(verifiedGrid, correctedGrid)){
        let newSearch = BFS(correctedGrid, startingTile, endTile);
        verifiedGrid = newSearch.verifiedGrid;
        foundGoal = newSearch.foundGoal;
        correctedGrid = correctPath(verifiedGrid, startingTile, endTile);
    }


    if (foundGoal) {
        score = calculateScore(verifiedGrid);
    } else {
        verifiedGrid = removeInvalidEnd(initialGrid,endTile);
        let squaredGrid = remove2x2Squares(verifiedGrid, startingTile, endTile);

        while(!compareGrid(verifiedGrid, squaredGrid)){
            verifiedGrid = BFS(squaredGrid, startingTile, endTile).verifiedGrid;
            squaredGrid = remove2x2Squares(verifiedGrid, startingTile, endTile);
        }

        verifiedGrid = fixInvalidSuccess(verifiedGrid, startingTile, endTile);
        score = calculateScore(verifiedGrid);
    }

    return { verifiedGrid, score, foundGoal };
}

export default validateDominoPath;