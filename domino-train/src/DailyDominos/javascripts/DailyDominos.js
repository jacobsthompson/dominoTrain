import {useCallback, useEffect, useRef, useState} from "react";
import {GRID_HEIGHT, GRID_WIDTH} from "./Constants";
import Header from "./Header";
import Board from "./Board"
import Scoreboard from "./Scoreboard";
import DominoPips from "./DominoPips";
import DominoHolder from "./DominoHolder";
import validateDominoPath from "./ValidateBoard";
import generateDominoValues from "./GenerateSolution";
import Timer from "./Timer";
import {NewGameModal, StartModal, StatsModal, TutorialModal, WinModal} from "./Modal";
import {soundGenerator} from "./SoundEffects";
import statsIcon from '../assets/StatsIcon.svg';
import howToIcon from '../assets/HowToIcon.svg';
import moreIcon from '../assets/MoreIcon.svg'
import icon from '../assets/DominoTrainIcon.svg';
import '../stylesheets/dailydominos.css';

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
    const [isNewGameModalOpen, setIsNewGameModalOpen] = useState(false);

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
    const [blankGridState, setBlankGridState] = useState(null);

    const [skipAnimation, setSkipAnimation] = useState(false);

    const svgs = [statsIcon, howToIcon, moreIcon, icon];

    const {startTimer, stopTimer, resetTimer, getTime, bestTimeCompare, toggleMenuTimer, getRawTime, setTime} = Timer();
    const finalTime = useRef('');

    const timerReadyToStart = useRef(false);

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
        const progressedToday = stats?.lastPlayedDate === today;

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
                    console.log(stats.lastPlayedDate === today);
                    if(progressedToday){
                        console.log("Progress");
                        setGrid(stats.currBoardStates);
                        setValidatedGrid(stats.currBoardStates);
                        setWinStates(stats.currDominoStates);
                        gridHistory.current = stats.currBoardUndoHistory;
                        dominoHistory.current = stats.currStatesUndoHistory;
                        HistoryRef.current = stats.currHistoryRef;
                        setTime(stats.currTime);
                    }
                    console.log("Open Start Modal")
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
                setTime(stats.currTime);
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
            timerReadyToStart.current = true;
        }

        setTimeout(() =>{
            if(timerReadyToStart.current){
                startTimer();
                timerReadyToStart.current = false;
            }
        }, 100);

    }, [endlessMode]);

    //Live Validation
    useEffect(() => {
        handleValidation();
    }, [grid]);

    //On Daily Win (First Time)
    useEffect(() => {
        if(score === startingDominoCount && solutionFound){
            stopTimer();
            finalTime.current = getTime();
            if(animatedWon){
                if(!gameWon){
                    setGameWon(true);
                    saveStats();
                }
                if(!isWinModalOpen) openWinModal();
            }
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
            const today = new Date().toDateString();
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if(stats.lastWinDate !== today && stats.lastWinDate !== yesterday.toDateString()){
                const updatedStats = {
                    wins: stats.wins,
                    streak: 0,
                    maxStreak: stats.maxStreak,
                    lastWinDate: stats.lastWinDate,
                    currWinStates: stats.currWinStates,
                    currWinBoard: stats.currWinBoard,
                    lastTime: stats.lastTime,
                    bestTime: stats.bestTime,

                    lastPlayedDate: stats.lastPlayedDate,
                    currBoardStates: stats.currBoardStates,
                    currDominoStates: stats.currDominoStates,
                    currBoardUndoHistory: stats.currBoardUndoHistory,
                    currStatesUndoHistory: stats.currStatesUndoHistory,
                    currHistoryRef: stats.currHistoryRef,
                    currTime: stats.currTime
                };

                localStorage.setItem('DailyDominoStats', JSON.stringify(updatedStats));
            }
        }
    }

    const startProgress = () => {
        if(!gameWon){
            const stats = JSON.parse(localStorage.getItem('DailyDominoStats')) || {
                wins: 0,
                streak: 0,
                maxStreak: 0,
                lastWinDate: null,
                currWinStates: null,
                currWinBoard: null,
                lastTime: null,
                bestTime: null,

                lastPlayedDate: null,
                currBoardStates: null,
                currDominoStates: null,
                currBoardUndoHistory: null,
                currStatesUndoHistory: null,
                currHistoryRef: null,
                currTime: null

            };

            const today = new Date().toDateString();

            const updatedStats = {
                wins: stats.wins,
                streak: stats.streak,
                maxStreak: stats.maxStreak,
                lastWinDate: stats.lastWinDate,
                currWinStates: stats.currWinStates,
                currWinBoard: stats.currWinBoard,
                lastTime: stats.lastTime,
                bestTime: stats.bestTime,

                lastPlayedDate: today,
                currBoardStates: structuredClone(gridHistory.current.at(gridHistory.current.length - HistoryRef.current)),
                currDominoStates: structuredClone(dominoHistory.current.at(dominoHistory.current.length - HistoryRef.current)),
                currBoardUndoHistory: structuredClone(gridHistory.current),
                currStatesUndoHistory: structuredClone(dominoHistory.current),
                currHistoryRef: structuredClone(HistoryRef.current),
                currTime: getRawTime()
            };

            localStorage.setItem('DailyDominoStats', JSON.stringify(updatedStats));
            console.log("Progress Saved");
        }
    }

    const saveProgress = () => {
        const stats = JSON.parse(localStorage.getItem('DailyDominoStats'));

        const today = new Date().toDateString();

        if(stats?.lastPlayedDate === today && !gameWon){
            const updatedStats = {
                wins: stats.wins,
                streak: stats.streak,
                maxStreak: stats.maxStreak,
                lastWinDate: stats.lastWinDate,
                currWinStates: stats.currWinStates,
                currWinBoard: stats.currWinBoard,
                lastTime: stats.lastTime,
                bestTime: stats.bestTime,

                lastPlayedDate: stats.lastPlayedDate,
                currBoardStates: structuredClone(gridHistory.current.at(gridHistory.current.length - HistoryRef.current)),
                currDominoStates: structuredClone(dominoHistory.current.at(dominoHistory.current.length - HistoryRef.current)),
                currBoardUndoHistory: structuredClone(gridHistory.current),
                currStatesUndoHistory: structuredClone(dominoHistory.current),
                currHistoryRef: structuredClone(HistoryRef.current),
                currTime: getRawTime()
            };

            localStorage.setItem('DailyDominoStats', JSON.stringify(updatedStats));
            console.log("Progress Saved");
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
            lastTime: null,
            bestTime: null,

            lastPlayedDate: null,
            currBoardStates: null,
            currDominoStates: null,
            currBoardUndoHistory: null,
            currStatesUndoHistory: null,
            currHistoryRef: null,
            currTime: null

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
            lastTime: finalTime.current,
            bestTime: bestTimeCompare(finalTime.current, stats.bestTime),

            lastPlayedDate: today,
            currBoardStates: null,
            currDominoStates: null,
            currBoardUndoHistory: null,
            currStatesUndoHistory: null,
            currHistoryRef: null,
            currTime: stats.currTime
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
            console.log("Reset");
        }, time);
    }

    function sliceHistory(grid, type = "placement"){
        gridHistory.current = gridHistory.current.slice(0, gridHistory.current.length - HistoryRef.current + 1);
        dominoHistory.current = dominoHistory.current.slice(0, dominoHistory.current.length - HistoryRef.current + 1);
        gridHistory.current.push(grid);
        HistoryRef.current = 1;

        if(type === "clear") {
            dominoHistory.current.push(blankGridState);
        }

        setWinStates(dominoHistory.current.at(-1));
        saveProgress();
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
        handleValidation();
        setClearBoard(prev => prev + 1);
        soundGenerator.playClear();
    }

    const handleResize = () => {
        if(window.innerWidth < 400){
            SET_CELL_SIZE(32);
        } else if(window.innerWidth < 430){
            SET_CELL_SIZE(35);
        } else if(window.innerWidth < 500){
            SET_CELL_SIZE(40);
        } else {
            SET_CELL_SIZE(50);
        }
    }

    const openStartModal = () => {
        setIsStartModalOpen(!isStartModalOpen);
        const today = new Date().toDateString();
        const stats = JSON.parse(localStorage.getItem('DailyDominoStats'));
        const progressedToday = stats?.lastPlayedDate === today;

        if(!progressedToday && isStartModalOpen){
            ResetHistory(0);
            startProgress();
        }

        if(isStartModalOpen) startTimer();
    }

    const openTutorialModal = () => {
        setIsTutorialModalOpen(!isTutorialModalOpen);
        if(firstTutorial) {
            const today = new Date().toDateString();
            const stats = JSON.parse(localStorage.getItem('DailyDominoStats'));
            const progressedToday = stats?.lastPlayedDate === today;

            if(!progressedToday){
                ResetHistory(0);
                startProgress();
            }

            startTimer();
            setFirstTutorial(false);
        } else {
            toggleMenuTimer();
        }
    }

    const openWinModal = () => {
        setIsWinModalOpen(!isWinModalOpen);
    }

    const openStatsModal = () => {
        setIsStatsModalOpen(!isStatsModalOpen);
        toggleMenuTimer();
    }

    const openNewGameModal = () => {
        setIsNewGameModalOpen(!isNewGameModalOpen);
        toggleMenuTimer();
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
        saveProgress();
        console.log("Stating");
    }

    function checkUndoCap(){ return (gridHistory.current?.length - HistoryRef.current) > 0; }
    function checkRedoCap(){ return (gridHistory.current?.length - HistoryRef.current) < gridHistory.current?.length-1; }

    const handleUndo = () => {
        if(checkUndoCap()){
            HistoryRef.current += 1;
            setWinStates(dominoHistory.current.at(dominoHistory.current.length - HistoryRef.current));
            setGrid(gridHistory.current.at(gridHistory.current.length - HistoryRef.current));
            saveProgress();
        }
    }

    const handleRedo = () => {
        if(checkRedoCap()){
            HistoryRef.current -= 1;
            setWinStates(dominoHistory.current.at(dominoHistory.current.length - HistoryRef.current));
            setGrid(gridHistory.current.at(gridHistory.current.length - HistoryRef.current));
            saveProgress();
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
                        <a className="sub-button" onClick={openNewGameModal}>New Game</a>
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
            </div>
            {isStartModalOpen && <StartModal CELL_SIZE={CELL_SIZE} amountOfTiles={startingDominoCount} updateCallback={openStartModal}/>}
            {isTutorialModalOpen && <TutorialModal CELL_SIZE={CELL_SIZE} amountOfTiles={startingDominoCount} isModalOpen={isTutorialModalOpen} updateCallback={openTutorialModal} buttonText={"Back To Game"} firstTutorial={firstTutorial}/>}
            {isStatsModalOpen && <StatsModal updateCallback={openStatsModal}/>}
            {isWinModalOpen && <WinModal endlessMode={endlessMode} handleEndlessMode={handleEndless} updateCallback={openWinModal} finalTime={finalTime}/>}
            {isNewGameModalOpen && <NewGameModal handleNewGame={handleEndless} updateCallback={openNewGameModal}/>}
        </div>
    );
}

export default DailyDominos;
