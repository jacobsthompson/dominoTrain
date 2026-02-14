import './modal.css'
import logo from "../assets/DominoTrainLogo.svg";
import TutorialDomino from "./TutorialDomino";
import {useEffect, useRef, useState} from "react";
import {soundGenerator} from "./SoundEffects";

export function TutorialModal({CELL_SIZE, isModalOpen, updateCallback}){
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
            <div className="modal-content" style={{zIndex: 1000}}>
                <img src={logo} className="modal-logo" alt="Domino Train" width="225px"/>
                Create the Longest Domino Train you can by Connecting Dominos with Matching Values.
                <div className="tutorial-container" style={{zIndex: 1000}}>
                    <div className="tutorial-text-container">
                        <div className="tutorial-text" style={{color: firstMouseDown ? "#4CAF50" : "#f9f9ff"}}>
                            Click and Hold to Pick Up Domino
                        </div>

                        {firstMouseDown && (
                            <div className="tutorial-text" style={{ color: firstMouseMove ? "#4CAF50" : "#f9f9ff"}}>
                                Hold and Drag to Move Domino
                            </div>
                        )}
                        {firstMouseMove && (
                            <div className="tutorial-text" style={{color: firstRotate ? "#4CAF50" : "#f9f9ff"}}>
                                While Dragging, Press R to Rotate Domino
                            </div>
                        )}
                        {firstRotate && (
                            <div className="tutorial-text" style={{color: firstMouseUp ? "#4CAF50" : "#f9f9ff"}}>
                                Release over Grid to Place Domino
                            </div>
                        )}
                    </div>
                    <div className="tutorial-domino-holder" style={{width: CELL_SIZE * 3, height: CELL_SIZE * 3}}>
                        <div className="tutorial-domino-container" style={{
                            width: isVertical ? CELL_SIZE : CELL_SIZE * 2,
                            height: isVertical ? CELL_SIZE * 2 : CELL_SIZE
                        }}>
                            <div className="tutorial-domino-wrapper"
                                 style={{position: 'relative', width: CELL_SIZE * 2, height: CELL_SIZE, touchAction: 'none'}}>
                                <TutorialDomino
                                    CELL_SIZE={CELL_SIZE}
                                    onRotation={handleRotation}
                                    onFirstDown={handleFirstDown}
                                    onFirstMove={handleFirstMove}
                                    onFirstUp={handleFirstUp}
                                    onFirstRotate={handleFirstRotate}
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <button className="modal-button" onClick={updateCallback}> Start</button>
            </div>
        </div>
    );
}

export function WinModal({updateCallback}) {

}