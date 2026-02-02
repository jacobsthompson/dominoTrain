import {Domino} from "../game/types";

export default function DominoView({
    domino,
    onRotate,
    onPickup
}) {
    return(
        <div
            className="domino"
            style={{
                transform: `rotate(${domino.rotation}deg)`,
                left: domino.x * 60,
                top: domino.y * 30
            }}
            onMouseDown={() => onPickup(domino.id)}
            onContextMenu={e => {
                e.preventDefault();
                onRotate(domino.id);
            }}
        >
            <span>{domino.top}</span>
            <span>{domino.bot}</span>
        </div>
    );
}