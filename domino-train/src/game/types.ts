export type Rotation = 0 | 90 | 180 | 270;

export type Domino = {
    id: string;
    top: number;
    bot: number;
    x: number;
    y: number;
    rotation: Rotation;
};

export type GridCell = {
    dominoId: string | null;
};

export type Grid = GridCell[][];