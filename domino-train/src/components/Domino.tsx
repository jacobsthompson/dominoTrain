import {Domino} from "../game/types";
import {CELL_SIZE} from "../game/constants";

type DominoViewProps = {
    domino: Domino;
    onRotate: (id: string) => void;
    onPickup: (id: string, offsetx: number, offsety: number) => void;
    isPlaced: boolean;
    isPickedup: boolean;
    offsetRef?: React.RefObject<{ x: number, y: number }>
};

export default function DominoView({
    domino,
    onRotate,
    onPickup,
    isPlaced,
    isPickedup,
    offsetRef
}: DominoViewProps) {
    const className = `domino ${isPlaced ? 'placed' : ''} ${isPickedup ? 'picked-up' : ''}`

    const handleMouseDown = (e: React.MouseEvent) => {
        if (isPlaced) return;

        e.preventDefault();
        const dominoWrapper = document.querySelector(className);
        if (dominoWrapper) {
            const rect = dominoWrapper.getBoundingClientRect();
            const offsetx = rect.width / 2;
            const offsety = rect.height / 2;

            if (offsetRef) {
                offsetRef.current = {x: offsetx, y: offsety};
            }

            onPickup(domino.id, e.clientX - offsetx, e.clientY - offsety);
        }
    };

    const handleContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isPlaced) {
            onRotate(domino.id);
        }
    };

    const style: React.CSSProperties = isPickedup ? {
        transform: `rotate(${domino.rotation}deg)`,
        left: `${domino.x}px`,
        top: `${domino.y}px`,
        position: 'fixed',
        zIndex: 1000,
        pointerEvents: 'none'
    } : isPlaced ? {
        transform: `rotate(${domino.rotation}deg)`,
        left: `${domino.x * CELL_SIZE}px`,
        top: `${domino.y * CELL_SIZE}px`,
        position: 'absolute'
    } : {
        transform: `rotate(${domino.rotation}deg)`,
    };

    return(
        <div
            className={className}
            style={style}
            onMouseDown={handleMouseDown}
            onContextMenu={handleContextMenu}
        >
            <div className="domino-half domino-top">
                <span className="domino-value">{domino.top}</span>
            </div>
            <div className="domino-divider"/>
            <div className="domino-half domino-bottom">
                <span className="domino-value">{domino.bot}</span>
            </div>
        </div>
    );
}