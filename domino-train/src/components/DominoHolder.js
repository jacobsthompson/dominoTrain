import {useState} from "react";
import Domino from "./Domino";
import './style.css'
import {GRID_WIDTH, HOLDER_SCALING} from "./Constants";

function shuffle(arr) {
  	for (let i = arr.length - 1; i > 0; i--) {
    	const j = Math.floor(Math.random() * (i + 1));
    	[arr[i], arr[j]] = [arr[j], arr[i]];
  	}
  	return arr;
}

function DominoHolder({count, solution, onPlacement, onRemoval, grid, validatedGrid, clearBoard, CELL_SIZE}){
    const [dominos] = useState(() => {
        let generatedDominos = Array.from({length: count}, (_, i) => ({
            id: i + 1,
            value1: solution[i*2],
            value2: solution[i*2+1]
        }));
        console.log(generatedDominos);
        return shuffle(generatedDominos);
    });

    const handlePlacement = (dominoId, cells) => {
       return onPlacement(dominoId, cells);
    };

    const handlePickup = (dominoId) => {
        onRemoval(dominoId);
    };

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
                           validatedGrid={validatedGrid}
                           grid={grid}
                           clearBoard={clearBoard}
                       />
                   </div>
               ))}
           </div>
       </div>
   );
}

export default DominoHolder;