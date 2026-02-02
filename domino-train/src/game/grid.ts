import {Grid} from "./types";
import {GRID_WIDTH, GRID_HEIGHT} from "./constants";

export function createGrid(): Grid {
    return Array.from({length: GRID_WIDTH}, () =>
        Array.from({length: GRID_HEIGHT}, () => ({dominoId: null}))
    );
}

export function placeDomino(
    grid: Grid,
    x: number,
    y: number,
    dominoId: string
): Grid {
    const newGrid = grid.map(row => row.map(cell => ({...cell})));
    newGrid[x][y].dominoId = dominoId;
    return newGrid;
}