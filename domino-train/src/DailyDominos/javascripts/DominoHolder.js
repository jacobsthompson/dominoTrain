import {useEffect, useRef, useState} from "react";
import {GRID_WIDTH, HOLDER_SCALING} from "./Constants";
import Domino from "./Domino";
import '../stylesheets/dominoholder.css'

export default function DominoHolder({count, solution, onPlacement, onRemoval, grid, validatedGrid, clearBoard, CELL_SIZE, returnStates, initialStates}){
    const [dominos] = useState(() => {
        return Array.from({length: count}, (_, i) => ({
            id: i + 1,
            value1: solution[i*2],
            value2: solution[i*2+1]
        }));
    });

    const currentlyDraggingId = useRef(null);

    const handlePlacement = (dominoId, cells) => {
       return onPlacement(dominoId, cells);
    };

    const handlePickup = (dominoId) => {
        onRemoval(dominoId);
    };

    const handleDragStart = (dominoId) => {
        if(currentlyDraggingId.current !== null && currentlyDraggingId.current !== dominoId){
            return false;
        }
        currentlyDraggingId.current = dominoId;
        return true;
    };

    const handleDragEnd = (dominoId) => {
        if(currentlyDraggingId.current === dominoId){
            currentlyDraggingId.current = null;
        }
    };

    const dominoStates = useRef({});

    const getDominoState = (dominoId, x, y, gridx, gridy, rotation, isPlaced) => {
        dominoStates.current[dominoId] = {x: x,y: y, gridx: gridx,gridy: gridy, rotation: rotation, isPlaced: isPlaced};
        returnStates(dominoStates.current);
    }

    const getClearState = (dominoId, x, y, gridx, gridy, rotation, isPlaced) => {
        dominoStates.current[dominoId] = {x: x,y: y, gridx: gridx,gridy: gridy, rotation: rotation, isPlaced: isPlaced};
    }

   return(
       <div className="domino-holder" style={{width: `${CELL_SIZE * (GRID_WIDTH+2)}px`}}>
           <div className="domino-holder-dominos">
               {dominos.map(domino => (
                   <div key={domino.id} style={{position: 'relative', width: CELL_SIZE*2*HOLDER_SCALING, height: CELL_SIZE*HOLDER_SCALING}}>
                       <Domino
                           CELL_SIZE={CELL_SIZE}
                           id={domino.id}
                           value1={domino.value1}
                           value2={domino.value2}
                           onPlacement={handlePlacement}
                           onPickup={handlePickup}
                           onDragStart={handleDragStart}
                           onDragEnd={handleDragEnd}
                           validatedGrid={validatedGrid}
                           grid={grid}
                           clearBoard={clearBoard}
                           returnState={getDominoState}
                           clearState={getClearState}
                           initialState={initialStates?.[domino.id]}
                       />
                   </div>
               ))}
           </div>
       </div>
   );
}