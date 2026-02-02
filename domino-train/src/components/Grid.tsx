import Cell from "./Cell";
import {Grid as GridType, Domino} from "../game/types";
import {GRID_WIDTH, GRID_HEIGHT} from "../game/constants";
import DominoView from "./Domino";
import '../styles/grid.css'

type GridProps = {
    grid: GridType;
    dominos: Domino[];
    placedDominos: Set<string>;
}

export default function Grid({grid, dominos, placedDominos}: GridProps){
    const placedDominosList = dominos.filter(d => placedDominos.has(d.id));

    return(
        <div className="grid-wrapper">
            <div
                className="grid"
                style={{
                    gridTemplateColumns: `repeat(${GRID_WIDTH}, 1fr)`,
                    gridTemplateRows: `repeat(${GRID_HEIGHT}, 1fr)`
                }}
            >
                {Array.from({length: GRID_HEIGHT}).map((_,row) =>
                    Array.from({length: GRID_WIDTH}).map((_,col) => (
                        <Cell key={`${row}-${col}`} row={row} col={col}/>
                    ))
                )}
            </div>

            <div className="placed-dominos">
                {placedDominosList.map(domino =>(
                    <DominoView
                        key = {domino.id}
                        domino = {domino}
                        onRotate={() => {}}
                        onPickup={() => {}}
                        isPlaced = {true}
                        isPickedup = {false}
                    />
                ))}
            </div>
        </div>
    );
}