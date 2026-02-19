import {useEffect, useRef, useState} from "react";
import {CELL_SIZE, GRID_HEIGHT, GRID_WIDTH} from "./Constants";
import Header from "./Header";
import Board from "./Board"
import Scoreboard from "./Scoreboard";
import DominoPips from "./DominoPips";
import DominoHolder from "./DominoHolder";
import validateDominoPath from "./ValidateBoard";
import generateDominoValues from "./GenerateSolution";
import {StartModal, StatsModal, TutorialModal, WinModal} from "./Modal";
import {soundGenerator} from "./SoundEffects";
import statsIcon from '../assets/StatsIcon.svg';
import howToIcon from '../assets/HowToIcon.svg';
import moreIcon from '../assets/MoreIcon.svg'
import icon from '../assets/DominoTrainIcon.svg';
import './style.css';


function DominoTrain() {
    const [startingTile, setStartingTile] = useState({dominoId: "start", x: 0, y:Math.floor(GRID_HEIGHT/2),  value: Math.floor(Math.random() * 6) + 1});
    const [endTile, setEndTile] = useState({dominoId: "end", x: GRID_WIDTH-1, y: Math.floor(GRID_HEIGHT/2), value: Math.floor(Math.random() * 6) + 1});
    const [startingDominoCount, setStartingDominoCount] = useState(12   );
    const [solution, setSolution] = useState([]);

    const [grid, setGrid] = useState(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));
    const [validatedGrid, setValidatedGrid] = useState(null);

    const [score, setScore] = useState(null);

    const [clearBoard, setClearBoard] = useState(0);

    const [isInitialized, setIsInitialized] = useState(false);
    const [CELL_SIZE, SET_CELL_SIZE] = useState(50);

    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
    const [isWinModalOpen, setIsWinModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

    const [solutionFound, setSolutionFound] = useState(false);
    const solutionFoundRef = useRef(false);

    const [gameWon, setGameWon] = useState(false);
    const [animatedWon, setAnimatedWon] = useState(false);

    const svgs = [statsIcon, howToIcon, moreIcon, icon];

    function preloadImages(srcs) {
      return Promise.all(srcs.map(src => new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve;
      })));
    }

    useEffect(() => {
        const init = async ()  => {
            const { solution, start, end } = generateDominoValues(startingDominoCount);
            setStartingTile(start);
            setEndTile(end);
            setSolution(solution);
            await preloadImages(svgs);
            handleResize();
            openStartModal();
            setIsInitialized(true);
        };
        init();
    }, []);

    useEffect(() => {
        handleValidation();
    }, [grid]);

    useEffect(() => {
        if(score === startingDominoCount && solutionFound && animatedWon){
            if(!gameWon){
                setGameWon(true);
                saveStats();
            }
            openWinModal();
        }
    }, [score, solutionFound, animatedWon]);

    useEffect(() => {
        const initAudio = () => {
            soundGenerator.init();
            document.removeEventListener('click', initAudio);
        };
        document.addEventListener('click', initAudio);
        return () => document.removeEventListener('click', initAudio);
    }, []);

    useEffect(() => {
        solutionFoundRef.current = solutionFound;
    }, [solutionFound]);


    const saveStats = () => {
        const today = new Date().toDateString();

        const stats = JSON.parse(localStorage.getItem('DailyDominoStats')) || {
            wins: 0,
            winDates: [],
            streak: 0,
            maxStreak: 0,
            lastWinDate: null
        };

        if(stats.lastWinDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = stats.lastWinDate === yesterday.toDateString();

        const newStreak = wasYesterday ? stats.streak + 1 : 1;

        const updatedStats = {
            wins: stats.wins + 1,
            winDates: [...stats.winDates, today],
            streak: newStreak,
            maxStreak: Math.max(newStreak, stats.maxStreak),
            lastWinDate: today
        };

        localStorage.setItem('DailyDominoStats', JSON.stringify(updatedStats));
    }

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
        handleValidation();
    };

    const handleValidation = () => {
        const { verifiedGrid, score, foundGoal } = validateDominoPath(grid, startingTile, endTile);
        setValidatedGrid(verifiedGrid);
        setScore(score);
        setSolutionFound(foundGoal);
        setAnimatedWon(false);
        // checkForWin();
    }

    const handleClearBoard = () => {
        const clearedGrid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
        setGrid(clearedGrid);
        handleValidation();
        setClearBoard(prev => prev + 1);
        soundGenerator.playClear();
    }

    const handleResize = () => {
        if(window.innerWidth < 500){
            SET_CELL_SIZE(40);
        } else {
            SET_CELL_SIZE(50);
        }
    }

    const openStartModal = () => {
        setIsStartModalOpen(!isStartModalOpen);
    }

    const openTutorialModal = () => {
        setIsTutorialModalOpen(!isTutorialModalOpen);
    }

    const openWinModal = () => {
        setIsWinModalOpen(!isWinModalOpen);
    }

    const openStatsModal = () => {
        setIsStatsModalOpen(!isStatsModalOpen);
    }

    const handleWon = () => {
        setAnimatedWon(true);
    }

    useEffect(() => {
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [handleResize]);

    if(!isInitialized){
        return(
            <div className="loading">
            </div>
        )
    }

    return (
        <div className="window">
            <Header howToPlayModal={openTutorialModal} statsModal={openStatsModal}/>
            <div className="domino-train">
                <Scoreboard CELL_SIZE={CELL_SIZE} score={score} topScore={startingDominoCount} side={"top"} solutionFound={solutionFound} handleWon={handleWon}/>
                <div className="grid" style={{boxShadow: (score === startingDominoCount && solutionFound) ? '0 0 2rem #4CAF50' : 'none'}}>
                    <Board CELL_SIZE={CELL_SIZE} grid={grid} solutionFound={solutionFound} score={score} topScore={startingDominoCount} validatedGrid={validatedGrid}/>
                    <div className="starting-tile" id="start-tile"
                         style={{
                             left: startingTile.x * GRID_WIDTH - CELL_SIZE,
                             top: startingTile.y * CELL_SIZE,
                             width: CELL_SIZE,
                             height: CELL_SIZE
                         }}>
                        <div className="domino-half starting-tile-domino" style={{width: CELL_SIZE, height: CELL_SIZE, boxShadow: '0 0 0.5rem #4CAF50'}}>
                            <DominoPips CELL_SIZE={CELL_SIZE} value={startingTile.value} color={'#4CAF50'} inHolder={false}/>
                        </div>
                    </div>
                    <div className="starting-tile" id="end-tile"
                         style={{
                             left: endTile.x * CELL_SIZE + 2 + CELL_SIZE,
                             top: endTile.y * CELL_SIZE,
                             width: CELL_SIZE,
                             height: CELL_SIZE
                         }}>
                        <div className="domino-half starting-tile-domino" style={{width: CELL_SIZE, height: CELL_SIZE, boxShadow: solutionFound ? '0 0 0.5rem #4CAF50' : '0 0 0.5rem #D44444'}}>
                            <DominoPips CELL_SIZE={CELL_SIZE} value={endTile.value} color={(solutionFound ? '#4CAF50' : '#D44444')} inHolder={false}/>
                        </div>
                    </div>
                </div>
                <Scoreboard CELL_SIZE={CELL_SIZE} score={score} topScore={startingDominoCount} side={"bot"} solutionFound={solutionFound} handleWon={handleWon}/>
                <DominoHolder
                    CELL_SIZE={CELL_SIZE}
                    count={startingDominoCount}
                    solution={solution}
                    onPlacement={handlePlacement}
                    onRemoval={handleRemoval}
                    grid={grid}
                    validatedGrid={validatedGrid}
                    clearBoard={clearBoard}
                />
                <a className="sub-button" onClick={handleClearBoard}>Clear Board</a>
                {isStartModalOpen && (
                    <div>
                        <StartModal CELL_SIZE={CELL_SIZE} amountOfTiles={startingDominoCount} isModalOpen={isStartModalOpen} updateCallback={openStartModal}/>
                    </div>
                )}
                {isTutorialModalOpen && (
                    <div>
                        <TutorialModal CELL_SIZE={CELL_SIZE} amountOfTiles={startingDominoCount} isModalOpen={isTutorialModalOpen} updateCallback={openTutorialModal} buttonText={"Back To Game"}/>
                    </div>
                )}
                {isStatsModalOpen && (
                    <div>
                        <StatsModal isModalOpen={isStatsModalOpen} updateCallback={openStatsModal}/>
                    </div>
                )}
                {isWinModalOpen && (
                    <div>
                        <WinModal finalGrid={validatedGrid} isModalOpen={isWinModalOpen} updateCallback={openWinModal}/>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DominoTrain;
