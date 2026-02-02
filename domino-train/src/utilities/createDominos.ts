import {Domino} from "../game/types";

let dominoCounter = 0;

export default function createDominos(top: number, bot: number): Domino {
    dominoCounter++
    return{
        id: `domino-${dominoCounter}-${Date.now()}`,
        top,
        bot,
        x: 0,
        y: 0,
        rotation: 0
    };
}

export function generateRandomDominos(count: number): Domino[] {
    const dominos: Domino[] = [];

    for (let i = 0; i < count; i++) {
        const top = Math.floor(Math.random() * 6) + 1;
        const bot = Math.floor(Math.random() * 6) + 1;
        dominos.push(createDominos(top, bot));
    }

    return dominos;
}

export function generateStandardDominoSet(): Domino[] {
    const dominos: Domino[] = [];

    for (let i = 0; i <= 6; i++) {
        for (let j = i; j <= 6; j++) {
            dominos.push(createDominos(i, j));
        }
    }

    return dominos;
}