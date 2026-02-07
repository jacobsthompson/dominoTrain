import {useState} from "react";
import {CELL_SIZE, GRID_HEIGHT, GRID_WIDTH} from "./components/constants";
import Board from "./components/Board";
import DominoHolder from "./components/DominoHolder";
import validateDominoPath from "./components/validateDFS";
import './components/style.css';

function App() {
    const [startingTile, setStartingTile] = useState({dominoId: "start", col: Math.floor(GRID_HEIGHT/2), row: 0, x: 0, y:Math.floor(GRID_HEIGHT/2),  value: Math.floor(Math.random() * 6) + 1});
    const [endTile, setEndTile] = useState({dominoId: "end", col: Math.floor(GRID_HEIGHT/2), row: GRID_WIDTH-1, x: GRID_WIDTH-1, y: Math.floor(GRID_HEIGHT/2), value: Math.floor(Math.random() * 6) + 1});
    const [startingDominoCount, setStartingDominoCount] = useState(12);

    // console.log(startingTile.col, startingTile.row, startingTile.value);

    const [grid, setGrid] = useState(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));

    const [validatedGrid, setValidatedGrid] = useState(null);
    const [score, setScore] = useState(null);

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
        setValidatedGrid(null);
        setScore(null);
        return true;
    };

    const handleRemoval = (dominoId) => {
        const newGrid = grid.map(row =>
            row.map(cell =>
                cell?.dominoId === dominoId ? null : cell
            )
        );
        setGrid(newGrid);
        setValidatedGrid(null);
        setScore(null);
    };

    const handleValidation = () => {
        const { verifiedGrid, score } = validateDominoPath(grid, startingTile, endTile);
        setValidatedGrid(verifiedGrid);
        setScore(score);
    }

    const clearBoard = () => {

    }

    return (
        <div className="app">
            <h2 className="title-card">Domino Train</h2>
            <h3 className="score">Score: {score === null ? '-' : score}</h3>
            <div>
                <div className="grid">
                    <Board grid={grid}/>
                    <div className="starting-tile" id="start-tile"
                         style={{
                             left: startingTile.row * GRID_WIDTH + 1 - CELL_SIZE,
                             top: startingTile.col * CELL_SIZE + 1,
                             width: CELL_SIZE,
                             height: CELL_SIZE
                         }}>
                        <div className="starting-tile-domino" style={{width: CELL_SIZE, height: CELL_SIZE}}>
                            {startingTile.value}
                        </div>
                    </div>
                    <div className="starting-tile" id="end-tile"
                         style={{
                             left: endTile.row * CELL_SIZE + 1 + CELL_SIZE,
                             top: endTile.col * CELL_SIZE + 1,
                             width: CELL_SIZE,
                             height: CELL_SIZE
                         }}>
                        <div className="starting-tile-domino" style={{width: CELL_SIZE, height: CELL_SIZE}}>
                            {endTile.value}
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <button className="button" onClick={printGrid} style={{marginBottom: 10}}>Print Grid</button>
                <button className="button" onClick={handleValidation} style={{marginBottom: 10}}>Test Run</button>
            </div>
            <DominoHolder count={startingDominoCount} onPlacement={handlePlacement} onRemoval={handleRemoval} validatedGrid={validatedGrid}/>
        </div>
    );
}

export default App;
