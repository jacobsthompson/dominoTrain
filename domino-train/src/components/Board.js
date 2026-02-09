import {CELL_SIZE} from "./Constants";
import './style.css'

function checkValidCell(grid, validatedGrid, x,y) {
    if(!validatedGrid.every(row => row.every(cell => cell === null))) {
        if (grid[y][x] !== null) {
            if (validatedGrid[y][x] !== null) {
                return '0 0 9px #4CAF50'
            } else {
                return '0 0 9px red'
            }
        }
    }
    return 'none';
}

function Board({grid, validatedGrid}){
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
                                boxShadow: validatedGrid ? checkValidCell(grid, validatedGrid,x,y) : 'none'
                            }}
                        />
                    ))}
                </div>
            ))}
        </div>
    );
}

export default Board;