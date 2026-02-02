import {useEffect, useRef, useState} from "react";
import {GRID_SIZE, CELL_SIZE} from "./constants";

function Domino({id, value, onPlacement}){
    const [position, setPosition] = useState({x:100,y:100});
    const [isPlaced, setIsPlaced] = useState(false);
    // const [isDragging, setIsDragging] = useState(false);
    // const [dragOffset, setDragOffset] = useState({x:0,y:0});

    const containerRef = useRef(null);
    const dominoRef = useRef(null);
    const isDraggingRef = useRef(false);
    const dragOffsetRef = useRef({x:0,y:0})

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingRef.current && dominoRef.current){
                let dragOffset = dragOffsetRef.current;

                const newX = e.clientX - dragOffset.x;
                const newY = e.clientY - dragOffset.y;

                dominoRef.current.style.left = `${newX}px`;
                dominoRef.current.style.top = `${newY}px`;
            }
        };

        const handleMouseUp = (e) => {
            if (!isDraggingRef.current) return;

            isDraggingRef.current = false;
            if(dominoRef.current) {
                dominoRef.current.style.cursor = 'grab';
            }

            const board = document.getElementById('board');
            const container = containerRef.current;
            if(!board || !container) return;

            const boardRect = board.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const relativeX = e.clientX - boardRect.left;
            const relativeY = e.clientY - boardRect.top;

            const gridX = Math.floor(relativeX/CELL_SIZE);
            const gridY = Math.floor(relativeY/CELL_SIZE);

            if (gridX >= 0 && gridX < GRID_SIZE && gridY >= 0 && gridY < GRID_SIZE){
                const snappedX = boardRect.left - containerRect.left + (gridX * CELL_SIZE) + 1;
                const snappedY = boardRect.top - containerRect.top + (gridY * CELL_SIZE) + 1;

                setPosition({x:snappedX,y:snappedY});
                setIsPlaced(true);

                onPlacement(id, value, gridX, gridY);
            } else {
                const currentX = parseFloat(dominoRef.current.style.left);
                const currentY = parseFloat(dominoRef.current.style.top);
                setPosition({ x: currentX, y: currentY });
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [id,value,onPlacement]);

    const handleMouseDown = (e) => {
        if (isPlaced) return;

        isDraggingRef.current = true;
        dragOffsetRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        if(dominoRef.current) {
            dominoRef.current.style.cursor = 'grabbing';
        }
    };

    return (
        <div
            className="Domino"
            ref={containerRef}
            style={{width: '100vw', height: '100vh', position: 'relative'}}
        >
            <div
                ref={dominoRef}
                onMouseDown={handleMouseDown}
                style={{
                    position: 'absolute',
                    left: position.x,
                    top: position.y,
                    width: 50,
                    height: 50,
                    backgroundColor: isPlaced ? '#2196F3' : '#4CAF50',
                    cursor: isPlaced ? 'default' : 'grab',
                    userSelect: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
            >
                {value}
            </div>
        </div>
    );
}

export default Domino;