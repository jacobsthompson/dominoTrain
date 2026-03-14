import {useEffect, useRef, useState} from "react";
import {soundGenerator} from "./SoundEffects";
import TutorialDomino from "./TutorialDomino";
import FakeDomino from "./FakeDomino";
import icon from "../assets/DominoTrainIcon.svg";
import '../stylesheets/modal.css'
import '../stylesheets/tutorialmodal.css'
import arrowIcon from "../assets/MoreIcon.svg";

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const date = new Date();

function statsBestTime(time){
    if(time.length > 5){
        if (time[0] === '0') { return time.slice(1,time.length); }
        else { return time }
    }
    if(time.slice(0,2) === '00') {
        if(time[4] === 0){
            return time[time.length] + 's';
        } else {
            return time.slice(3,5) + 's';
        }
    } else if(time[0] === '0'){
        return time.slice(1,time.length);
    } else {
        return time;
    }
}

export function StartModal({CELL_SIZE, amountOfTiles, updateCallback}){
    const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);

    const openTutorialModal = () => {
        setIsTutorialModalOpen(!isTutorialModalOpen);
    }

    return(
        <div className="modal">
        <div className="modal-background" onClick={updateCallback}/>
            {!isTutorialModalOpen && (
                <div className="modal-content">
                    <img src={icon} className="modal-icon" alt="[0/0]" width="75"/>
                    <div className="modal-header">Daily Dominos</div>
                    <div className="modal-text">Can you connect all the dominos?</div>
                    <div className="modal-text">{months[date.getMonth()]} {date.getDate()}, {date.getFullYear()}</div>
                    <div className="button-container">
                        <button className="button" onClick={updateCallback}>Play Puzzle</button>
                        <a className="modal-sub-button" onClick={openTutorialModal}>How To Play?</a>
                    </div>
                </div>
            )}
            {isTutorialModalOpen && (
                <div>
                    <TutorialModal CELL_SIZE={CELL_SIZE} amountOfTiles={amountOfTiles} isModalOpen={isTutorialModalOpen} updateCallback={updateCallback}/>
                </div>
            )}
        </div>
    );
}

export function TutorialModal({CELL_SIZE, amountOfTiles, isModalOpen, updateCallback, buttonText = "Play Puzzle", firstTutorial}) {
    const cellSize = CELL_SIZE * 4 / 5;

    const [firstMouseDown, setFirstMouseDown] = useState(false);
    const [firstMouseMove, setFirstMouseMove] = useState(false);
    const [firstRotate, setFirstRotate] = useState(false);
    const [firstMouseUp, setFirstMouseUp] = useState(false);

    const [currentRotation, setCurrentRotation] = useState('h');
    const [isVertical, setIsVertical] = useState(false);

    const [initialMouseX, setInitialMouseX] = useState(0);
    const [initialMouseY, setInitialMouseY] = useState(0);

    const firstMouseDownRef = useRef(false);
    const firstMouseMoveRef = useRef(false);
    const firstRotateRef = useRef(false);
    const firstMouseUpRef = useRef(false);

    const downText= useRef(null);
    const moveText= useRef(null);
    const rotateText= useRef(null);
    const upText= useRef(null);

    const initialMouseXRef = useRef(0);
    const initialMouseYRef = useRef(0);

    const currentRotationRef = useRef('h');
    const isVerticalRef = useRef(false);

    const [isMobile, setIsMobile] = useState(0);
    const mobileRotationText = ["While Dragging, Press R or Right Click to Rotate.", "While Dragging, Pinch and Twist to Rotate."];

    const [isStartModalOpen, setIsStartModalOpen] = useState(false);

    const openStartModal = () => {
        setIsStartModalOpen(!isStartModalOpen);
    }

    useEffect(() => {
        firstMouseDownRef.current = firstMouseDown;
        firstMouseMoveRef.current = firstMouseMove;
        firstMouseUpRef.current = firstMouseUp;
        firstRotateRef.current = firstRotate;
    }, [firstMouseDown, firstMouseUp, firstRotate, firstMouseMove]);

    useEffect(() => {
        if(firstRotate && upText.current){
            upText.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if(firstMouseMove && rotateText.current){
            rotateText.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if(firstMouseDown && moveText.current){
            moveText.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else if(downText.current){
            downText.current.scrollIntoView({ behavior: 'instant', block: 'nearest' });
        }
    }, [firstMouseDown, firstMouseUp, firstRotate, firstMouseMove]);

    const handleFirstMove = (e) => {
        if(isModalOpen){
            if(firstMouseDownRef.current && !firstMouseMoveRef.current){
                const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
                const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
                if(Math.abs(clientX-initialMouseXRef.current) > 25 || Math.abs(clientY-initialMouseYRef.current) > 25){
                    setFirstMouseMove(true);
                    soundGenerator.playTutorial();
                }
            }
        }
    }

    const handleFirstRotate = () => {
        if(isModalOpen){
            if(firstMouseDownRef.current && firstMouseMoveRef.current && !firstRotateRef.current) {
                setFirstRotate(true);
                soundGenerator.playTutorial();
            }
        }
    };

    const handleFirstUp = () => {
        if(isModalOpen){
            if(firstMouseDownRef.current && firstMouseMoveRef.current && firstRotateRef.current && !firstMouseUpRef.current){
                setFirstMouseUp(true);
                soundGenerator.playTutorial();
            }
            setIsVertical(currentRotationRef.current === 'v');
            isVerticalRef.current = (currentRotationRef.current === 'v');
        }
    }

    const handleFirstDown = (e) => {
        if(isModalOpen){
            if(!firstMouseDownRef.current){
                setFirstMouseDown(true);
                soundGenerator.playTutorial();
                if(e.type === 'touchstart') setIsMobile(1);
                const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
                const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
                setInitialMouseX(clientX);
                setInitialMouseY(clientY);
                initialMouseXRef.current = clientX;
                initialMouseYRef.current = clientY;
            }
        }
    }

    const handleRotation = (orientation) => {
        setCurrentRotation(orientation);
        currentRotationRef.current = orientation;
    }

    return(
        <div className="modal">
            <div className="modal-background" onClick={updateCallback}/>
            {!isStartModalOpen && (
                <div className="tutorial-content" style={{zIndex: 1000}}>
                    <div className="tutorial-container" style={{zIndex: 1000}}>
                        <img src={icon} className="modal-icon" alt="Domino Train" width="75px"/>
                        <div className="tutorial-header">Connect all {amountOfTiles} dominos from Start to Finish!</div>
                        <div className="tutorial-text">Dominos connect to Matching Pip values.</div>
                        <div className="example-area">
                            <FakeDomino CELL_SIZE={50} color={'#4CAF50'} value1={1} value2={2} rotation={270}/>
                            <FakeDomino CELL_SIZE={50} color={'#4CAF50'} value1={2} value2={3} rotation={270}/>
                            <FakeDomino CELL_SIZE={50} color={'#D44444'} value1={4} value2={5} rotation={270}/>
                        </div>
                        <div className="tutorial-text">Dominos must be connected on both ends.</div>
                        <div className="example-area" style={{width: `${3.75 * 2.5}rem`, height: `${1.9 * 2}rem`}}>
                            <FakeDomino CELL_SIZE={50} color={'#4CAF50'} value1={1} value2={2} rotation={270}/>
                            <FakeDomino CELL_SIZE={50} color={'#D44444'} value1={2} value2={3} rotation={0}/>
                            <FakeDomino CELL_SIZE={50} color={'#D44444'} value1={2} value2={4} rotation={270}/>
                        </div>
                        <div className="tutorial-text">Dominos cannot be connected in parallel.</div>
                        <div className="example-area">
                            <FakeDomino CELL_SIZE={50} color={'#D44444'} value1={1} value2={2} rotation={270}
                                        topTile={true}/>
                            <FakeDomino CELL_SIZE={50} color={'#D44444'} value1={3} value2={3} rotation={270}
                                        topTile={true}/>
                        </div>
                        <div className="example-area" style={{marginBottom: '0.5rem'}}>
                            <FakeDomino CELL_SIZE={50} color={'#4CAF50'} value1={1} value2={2} rotation={270}/>
                            <FakeDomino CELL_SIZE={50} color={'#4CAF50'} value1={2} value2={3} rotation={270}/>
                            <FakeDomino CELL_SIZE={50} color={'#4CAF50'} value1={3} value2={4} rotation={270}/>
                        </div>
                        <div className="tutorial-header" style={{fontSize: '1.2rem'}}>----- Controls -----</div>
                        <div className="tutorial-text-container">
                            <div ref={downText} className="tutorial-text"
                                 style={{color: firstMouseDown ? "#4CAF50" : "#f8f8ff"}}>
                                Click and Hold to Pick Up.
                            </div>
                            <div ref={moveText} className="tutorial-text"
                                 style={{color: firstMouseMove ? "#4CAF50" : "#f8f8ff"}}>
                                Hold and Drag to Move.
                            </div>
                            <div ref={rotateText} className="tutorial-text"
                                 style={{color: firstRotate ? "#4CAF50" : "#f8f8ff"}}>
                                {mobileRotationText[isMobile]}
                            </div>
                            <div ref={upText} className="tutorial-text"
                                 style={{color: firstMouseUp ? "#4CAF50" : "#f8f8ff"}}>
                                Release over Grid to Place.
                            </div>
                        </div>
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', alignItems: 'center', whiteSpace: 'nowrap'}}>
                                Try Me!
                                <img src={arrowIcon}
                                     style={{filter: 'invert(1)', height: '1.5rem', transform: 'scaleX(-1)', marginLeft: '0.75rem'}}
                                     alt="->"/>
                            </div>
                            <div className="tutorial-domino-holder" style={{width: cellSize * 3, height: cellSize * 3}}>
                                <div className="tutorial-domino-container" style={{
                                    width: isVertical ? cellSize : cellSize * 2,
                                    height: isVertical ? cellSize * 2 : cellSize
                                }}>
                                    <div className="tutorial-domino-wrapper"
                                         style={{
                                             position: 'relative',
                                             width: cellSize * 2,
                                             height: cellSize,
                                             touchAction: 'none'
                                         }}>
                                        <TutorialDomino
                                            CELL_SIZE={cellSize}
                                            onRotation={handleRotation}
                                            onFirstDown={handleFirstDown}
                                            onFirstMove={handleFirstMove}
                                            onFirstUp={handleFirstUp}
                                            onFirstRotate={handleFirstRotate}
                                            validPlace={firstMouseUp}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', alignItems: 'center', whiteSpace: 'nowrap'}}>
                                <img src={arrowIcon}
                                     style={{filter: 'invert(1)', height: '1.5rem', marginLeft: '0.75rem'}}
                                     alt="<-"/>
                                Try Me!
                            </div>
                        </div>
                    </div>
                    <div className="button-container">
                        {firstTutorial && (
                            <button className="button" onClick={openStartModal}>Begin</button>
                        )}
                        {!firstTutorial && (
                            <button className="button" onClick={updateCallback}>Back To Game</button>
                        )}
                    </div>
                </div>
            )}
            {isStartModalOpen && (
                <div>
                    <StartModal CELL_SIZE={CELL_SIZE} amountOfTiles={amountOfTiles} isModalOpen={isStartModalOpen} updateCallback={updateCallback}/>
                </div>
            )}
        </div>
    );
}

export function WinModal({endlessMode, handleEndlessMode, updateCallback}){
    const stats = JSON.parse(localStorage.getItem('DailyDominoStats'));
    const subtitle = endlessMode > 0 ? "Endless Mode" : months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();

    return (
        <div className="modal">
            <div className="modal-background" onClick={updateCallback}/>
            <div className="modal-content">
                <img src={icon} className="modal-icon" alt="[0/0]" width="75"/>
                <div className="modal-header">You Did It!</div>
                <div className="modal-subtext">{subtitle}</div>
                <div className="modal-text">You connected all the dominos in {statsBestTime(stats.lastTime)}!</div>
                <div className="stats-container" style={{margin: '0.5rem 0 0 0'}}>
                    <div className="stat">
                        <div className="stat-number">{stats.wins ? stats.wins : 0}</div>
                        <div className="stat-label">Solves</div>
                    </div>
                    <div className="stat">
                        <div className="stat-number">{stats.streak ? stats.streak : 0}</div>
                        <div className="stat-label">Day Streak</div>
                    </div>
                    <div className="stat">
                        <div className="stat-number">{stats.maxStreak ? stats.maxStreak : 0}</div>
                        <div className="stat-label">Max Streak</div>
                    </div>
                    <div className="stat">
                        <div className="stat-number">{(stats && stats.bestTime) ? statsBestTime(stats.bestTime) : "N/A"}</div>
                        <div className="stat-label">Best Time</div>
                    </div>
                </div>
                <div className="button-container">
                    <button className="button" onClick={handleEndlessMode}>Play Endless</button>
                    <a className="modal-sub-button" onClick={updateCallback}>Back To Board</a>
                </div>
            </div>
        </div>
    );
}

export function StatsModal({updateCallback}){
    const stats = JSON.parse(localStorage.getItem('DailyDominoStats'));

    return (
        <div className="modal">
            <div className="modal-background" onClick={updateCallback}/>
            <div className="modal-content" style={{height: '20rem'}}>
                <img src={icon} className="modal-icon" alt="[0/0]" width="75"/>
                <div className="modal-header">Game Statistics</div>
                <div className="modal-text">See how well you're doing!</div>
                <div className="stats-container">
                    <div className="stat">
                        <div className="stat-number">{(stats && stats.wins) ? stats.wins : 0}</div>
                        <div className="stat-label">Solves</div>
                    </div>
                    <div className="stat">
                        <div className="stat-number">{(stats && stats.streak) ? stats.streak : 0}</div>
                        <div className="stat-label">Day Streak</div>
                    </div>
                    <div className="stat">
                        <div className="stat-number">{(stats && stats.maxStreak) ? stats.maxStreak : 0}</div>
                        <div className="stat-label">Max Streak</div>
                    </div>
                    <div className="stat">
                        <div className="stat-number">{(stats && stats.bestTime) ? statsBestTime(stats.bestTime) : "N/A"}</div>
                        <div className="stat-label">Best Time</div>
                    </div>
                </div>
                <div className="button-container">
                    <button className="button" onClick={updateCallback}>Back To Game</button>
                </div>
            </div>
        </div>
    );
}

export function NewGameModal({updateCallback, handleNewGame}){
    const newGame = () => {
        handleNewGame();
        updateCallback();
    }

    return (
        <div className="modal">
            <div className="modal-background" onClick={updateCallback}/>
            <div className="modal-content" style={{height: '8rem', width: '16rem'}}>
                <div className="modal-header">Start New Game?</div>
                <div className="button-container" style={{flexDirection: 'row', gap: '0.5rem'}}>
                    <button className="button" onClick={newGame}>New Game</button>
                    <button className="cancel-button" onClick={updateCallback}>Cancel</button>
                </div>
            </div>
        </div>
    );
}