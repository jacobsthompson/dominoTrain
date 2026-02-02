import {useEffect, useRef} from "react";
import { Domino } from "../game/types";
import { CELL_SIZE } from "../game/constants";

type PickupOffset = {
  x: number;
  y: number;
}

let globalOffset: PickupOffset = {x: 0, y: 0}

export function usePickup(
  pickupId: string | null,
  setPickupId: (id: string | null) => void,
  setDominos: React.Dispatch<React.SetStateAction<Domino[]>>,
  onDominoPlaced: (id: string, gridx: number, gridy: number) => void
) {
  useEffect(() => {
    if (!pickupId) return;

    function onMove(e: MouseEvent) {
      if (!pickupId) return;

      setDominos(ds =>
        ds.map(d =>
          d.id === pickupId
            ? {
                ...d,
                x: e.clientX - globalOffset.x,
                y: e.clientY - globalOffset.y
              }
            : d
        )
      );
    }

    function onUp(e: MouseEvent) {
      if (!pickupId) return;

      const gridWrapper = document.querySelector('.grid-wrapper');
      if(gridWrapper){
        const rect = gridWrapper.getBoundingClientRect();
        const relativex = e.clientX - rect.left - 16;
        const relativey = e.clientY - rect.top - 16;

        const gridx = Math.floor(relativex / CELL_SIZE);
        const gridy = Math.floor(relativey / CELL_SIZE);

        onDominoPlaced(pickupId, gridx, gridy);
      }

      setPickupId(null);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [pickupId, setDominos, setPickupId, onDominoPlaced]);

  return {
        setOffset: (offset: PickupOffset) => {
            globalOffset = offset;
        }
    };
}
