import {useState} from "react";
import {createGrid} from "../game/grid";
import {Domino} from "../game/types";
import Grid from "./Grid";
import DominoView from "./Domino";

export default function Board(){
    const [grid, setGrid] = useState(createGrid());
    const [dominos, setDominos] = useState<Domino[]>([]);
    const [pickupId, setPickupId] = useState<string | null>(null);

    function rotateDomino(id: string) {
        setDominos(ds =>
            ds.map(d =>
                d.id === id
                ? {...d, rotation: ((d.rotation + 90) % 360) as any }
                : d
            )
        );
    }

    function moveDomino(id: string, x: number, y: number){}

    return(
        <div className="board">
            <Grid grid={grid}/>
            {dominos.map(domino =>(
                <DominoView
                    domino={domino}
                    onRotate={rotateDomino}
                    onPickup={setPickupId}
                />
            ))}
        </div>
    );
}