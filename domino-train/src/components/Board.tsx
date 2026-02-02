import {useCallback, useState} from "react";
import {createGrid} from "../game/grid";
import { Domino } from "../game/types";
import Grid from "./Grid";
import DominoView from "./Domino";
import {usePickup} from "../hooks/usePickup";
import {canPlaceDomino} from "../game/rules";
import '../styles/grid.css';
import createDominos, {generateRandomDominos} from "../utilities/createDominos";

export default function Board(){
    const [grid, setGrid] = useState(createGrid());
    const [dominos, setDominos] = useState<Domino[]>(generateRandomDominos(12));

    const [pickupId, setPickupId] = useState<string | null>(null);
    const [placedDominos, setPlacedDominos] = useState<Set<string>>(new Set());
    const [score, setScore] = useState(0);

    const rotateDomino= useCallback((id: string) => {
        setDominos(ds =>
            ds.map(d =>
                d.id === id
                ? {...d, rotation: ((d.rotation + 90) % 360) as any }
                : d
            )
        );
    }, []);

    const handleDominoPlaced = useCallback((id: string, gridx: number, gridy: number) => {
        const domino = dominos.find(d => d.id === id);
        if (!domino) return;

        if (canPlaceDomino(domino, gridx, gridy, dominos, placedDominos)) {

            setDominos(ds =>
                ds.map(d =>
                    d.id === id
                        ? { ...d, x: gridx, y: gridy }
                        : d
                )
            );
            setPlacedDominos(prev => new Set(prev).add(id));
            setScore(prev => prev + 1);
        } else {
            setDominos(ds =>
                ds.map(d =>
                    d.id === id
                        ? { ...d, x: 0, y: 0 }
                        : d
                )
            );
        }
    }, [dominos, placedDominos]);

    const resetGame = useCallback(() => {
        setGrid(createGrid());
        setPlacedDominos(new Set());
        setScore(0);
    }, []);

    const pickupHelpers = usePickup(pickupId, setPickupId, setDominos, handleDominoPlaced);

    const handlePickup = useCallback((id: string, offsetX: number, offsetY: number) => {
        console.log('Picking up domino:', id, 'offset:', offsetX, offsetY);
        pickupHelpers.setOffset({ x: offsetX, y: offsetY });
        setPickupId(id);
    }, [pickupHelpers]);

    return(
        <div className="board">
            <div className="game-header">
                <h1>Domino Train</h1>
                <div className="game-info">
                    <div className="score">Score: {score}</div>
                    <button onClick={resetGame} className="reset-button">Clear Board</button>
                </div>
            </div>

            <div className="game-container">
                <Grid grid={grid} dominos={dominos} placedDominos={placedDominos}/>

                <div className="dominoHolder">
                    <h3>Available Dominos</h3>
                    <div className="domino-list">
                        {dominos.filter(d => !placedDominos.has(d.id))
                            .map(domino => (
                            <DominoView
                                key={domino.id}
                                domino={domino}
                                onRotate={rotateDomino}
                                onPickup={handlePickup}
                                isPlaced={placedDominos.has(domino.id)}
                                isPickedup={pickupId === domino.id}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}