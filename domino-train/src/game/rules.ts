import {Domino, Grid, Rotation} from "./types"

export function rotate(r: Rotation): Rotation {
    switch (r){
        case 0:
            return 90;
        case 90:
            return 180;
        case 180:
            return 270;
        case 270:
            return 0;
    }
}

export function canPlaceDomino(
    domino: Domino,
    grid: Grid,
    dominos: Domino[]
): boolean {
    //neighbor checks
    return true;
}