import './style.css'

function checkValidCell(grid, validatedGrid, x,y) {
    if (grid[y][x] !== null) {
        if (validatedGrid[y][x] !== null) {
            return '0 0 0.5rem #4CAF50'
        } else {
            return '0 0 0.5rem #D44444'
        }
    }
}

function checkFullCell(grid, x, y){
    return grid[y][x] !== null
}

// style={{boxShadow: (solutionFound && score === topScore) ? '0 0 0.5rem #4CAF50' : 'none'}}

function Board({grid, validatedGrid, solutionFound, score, topScore, CELL_SIZE}){
    return(
        <div className="board" id={"board"}>
            {grid.map((row,y) =>(
                <div key={y} style={{display: 'flex'}}>
                    {row.map((cell,x) => (
                        <div
                            className="cell"
                            key={`${x}-${y}`}
                            style={{
                                width: CELL_SIZE,
                                height: CELL_SIZE,
                                boxShadow: (solutionFound && validatedGrid) ? checkValidCell(grid, validatedGrid,x,y) : 'none',
                                zIndex: checkFullCell(grid,x,y) ? 1 : 0,
                                borderRadius: checkFullCell(grid,x,y) ? '0.5rem' : '0'

                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export default Board;