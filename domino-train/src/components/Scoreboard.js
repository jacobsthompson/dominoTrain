import {useEffect, useRef, useState} from "react";
import "./scoreboard.css"
import {soundGenerator} from "./SoundEffects";

function Scoreboard({score, topScore = 12}){
    const [displayScore, setDisplayScore] = useState(0);
    const [animating, setAnimating] = useState(false);
    const previousScore = useRef(0);

    useEffect(() => {
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
                    return score;
                }
                return newScore;
            });
        }, 150);

        return () => clearInterval(interval);
    }, [score, displayScore]);

    const playSound = (score) => {
        soundGenerator.playScore(score-1);
    }

    return (
        <div className="scoreboard-container">
            <div className="scoreboard">
                {Array.from({length: topScore}, (_,index) => (
                    <div
                        key={index}
                        className={`score-domino ${index < displayScore ? 'filled' : ''}`}
                    >
                        <div className="score-domino-fill"/>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Scoreboard;