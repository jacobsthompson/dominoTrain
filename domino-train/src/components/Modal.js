import './modal.css'
import './tutorialmodal.css'
import './startmodal.css'
import logo from "../assets/DominoTrainLogo.svg";
import icon from "../assets/DominoTrainIcon.svg";
import TutorialDomino from "./TutorialDomino";
import {useEffect, useRef, useState} from "react";
import {soundGenerator} from "./SoundEffects";
import FakeDomino from "./FakeDomino";


export function StartModal({CELL_SIZE, amountOfTiles, isModalOpen, updateCallback}){
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const date = new Date();
    const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);

    const openTutorialModal = () => {
        setIsTutorialModalOpen(!isTutorialModalOpen);
    }

    return(
        <div className="modal">
        <div className="modal-background" onClick={updateCallback}/>
            {!isTutorialModalOpen && (
            <div className="start-content" style={{zIndex: 1000}}>
                <img src={icon} className="modal-icon" alt="Domino Train" width="75"/>
                <div className="start-header">Daily Dominos</div>
                <div className="start-text">Can you connect all the dominos?</div>
                <div className="start-text">{months[date.getMonth()]} {date.getDate()}, {date.getFullYear()}</div>
                <button className="button" onClick={updateCallback}>Play Puzzle</button>
                <a className="how-to-play-button" onClick={openTutorialModal}>How To Play?</a>
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


export function winModal({isModalOpen, updateCallback}){

}

export function TutorialModal({CELL_SIZE, amountOfTiles, isModalOpen, updateCallback}){
    const cellSize = CELL_SIZE * 4/5;

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
                    <div className="tutorial-text">Dominos cannot connected in parallel.</div>
                    <div className="example-area">
                        <FakeDomino CELL_SIZE={50} color={'#D44444'} value1={1} value2={2} rotation={270}
                                    topTile={true}/>
                        <FakeDomino CELL_SIZE={50} color={'#D44444'} value1={3} value2={3} rotation={270}
                                    topTile={true}/>
                    </div>
                    <div className="example-area">
                        <FakeDomino CELL_SIZE={50} color={'#4CAF50'} value1={1} value2={2} rotation={270}/>
                        <FakeDomino CELL_SIZE={50} color={'#4CAF50'} value1={2} value2={3} rotation={270}/>
                        <FakeDomino CELL_SIZE={50} color={'#4CAF50'} value1={3} value2={4} rotation={270}/>
                    </div>
                    <div className="tutorial-header">Controls</div>
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
                            While Dragging, Press R to Rotate.
                        </div>
                        <div ref={upText} className="tutorial-text"
                             style={{color: firstMouseUp ? "#4CAF50" : "#f8f8ff"}}>
                            Release over Grid to Place.
                        </div>
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
                </div>
                <button className="button" onClick={updateCallback}>Play Puzzle</button>
            </div>
        </div>
    );
}

export function WinModal({updateCallback}) {

}