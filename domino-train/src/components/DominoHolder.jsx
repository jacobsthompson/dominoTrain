import { useState } from "react";
import Domino from "./Domino";
import './style.css'
import {CELL_SIZE} from "./constants";

function DominoHolder({count, onPlacement, onRemoval}){
    const [dominos] = useState(() => {
        return Array.from({length: count}, (_, i) => ({
            id: i + 1,
            value1: Math.floor(Math.random() * 6) + 1,
            value2: Math.floor(Math.random() * 6) + 1
        }));
    });

    const [placedDominos, setPlacedDominos] = useState(new Set());

    const handlePlacement = (dominoId, cells) => {
       const success = onPlacement(dominoId, cells);

       if (success){
           setPlacedDominos(prev => new Set([...prev, dominoId]));
       }

       return success;
    };

    const handlePickup = (dominoId) => {
        setPlacedDominos(prev => {
            const newSet = new Set(prev);
            newSet.delete(dominoId);
            return newSet;
        });

        onRemoval(dominoId);
    };

   return(
       <div className="domino-holder" >
           <h3 style={{marginTop: 0}}>Available Dominos</h3>
           <div className="domino-holder-dominos" style={{height: CELL_SIZE*2}}>
               {dominos.map(domino => (
                   <div key={domino.id} style={{position: 'relative', width: CELL_SIZE + CELL_SIZE/2, height: CELL_SIZE*2}}>
                       <Domino
                           id={domino.id}
                           value1={domino.value1}
                           value2={domino.value2}
                           onPlacement={handlePlacement}
                           onPickup={handlePickup}
                       />
                   </div>
               ))}
           </div>
       </div>
   );
}

export default DominoHolder;