import {useCallback, useEffect, useRef, useState} from "react";
import {GRID_HEIGHT, GRID_WIDTH} from "./Constants";
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
import '../stylesheets/dailydominos.css';

function Timer(){
    const [elapsedTime, setElapsedTime] = useState(0);
    const startTimeRef = useRef(null);
    const tickRef = useRef(null);

    const tick = useCallback(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
        tickRef.current = requestAnimationFrame(tick);
    }, []);

    const startTimer = useCallback(() => {
        startTimeRef.current = Date.now();
        tickRef.current = requestAnimationFrame(tick);
    }, [tick]);

    const stopTimer = useCallback(() => {
        cancelAnimationFrame(tickRef.current);
        tickRef.current = null;
    }, [])

    const resetTimer = () => {
        setElapsedTime(0);
    }

    const getTime = useCallback(() => {
        const seconds = Math.floor(elapsedTime/1000);
        const minutes = Math.floor((seconds % 3600)/60);
        const hours = Math.floor(minutes/60);
        const pad = (n) => String(n).padStart(2, '0');
        return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds % 60)}` : `${pad(minutes)}:${pad(seconds % 60)}`
    }, [elapsedTime])

    return { startTimer, stopTimer, resetTimer, getTime}
}

function DailyDominos() {
    const [startingTile, setStartingTile] = useState({dominoId: "start", x: 0, y:Math.floor(GRID_HEIGHT/2),  value: Math.floor(Math.random() * 6) + 1});
    const [endTile, setEndTile] = useState({dominoId: "end", x: GRID_WIDTH-1, y: Math.floor(GRID_HEIGHT/2), value: Math.floor(Math.random() * 6) + 1});
    const [startingDominoCount, setStartingDominoCount] = useState(16);
    const [solution, setSolution] = useState([]);

    const [grid, setGrid] = useState(Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null)));
    const [validatedGrid, setValidatedGrid] = useState(null);

    const [score, setScore] = useState(null);

    const [clearBoard, setClearBoard] = useState(0);

    const [isInitialized, setIsInitialized] = useState(false);
    const [CELL_SIZE, SET_CELL_SIZE] = useState(50);

    const [isStartModalOpen, setIsStartModalOpen] = useState(false);
    const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
    const [firstTutorial, setFirstTutorial] = useState(false);
    const [isWinModalOpen, setIsWinModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

    const [solutionFound, setSolutionFound] = useState(false);
    const solutionFoundRef = useRef(false);

    const [gameWon, setGameWon] = useState(false);
    const [animatedWon, setAnimatedWon] = useState(false);

    const [endlessMode, setEndlessMode] = useState(0);
    const [endlessKey, setEndlessKey] = useState(0);

    const [winStates, setWinStates] = useState(null);
    const [dominoStates, setDominoStates] = useState(null);

    const dominoHistory = useRef([]);
    const gridHistory = useRef([grid]);
    const HistoryRef = useRef(1);
    const [historySize, setHistorySize] = useState(1);
    const [blankGridState, setBlankGridState] = useState(null);

    const [skipAnimation, setSkipAnimation] = useState(false);

    const svgs = [statsIcon, howToIcon, moreIcon, icon];

    const {startTimer, stopTimer, resetTimer, getTime} = Timer();
    const finalTime = useRef('');

    function preloadImages(srcs) {
      return Promise.all(srcs.map(src => new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = resolve;
        img.onerror = resolve;
      })));
    }

    //Daily Board Setup
    useEffect(() => {
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('DailyDominoStats'));
        const beatenToday = stats?.lastWinDate === today;

        const init = async ()  => {
            const { solution, start, end } = generateDominoValues(startingDominoCount, today);
            setStartingTile(start);
            setEndTile(end);
            setSolution(solution);
            await preloadImages(svgs);
            handleResize();
            updateStreak();
            if(!beatenToday){
                if(stats){
                    openStartModal();
                    setFirstTutorial(false);
                } else {
                    openTutorialModal();
                    setFirstTutorial(true);
                }
            } else {
                setSkipAnimation(true);
                setGrid(stats.currWinBoard);
                setValidatedGrid(stats.currWinBoard);
                setWinStates(stats.currWinStates);
                setScore(startingDominoCount);
                setSolutionFound(true);
                setAnimatedWon(true);
                setGameWon(true);
                openWinModal();
            }

            setIsInitialized(true);
        };
        init();
    }, []);


    //Endless Board Setup
    useEffect(() => {
        if(endlessMode > 0){
            const { solution, start, end } = generateDominoValues(startingDominoCount);
            setStartingTile(start);
            setEndTile(end);
            setSolution(solution);
            setScore(0);
            setSolutionFound(false);
            setAnimatedWon(false);
            setWinStates(null);
            handleClearBoard();
            setEndlessKey(prev => prev + 1);
            if(isWinModalOpen) openWinModal();
            soundGenerator.playClear();
            ResetHistory(100);
            resetTimer();
            startTimer();
        }
    }, [endlessMode]);

    //Live Validation
    useEffect(() => {
        handleValidation();
    }, [grid]);

    //On Daily Win (First Time)
    useEffect(() => {
        if(score === startingDominoCount && solutionFound && animatedWon){
            if(!gameWon){
                setGameWon(true);
                stopTimer();
                finalTime.current = getTime();
                console.log(finalTime.current);
                saveStats();
            }
            if(!isWinModalOpen) openWinModal();
        }
    }, [score, solutionFound, animatedWon]);

    //Sound Effects Initialization
    useEffect(() => {
        const initAudio = () => {
            soundGenerator.init();
            document.removeEventListener('click', initAudio);
        };
        document.addEventListener('click', initAudio);
        return () => document.removeEventListener('click', initAudio);
    }, []);

    //Solution Found (Not Necessarily Game Win)
    useEffect(() => {
        solutionFoundRef.current = solutionFound;
    }, [solutionFound]);

    //Save/Update Streak
    const updateStreak = () => {
        const stats = JSON.parse(localStorage.getItem('DailyDominoStats'));
        if(stats){
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if(stats.lastWinDate !== today.toDateString() && stats.lastWinDate !== yesterday.toDateString()){
                const updatedStats = {
                    wins: stats.wins,
                    streak: 0,
                    maxStreak: stats.maxStreak,
                    lastWinDate: stats.lastWinDate,
                    currWinStates: stats.currWinStates,
                    currWinBoard: stats.currWinBoard,
                    lastTime: stats.lastTime
                };

                localStorage.setItem('DailyDominoStats', JSON.stringify(updatedStats));
            }
        }
    }

    const saveStats = () => {
        const today = new Date().toDateString();

        const stats = JSON.parse(localStorage.getItem('DailyDominoStats')) || {
            wins: 0,
            streak: 0,
            maxStreak: 0,
            lastWinDate: null,
            currWinStates: null,
            currWinBoard: null,
            lastTime: null
        };

        if(stats.lastWinDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = stats.lastWinDate === yesterday.toDateString();

        const newStreak = wasYesterday ? stats.streak + 1 : 1;

        const updatedStats = {
            wins: stats.wins + 1,
            streak: newStreak,
            maxStreak: Math.max(newStreak, stats.maxStreak),
            lastWinDate: today,
            currWinStates: dominoStates,
            currWinBoard: grid,
            lastTime: finalTime.current
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


    function ResetHistory(time){
        setTimeout(() => {
            dominoHistory.current = [dominoHistory.current.at(-1)];
            if(!blankGridState) setBlankGridState(structuredClone(dominoHistory.current.at(-1)));
            gridHistory.current = [gridHistory.current.at(-1)];
            HistoryRef.current = 1;
            setHistorySize(1);
            // console.log("Reset");
            // console.log(dominoHistory.current);
        }, time);
    }

    function sliceHistory(grid, type = "placement"){
        gridHistory.current = gridHistory.current.slice(0, gridHistory.current.length - HistoryRef.current + 1);
        dominoHistory.current = dominoHistory.current.slice(0, dominoHistory.current.length - HistoryRef.current + 1);
        gridHistory.current.push(grid);
        HistoryRef.current = 1;
        setHistorySize(gridHistory.current.length);

        if(type === "clear") {
            dominoHistory.current.push(blankGridState);
        }

        setWinStates(dominoHistory.current.at(-1));
    }

    const handlePlacement = (dominoId, cells) => {
        setSkipAnimation(false);

        //check if within bounds of board
        for(const cell of cells){
            if(cell.gridX < 0 || cell.gridX >= GRID_WIDTH || cell.gridY < 0 || cell.gridY >= GRID_HEIGHT){
                sliceHistory(grid);
                return false;
            }
        }
        //check for any overlapping dominos
        for(const cell of cells) {
            if (grid[cell.gridY][cell.gridX] !== null) {
                sliceHistory(grid);
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
        sliceHistory(newGrid);
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
    }

    const handleClearBoard = () => {
        const clearedGrid = Array(GRID_HEIGHT).fill(null).map(() => Array(GRID_WIDTH).fill(null));
        setGrid(clearedGrid);
        if(JSON.stringify(gridHistory.current.at(-1)) !== JSON.stringify(clearedGrid)){
            sliceHistory(clearedGrid, "clear");
        }
        // console.log(dominoHistory.current);
        // console.log(blankGridState);
        handleValidation();
        setClearBoard(prev => prev + 1);
        soundGenerator.playClear();
    }

    const handleResize = () => {
        if(window.innerWidth < 450){
            SET_CELL_SIZE(35);
        } else if(window.innerWidth < 500){
            SET_CELL_SIZE(40);
        } else {
            SET_CELL_SIZE(50);
        }
    }

    const openStartModal = () => {
        setIsStartModalOpen(!isStartModalOpen);
        ResetHistory(0);
        startTimer();
    }

    const openTutorialModal = () => {
        setIsTutorialModalOpen(!isTutorialModalOpen);
        if(firstTutorial) {
            ResetHistory(0);
            startTimer();
            setFirstTutorial(false);
        }
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

    const handleEndless = () => {
        setSkipAnimation(true);
        setEndlessMode(prev => prev + 1);
    }

    const getDominoStates = (states) => {
        setDominoStates(states);
        dominoHistory.current.push(structuredClone(states));
        setWinStates(dominoHistory.current.at(-1));
    }

    function checkUndoCap(){ return (gridHistory.current.length - HistoryRef.current) > 0; }
    function checkRedoCap(){ return (gridHistory.current.length - HistoryRef.current) < gridHistory.current.length-1; }

    const handleUndo = () => {
        if(checkUndoCap()){
            HistoryRef.current += 1;
            setWinStates(dominoHistory.current.at(dominoHistory.current.length - HistoryRef.current));
            setGrid(gridHistory.current.at(gridHistory.current.length - HistoryRef.current));
        }
    }

    const handleRedo = () => {
        if(checkRedoCap()){
            HistoryRef.current -= 1;
            setWinStates(dominoHistory.current.at(dominoHistory.current.length - HistoryRef.current));
            setGrid(gridHistory.current.at(gridHistory.current.length - HistoryRef.current));
        }
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
            <Header howToPlayModal={openTutorialModal} statsModal={openStatsModal} endlessMode={endlessMode} time={getTime()}/>
            <div className="domino-train">
                <Scoreboard CELL_SIZE={CELL_SIZE} score={score} topScore={startingDominoCount} side={"top"} solutionFound={solutionFound} handleWon={handleWon} skipAnimation={skipAnimation}/>
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
                <Scoreboard CELL_SIZE={CELL_SIZE} score={score} topScore={startingDominoCount} side={"bot"} solutionFound={solutionFound} handleWon={handleWon} skipAnimation={skipAnimation}/>
                <DominoHolder
                    key={endlessKey}
                    CELL_SIZE={CELL_SIZE}
                    count={startingDominoCount}
                    solution={solution}
                    onPlacement={handlePlacement}
                    onRemoval={handleRemoval}
                    grid={grid}
                    validatedGrid={validatedGrid}
                    clearBoard={clearBoard}
                    returnStates={getDominoStates}
                    initialStates={winStates}
                />
                <div className="sub-button-container">
                    <a className="sub-button" onClick={handleUndo} style={{
                        color: checkUndoCap() ? '#ccc' : '#555',
                        cursor: checkUndoCap() ? 'pointer' : 'auto'
                    }}>Undo</a>
                    <div>|</div>
                    {endlessMode > 0 && (
                        <a className="sub-button" onClick={handleEndless}>New Game</a>
                    )}
                    {endlessMode > 0 && (
                        <div>|</div>
                    )}
                    <a className="sub-button" onClick={handleClearBoard}>Clear Board</a>
                    <div>|</div>
                    <a className="sub-button" onClick={handleRedo} style={{
                        color: checkRedoCap() ? '#ccc' : '#555',
                        cursor: checkRedoCap() ? 'pointer' : 'auto'
                    }}>Redo</a>
                </div>
                {isStartModalOpen && (
                    <div>
                    <StartModal CELL_SIZE={CELL_SIZE} amountOfTiles={startingDominoCount} isModalOpen={isStartModalOpen} updateCallback={openStartModal}/>
                    </div>
                )}
                {isTutorialModalOpen && (
                    <div>
                        <TutorialModal CELL_SIZE={CELL_SIZE} amountOfTiles={startingDominoCount} isModalOpen={isTutorialModalOpen} updateCallback={openTutorialModal} buttonText={"Back To Game"} firstTutorial={firstTutorial}/>
                    </div>
                )}
                {isStatsModalOpen && (
                    <div>
                        <StatsModal isModalOpen={isStatsModalOpen} updateCallback={openStatsModal}/>
                    </div>
                )}
                {isWinModalOpen && (
                    <div>
                        <WinModal endlessMode={endlessMode} isModalOpen={isWinModalOpen} handleEndlessMode={handleEndless} updateCallback={openWinModal} finalTime={finalTime.current}/>
                    </div>
                )}
            </div>
        </div>
    );
}

export default DailyDominos;
