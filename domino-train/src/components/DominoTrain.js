import {useEffect, useState} from "react";
import {CELL_SIZE, GRID_HEIGHT, GRID_WIDTH} from "./Constants";
import Board from "./Board"
import DominoHolder from "./DominoHolder";
import validateDominoPath from "./ValidateBoard";
import DominoPips from "./DominoPips";
import './style.css';
import logo from '../assets/DominoTrainLogo.svg'
import Scoreboard from "./Scoreboard";
import {soundGenerator} from "./SoundEffects";
import generateDominoValues from "./GenerateSolution";

function DominoTrain() {
    const [startingTile, setStartingTile] = useState({dominoId: "start", x: 0, y:Math.floor(GRID_HEIGHT/2),  value: Math.floor(Math.random() * 6) + 1});
    const [endTile, setEndTile] = useState({dominoId: "end", x: GRID_WIDTH-1, y: Math.floor(GRID_HEIGHT/2), value: Math.floor(Math.random() * 6) + 1});
    const [startingDominoCount, setStartingDominoCount] = useState(12);
    const [solution, setSolution] = useState([]);

    const [grid, setGrid] = useState(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));
    const [validatedGrid, setValidatedGrid] = useState(null);
    const [score, setScore] = useState(null);
    const [clearBoard, setClearBoard] = useState(0);

    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const generateSolution = () => {
            const { solution, start, end } = generateDominoValues(startingDominoCount);
            console.log(start, end);
            setStartingTile(start);
            setEndTile(end);
            setSolution(solution);
            setIsInitialized(true);
        }
        generateSolution();
    }, []);

    useEffect(() => {
        handleValidation();
    }, [grid]);

    useEffect(() => {
        const initAudio = () => {
            soundGenerator.init();
            document.removeEventListener('click', initAudio);
        };
        document.addEventListener('click', initAudio);
        return () => document.removeEventListener('click', initAudio);
    }, []);

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
                // console.log("out of bounds");
                return false;
            }
        }
        //check for any overlapping dominos
        for(const cell of cells) {
            if (grid[cell.gridY][cell.gridX] !== null) {
                // console.log("overlap");
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
        if(score > 0) setScore(score);
    }

    const handleClearBoard = () => {
        const clearedGrid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
        setGrid(clearedGrid);
        setScore(0);
        setValidatedGrid(null);
        setClearBoard(prev => prev + 1);
        soundGenerator.playClear();
    }

    if(!isInitialized){
        return(
            <div className="loading">
                <img src={logo} className="logo" alt="Domino Train" width="300"/>
            </div>
        )
    }

    return (
        <div className="domino-train">
            <img src={logo} className="logo" alt="Domino Train" width="300"/>
            <Scoreboard score={score} topScore={startingDominoCount} side={"top"}/>
            <div className="grid">
                <Board grid={grid} validatedGrid={validatedGrid}/>
                <div className="starting-tile" id="start-tile"
                     style={{
                         left: startingTile.x * GRID_WIDTH - CELL_SIZE,
                         top: startingTile.y * CELL_SIZE + 1,
                         width: CELL_SIZE,
                         height: CELL_SIZE
                     }}>
                    <div className="domino-half starting-tile-domino" style={{width: CELL_SIZE, height: CELL_SIZE}}>
                        <DominoPips value={startingTile.value} color={'black'} inHolder={false}/>
                    </div>
                </div>
                <div className="starting-tile" id="end-tile"
                     style={{
                         left: endTile.x * CELL_SIZE + 2 + CELL_SIZE,
                         top: endTile.y * CELL_SIZE + 1,
                         width: CELL_SIZE,
                         height: CELL_SIZE
                     }}>
                    <div className="domino-half starting-tile-domino" style={{width: CELL_SIZE, height: CELL_SIZE}}>
                        <DominoPips value={endTile.value} color={'black'} inHolder={false}/>
                    </div>
                </div>
            </div>
            <Scoreboard score={score} topScore={startingDominoCount} side={"bot"}/>
            <DominoHolder
                count={startingDominoCount}
                solution={solution}
                onPlacement={handlePlacement}
                onRemoval={handleRemoval}
                grid={grid}
                validatedGrid={validatedGrid}
                clearBoard={clearBoard}
            />
            <button className="button" onClick={handleClearBoard}>Clear</button>
        </div>
    );
}

export default DominoTrain;
