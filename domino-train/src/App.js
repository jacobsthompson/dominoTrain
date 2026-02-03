import {useState} from "react";
import Board from "./components/Board";
import Domino from "./components/Domino";
import DominoHolder from "./components/DominoHolder";

import {GRID_SIZE, CELL_SIZE, GRID_HEIGHT, GRID_WIDTH} from "./components/constants";
import './components/style.css'


function App() {
    const [grid, setGrid] = useState(() => {
        const initialGrid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
        initialGrid[Math.floor(GRID_HEIGHT/2)][0] = {id: 'start', value: Math.floor(Math.random() * 6) + 1};
        initialGrid[Math.floor(GRID_HEIGHT/2)][GRID_SIZE-1] = {id: 'end', value: Math.floor(Math.random() * 6) + 1};
        return initialGrid;
    });

    const printGrid = () => {
        console.log('=== Current Grid State ===');
        grid.forEach((row,y) => {
            const rowString = row.map((cell,x) => {
                if(cell === null){
                    return '.';
                }
                return cell.value;
            }).join(' ');
            console.log(`Row ${y}: ${rowString}`);
        });
        console.log("========================");
    };

    const handlePlacement = (dominoId, cells) => {

        //check if within bounds of board
        for(const cell of cells){
            if(cell.gridX < 0 || cell.gridX >= GRID_WIDTH || cell.gridY < 0 || cell.gridY >= GRID_HEIGHT){
                console.log("out of bounds");
                return false;
            }
        }

        //check for any overlapping dominos
        for(const cell of cells) {
            if (grid[cell.gridY][cell.gridX] !== null) {
                console.log("overlap");
                return false;
            }
        }

        //place domino cells and update grid
        const newGrid = grid.map(row => [...row]);
        for(const cell of cells){
            newGrid[cell.gridY][cell.gridX] = {
                id: `${dominoId}-${cell.gridX}-${cell.gridY}`,
                value: cell.value,
                dominoId: dominoId
            };
        }
        setGrid(newGrid);
        return true;
    };

    const handleRemoval = (dominoId) => {
        const newGrid = grid.map(row =>
            row.map(cell =>
                cell?.dominoId === dominoId ? null : cell
            )
        );
        setGrid(newGrid);
    };

    return (
        <div className="app">
            <h2>Domino Train</h2>
            <div>
                <button onClick={printGrid} style={{marginBottom: 10}}>Print Grid</button>
            </div>
            <div className="grid">
                <Board grid={grid}/>
                <div className="starting-tile"
                     style={{left: 0 * GRID_WIDTH + 1, top: Math.floor(GRID_HEIGHT / 2) * CELL_SIZE + 1}}>
                    <div className="starting-tile-domino">
                        {grid[Math.floor(GRID_HEIGHT / 2)][0].value}
                    </div>
                </div>
                <div className="starting-tile"
                     style={{left: (GRID_WIDTH - 1) * CELL_SIZE + 1, top: Math.floor(GRID_HEIGHT / 2) * CELL_SIZE + 1}}>
                    <div className="starting-tile-domino">
                        {grid[Math.floor(GRID_HEIGHT / 2)][GRID_SIZE - 1].value}
                    </div>
                </div>
            </div>
            <DominoHolder count={12} onPlacement={handlePlacement} onRemoval={handleRemoval}/>
        </div>
    );
}

export default App;
