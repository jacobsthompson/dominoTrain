import {memo} from "react";
import {GRID_SIZE, CELL_SIZE} from "./constants";
import './style.css'

function Board({grid}){
    return(
        <div className="board" id="board" >
            {grid.map((row,y) =>(
                <div key={y} style={{display: 'flex'}}>
                    {row.map((cell,x) => (
                        <div
                            className="cell"
                            key={`${x}-${y}`}
                            style={{ width: CELL_SIZE, height: CELL_SIZE }}
                        >
                            {cell !== null ? cell.value : ''}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default memo(Board);