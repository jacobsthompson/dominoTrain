import {useEffect, useRef, useState} from "react";
import "./scoreboard.css"
import {soundGenerator} from "./SoundEffects";
import {GRID_WIDTH} from "./Constants";

export default function Scoreboard({CELL_SIZE, side, score, topScore, solutionFound, handleWon, skipAnimation}){
    const [displayScore, setDisplayScore] = useState(0);
    const [animating, setAnimating] = useState(false);
    const previousScore = useRef(0);

    useEffect(() => {
        if(skipAnimation){
            console.log("Skipping")
            setDisplayScore(score);
            return;
        }

        if(score === displayScore) return;

        setAnimating(true);
        const increment = score > displayScore ? 1 : -1;
        const interval = setInterval(() => {
            setDisplayScore(prev => {
                const newScore = prev + increment;
                playSound(newScore);

                if(increment > 0 && newScore > previousScore.current){
                    previousScore.current = newScore;
                }

                if((increment > 0 && newScore >= score) ||
                    (increment < 0 && newScore <= score)) {
                    setAnimating(false);
                    clearInterval(interval);

                    if(newScore === topScore && handleWon) {
                        setTimeout(() => handleWon(), 300);
                    }

                    return score;
                }
                return newScore;
            });
        }, 150);

        return () => clearInterval(interval);
    }, [score, displayScore]);

    const playSound = (score) => {
        soundGenerator.playScore(score-1, topScore-1);
    }

    console.log("Returning");

    return (
        <div className="scoreboard-container" style={{width: CELL_SIZE * GRID_WIDTH + 2}}>
            <div className="scoreboard">
                {Array.from({length: topScore}, (_,index) => (
                    <div
                        key={index}
                        className={`score-domino ${index < displayScore ? 'filled' : ''}`}
                        style={{
                            borderRadius: side === 'top' ?
                                (index === 0 ? '0.25rem 0 0 0' : (index === topScore-1 ? '0 0.25rem 0px 0' : '0')) :
                                (index === 0 ? '0 0 0 0.25rem' : (index === topScore-1 ? '0 0px 0.25rem 0' : '0')),
                            boxShadow: (score === topScore && solutionFound) ? '0 0 2rem #4CAF50' : 'none',
                            transition: skipAnimation ? 'none' : undefined
                        }}
                    >
                        <div
                            className="score-domino-fill"
                            style={{
                                backgroundColor: index === topScore-1 ? (solutionFound ? '#4CAF50' : '#D44444') : '#4CAF50',
                                transition: skipAnimation ? 'none' : undefined
                            }}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}