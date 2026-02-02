import {memo} from "react";
import {GRID_SIZE, CELL_SIZE} from "./constants";

function Board({grid}){
    return(
        <div
            className="board"
            id="board"
            style={{
                display: 'inline-block',
                border: '1px solid #ccc',
                backgroundColor: '#f0f0f0',
                position: 'relative'
        }}>
            {grid.map((row,y) =>(
                <div key={y} style={{display: 'flex'}}>
                    {row.map((cell,x) => (
                        <div
                            key={`${x}-${y}`}
                            style={{
                              width: CELL_SIZE,
                              height: CELL_SIZE,
                              border: '1px solid #ccc',
                              boxSizing: 'border-box',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 18,
                              fontWeight: 'bold',
                              color: '#333'
                            }}
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