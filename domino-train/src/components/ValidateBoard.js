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

function removeDomino(grid, dominoToRemove){
    return grid.map(row =>
        row.map(cell => {
            if (cell === null) return null;
            return cell.dominoId === dominoToRemove ? null : cell;
        })
    );
}

function remove2x2Squares(grid, startingTile, endTile){
    console.log("Enter");
    printGrid(grid, "START");

    let squaredDominos = {};
    for(let col = 0; col < GRID_HEIGHT-1; col++){
        for(let row = 0; row < GRID_WIDTH-1; row++){
            const cells = [grid[col][row], grid[col+1][row], grid[col][row+1], grid[col+1][row+1]];

            if(cells.every(cell => (cell !== null && cell !== undefined))){
                cells.forEach(cell => squaredDominos[cell.dominoId] = (squaredDominos[cell.dominoId] || 0) + 1);
            }
        }
    }
    console.log("squaredDominos:", squaredDominos);

    const squaredDominoIds = Object.entries(squaredDominos)
        .filter(([dominoId, instances]) => instances === Math.max(...Object.values(squaredDominos)))
        .map(([dominoId, instances]) => parseInt(dominoId));
    let validAdjacentTotals = {};

    console.log("squaredDominoIds:", squaredDominoIds)

    // for(const targetDomino of squaredDominoIds) {
        // console.log("targetDomino:", targetDomino);
        for (let col = 0; col < GRID_HEIGHT; col++) {
            for (let row = 0; row < GRID_WIDTH; row++) {

                let currentDomino = grid[col][row];
                // console.log("currentDomino:", currentDomino);

                if(currentDomino === null || currentDomino === undefined) continue;
                // console.log("NULL PASS. currentDomino:", currentDomino);
                // if(currentDomino.dominoId === targetDomino) continue;
                // console.log("TARGET PASS. currentDomino:", currentDomino);
                if(!squaredDominoIds.includes(currentDomino.dominoId)) continue;
                // console.log("SQUARE PASS. currentDomino:", currentDomino);


                if(!validAdjacentTotals[currentDomino.dominoId]){ validAdjacentTotals[currentDomino.dominoId] = 0 }
                if(currentDomino.x === startingTile.x && currentDomino.y === startingTile.y){ validAdjacentTotals[currentDomino.dominoId] += 100 }

                console.log("currentDomino:", currentDomino);

                const adjTiles = searchAdjacent(grid, currentDomino.x, currentDomino.y);
                for(const tile of adjTiles){
                    if(tile.tile){
                        const currentTile = tile.tile;
                        if(currentTile.value === currentDomino.value && currentTile.dominoId !== currentDomino.dominoId){
                            validAdjacentTotals[currentDomino.dominoId]++;
                        }
                    }
                }
            }
        }
    // }

    console.log("validAdjacentTotals", validAdjacentTotals);

    const minAdjacentCount = Math.min(...Object.values(validAdjacentTotals));
    const leastValidDominos = Object.entries(validAdjacentTotals)
        .filter(([dominoId, count]) => count === minAdjacentCount)
        .map(([dominoId, count]) => parseInt(dominoId));

    console.log("minAdjacentCount", minAdjacentCount);
    console.log("leastValidDominos", leastValidDominos);

    const returnGrid = removeDomino(grid, leastValidDominos[0]);
    printGrid(returnGrid,"END");
    return returnGrid;
}



function rremove2x2Squares(grid, startingTile, endTile){
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

    const involvedDominos = Object.entries(inSquareDominos).map(([dominoId, count]) => parseInt(dominoId));
    let validAdjacentDominos = {};

    for(let col = 0; col < GRID_HEIGHT; col++) {
        for (let row = 0; row < GRID_WIDTH; row++) {
            let currentTile = grid[col][row];
            if(currentTile !== null && currentTile !== undefined){
                if(involvedDominos.includes(currentTile.dominoId)){
                    if(!validAdjacentDominos[currentTile.dominoId] > 0){
                        validAdjacentDominos[currentTile.dominoId] = 0;
                    }

                    if(currentTile.x === startingTile.x && currentTile.y === startingTile.y){
                        validAdjacentDominos[currentTile.dominoId] += 100;
                    }

                    const adjTiles = searchAdjacent(grid, currentTile.x, currentTile.y);
                    for(const tile of adjTiles){
                        // console.log(currentTile.dominoId, tile?.tile?.dominoId, tile?.tile?.value === currentTile.value,!involvedDominos.includes(tile.dominoId) );
                        if(tile?.tile?.value === currentTile.value && !involvedDominos.includes(tile?.tile?.dominoId)){
                            validAdjacentDominos[currentTile.dominoId] += 1;
                        }
                    }
                    // console.log(currentTile, adjTiles, validAdjacentDominos[currentTile.dominoId])
                }

            }
        }
    }

    const leastValidDominoCount = Math.min(...Object.values(validAdjacentDominos));
    const leastValidDominos = Object.entries(validAdjacentDominos)
        .filter(([dominoId, count]) => count === leastValidDominoCount)
        .map(([dominoId, count]) => parseInt(dominoId));
    console.log("leastValidDominos:", leastValidDominos);

    let dominoToRemove = leastValidDominos[0];
    let returnGrid = removeDomino(grid, dominoToRemove);
    let scoreToCompare = 0;
    console.log("scoreToCompare:", scoreToCompare);
    for(const domino of leastValidDominos){
        let nextGrid = removeDomino(grid, domino);
        let BFSGrid = BFS(nextGrid, startingTile, endTile).verifiedGrid;
        let newScore = calculateScore(BFSGrid);
        if(newScore > scoreToCompare){
            scoreToCompare = newScore;
            returnGrid = nextGrid;
            printGrid(nextGrid,domino.toString());
            printGrid(BFSGrid, "BFS");
            console.log("newScore:", newScore);
        }
    }

    console.log("Final Score:", calculateScore(returnGrid));
    printGrid(returnGrid,"RETURN GRID")
    return returnGrid;
}

function removeInvalidEnd(grid, endTile){
    let lastTile = grid[endTile.y][endTile.x];
    console.log(lastTile);
    if(lastTile) {
        const invalidEnd = (lastTile.value !== endTile.value);
        console.log(invalidEnd);
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

    return remove2x2Squares(trimmedGrid, startingTile, endTile);
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
    const initialGrid = verifiedGrid;

    while(!compareGrid(verifiedGrid, correctedGrid)){
        let newSearch = BFS(correctedGrid, startingTile, endTile);
        verifiedGrid = newSearch.verifiedGrid;
        foundGoal = newSearch.foundGoal;
        correctedGrid = correctPath(verifiedGrid, startingTile, endTile);
    }

    console.log("TRIMMED COMPLETE")

    if (foundGoal) {
        console.log("FOUND GOAL")
        score = calculateScore(verifiedGrid);
    } else {
        score = 0;
        verifiedGrid = removeInvalidEnd(initialGrid, endTile);
        console.clear();
        console.log("INITIAL START");
        let squaredGrid = remove2x2Squares(verifiedGrid, startingTile, endTile);
        console.log("INITIAL END");
        while(!compareGrid(verifiedGrid, squaredGrid)){
            console.log("LOOP START");
            let newSearch = BFS(squaredGrid, startingTile, endTile);
            verifiedGrid = newSearch.verifiedGrid;
            foundGoal = newSearch.foundGoal;
            squaredGrid = remove2x2Squares(verifiedGrid, startingTile, endTile);
            console.log("LOOP END");
        }
        console.log("WHILE LOOP EXITED")
    }
    return { verifiedGrid, score, foundGoal };
}

export default validateDominoPath;