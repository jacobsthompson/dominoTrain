import {Domino, Rotation} from "./types"
import {GRID_WIDTH, GRID_HEIGHT} from "./constants";

type Connection ={
    x: number;
    y: number;
    side: 'top' | 'bottom' | 'left' | 'right';
};

function getValueAtSide(domino: Domino, side: 'top' | 'bottom' | 'left' | 'right'): number {
    const { rotation, top, bot } = domino;

    switch (rotation) {
        case 0:
            return side === 'top' ? top : side === 'bottom' ? bot : -1;
        case 90:
            return side === 'right' ? top : side === 'left' ? bot : -1;
        case 180:
            return side === 'bottom' ? top : side === 'top' ? bot : -1;
        case 270:
            return side === 'left' ? top : side === 'right' ? bot : -1;
        default:
            return -1;
    }
}

function getAdjacentPositions(domino: Domino, gridX: number, gridY: number): Connection[] {
    const { rotation } = domino;
    const connections: Connection[] = [];

    // Domino occupies 2 cells based on rotation
    if (rotation === 0 || rotation === 180) {
        // Vertical orientation
        connections.push(
            { x: gridX - 1, y: gridY, side: 'left' },
            { x: gridX + 1, y: gridY, side: 'right' },
            { x: gridX, y: gridY - 1, side: 'top' },
            { x: gridX, y: gridY + 1, side: 'bottom' }
        );
    } else {
        // Horizontal orientation (90 or 270)
        connections.push(
            { x: gridX - 1, y: gridY, side: 'left' },
            { x: gridX + 1, y: gridY, side: 'right' },
            { x: gridX, y: gridY - 1, side: 'top' },
            { x: gridX, y: gridY + 1, side: 'bottom' }
        );
    }

    return connections.filter(
        conn => conn.x >= 0 && conn.x < GRID_WIDTH && conn.y >= 0 && conn.y < GRID_HEIGHT
    );
}

export function canPlaceDomino(
    domino: Domino,
    gridX: number,
    gridY: number,
    allDominos: Domino[],
    placedDominos: Set<string>
): boolean {
    // Check if position is within grid bounds
    if (gridX < 0 || gridY < 0 || gridX >= GRID_WIDTH || gridY >= GRID_HEIGHT) {
        return false;
    }

    // Check if domino fits in grid based on rotation
    if (domino.rotation === 0 || domino.rotation === 180) {
        if (gridY + 1 >= GRID_HEIGHT) return false;
    } else {
        if (gridX + 1 >= GRID_WIDTH) return false;
    }

    // Get all placed dominos
    const placed = allDominos.filter(d => placedDominos.has(d.id));

    // Check for overlaps with other placed dominos
    for (const other of placed) {
        if (other.id === domino.id) continue;

        // Simple overlap check
        const occupiedCells = getOccupiedCells(other);
        const newCells = getOccupiedCells({ ...domino, x: gridX, y: gridY });

        for (const cell of newCells) {
            if (occupiedCells.some(oc => oc.x === cell.x && oc.y === cell.y)) {
                return false;
            }
        }
    }

    // If this is the first domino, it's valid
    if (placed.length === 0) {
        return true;
    }

    // Check if at least one adjacent domino has matching values
    const adjacentPositions = getAdjacentPositions(domino, gridX, gridY);
    let hasValidConnection = false;

    for (const conn of adjacentPositions) {
        const adjacentDomino = placed.find(d => {
            const cells = getOccupiedCells(d);
            return cells.some(c => c.x === conn.x && c.y === conn.y);
        });

        if (adjacentDomino) {
            const ourValue = getValueAtSide(domino, conn.side);
            const theirSide = getOppositeSide(conn.side);
            const theirValue = getValueAtSide(adjacentDomino, theirSide);

            if (ourValue === theirValue && ourValue !== -1) {
                hasValidConnection = true;
                break;
            }
        }
    }

    return hasValidConnection;
}

function getOccupiedCells(domino: Domino): { x: number; y: number }[] {
    const { x, y, rotation } = domino;

    if (rotation === 0 || rotation === 180) {
        // Vertical
        return [
            { x, y },
            { x, y: y + 1 }
        ];
    } else {
        // Horizontal
        return [
            { x, y },
            { x: x + 1, y }
        ];
    }
}

function getOppositeSide(side: 'top' | 'bottom' | 'left' | 'right'): 'top' | 'bottom' | 'left' | 'right' {
    switch (side) {
        case 'top': return 'bottom';
        case 'bottom': return 'top';
        case 'left': return 'right';
        case 'right': return 'left';
    }
}