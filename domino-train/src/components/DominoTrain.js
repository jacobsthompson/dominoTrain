import {useState} from "react";
import {CELL_SIZE, GRID_HEIGHT, GRID_WIDTH} from "./constants";
import Board from "./Board";
import DominoHolder from "./DominoHolder";
import validateDominoPath from "./validateDFS";
import DominoPips from "./DominoPips";
import './style.css';

function DominoTrain() {
    const [startingTile, setStartingTile] = useState({dominoId: "start", col: Math.floor(GRID_HEIGHT/2), row: 0, x: 0, y:Math.floor(GRID_HEIGHT/2),  value: Math.floor(Math.random() * 6) + 1});
    const [endTile, setEndTile] = useState({dominoId: "end", col: Math.floor(GRID_HEIGHT/2), row: GRID_WIDTH-1, x: GRID_WIDTH-1, y: Math.floor(GRID_HEIGHT/2), value: Math.floor(Math.random() * 6) + 1});
    const [startingDominoCount, setStartingDominoCount] = useState(12);

    const [grid, setGrid] = useState(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));
    const [validatedGrid, setValidatedGrid] = useState(null);
    const [score, setScore] = useState(null);
    const [clearBoard, setClearBoard] = useState(0);

    const logo = "./DominoTrainLogo.svg";

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
    };

    const handleValidation = () => {
        const { verifiedGrid, score } = validateDominoPath(grid, startingTile, endTile);
        setValidatedGrid(verifiedGrid);
        setScore(score);
    }

    const handleClearBoard = () => {
        const clearedGrid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
        setGrid(clearedGrid);
        setValidatedGrid(null);
        setClearBoard(prev => prev + 1);
    }

    return (
        <div className="domino-train">
            <h2 className="title-card">Domino Train</h2>
            <img src={logo} alt="Domino Train"/>
            <h3 className="score">Score: {score === null ? '-' : score}</h3>
            <div>
                <div className="grid">
                    <Board grid={grid}/>
                    <div className="starting-tile" id="start-tile"
                         style={{
                             left: startingTile.row * GRID_WIDTH - CELL_SIZE,
                             top: startingTile.col * CELL_SIZE + 1,
                             width: CELL_SIZE,
                             height: CELL_SIZE
                         }}>
                        <div className="domino-half starting-tile-domino" style={{width: CELL_SIZE, height: CELL_SIZE}}>
                            <DominoPips value={startingTile.value} color={'black'}/>
                        </div>
                    </div>
                    <div className="starting-tile" id="end-tile"
                         style={{
                             left: endTile.row * CELL_SIZE + 2 + CELL_SIZE,
                             top: endTile.col * CELL_SIZE + 1,
                             width: CELL_SIZE,
                             height: CELL_SIZE
                         }}>
                        <div className="domino-half starting-tile-domino" style={{width: CELL_SIZE, height: CELL_SIZE}}>
                            <DominoPips value={endTile.value} color={'black'}/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="button-wrapper">
                <button className="button" onClick={handleClearBoard}>Clear Grid</button>
                <button className="button" onClick={printGrid}>Print Grid</button>
                <button className="button" onClick={handleValidation}>Test Run</button>
            </div>
            <DominoHolder count={startingDominoCount} onPlacement={handlePlacement} onRemoval={handleRemoval} clearBoard={clearBoard} validatedGrid={validatedGrid}/>
        </div>
    );
}

export default DominoTrain;
