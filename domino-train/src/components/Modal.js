import './modal.css'
import logo from "../assets/DominoTrainLogo.svg";
import TutorialDomino from "./TutorialDomino";
import {useState} from "react";

export function TutorialModal({CELL_SIZE, updateCallback}){
    const displayText = ["Click and Hold to Pick Up", "Drag to Move Domino", "Press R to Rotate Domino", "Let go to Place Domino"];

    const [displayTextIndex, setDisplayTextIndex] = useState(0);

    const handleKeyDown = (e) => {
        if (e.key === 'r') {
            setDisplayTextIndex(displayTextIndex + 1);
        }
    };

    return(
        <div className="modal">
            <div className="modal-background">
                <div className="modal-content">
                    <img src={logo} className="logo" alt="Domino Train" width="250"/>
                    Create The Longest Domino Train You Can.
                    <div className="tutorial-domino">
                        {displayText[displayTextIndex]}
                        <TutorialDomino CELL_SIZE={CELL_SIZE}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export function WinModal({updateCallback}) {

}