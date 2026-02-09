import {useEffect, useRef, useState} from "react";
import DominoPips from "./DominoPips";
import {CELL_SIZE} from "./constants";
import './style.css'

function Domino({id, value1, value2, onPlacement, onPickup, validatedGrid, clearBoard}){
    const [position, setPosition] = useState({x:0,y:0});
    const [rotation, setRotation]= useState(0);
    const [isPlaced, setIsPlaced] = useState(false);
    const [isDraggingVisual, setIsDraggingVisual] = useState(false);

    const containerRef = useRef(null);
    const dominoRef = useRef(null);
    const rotationRef = useRef(0);
    const isDraggingRef = useRef(false);
    const dragOffsetRef = useRef({x:0,y:0})

    const currentMousePos = useRef({x: 0, y: 0});

    useEffect(() => {
        if(clearBoard !== undefined && clearBoard > 0){
            setPosition({x: 0, y: 0});
            setIsPlaced(false);
            setRotation(0);
        }
        if(dominoRef.current){
            dominoRef.current.style.left = '0px';
            dominoRef.current.style.top = '0px';
        }
    }, [clearBoard]);

    useEffect(() => {
        rotationRef.current = rotation;
    }, [rotation]);

    const getRotationValues = (rot) => {
        switch(rot){
            case 0:
                return{
                    orientation: 'v',
                    topvalue: value1,
                    botvalue: value2
                };
            case 90:
                return{
                    orientation: 'h',
                    topvalue: value2,
                    botvalue: value1
                };
            case 180:
                return{
                    orientation: 'v',
                    topvalue: value2,
                    botvalue: value1
                };
            case 270:
                return{
                    orientation: 'h',
                    topvalue: value1,
                    botvalue: value2
                };
            default:
                return{
                    orientation: 'v',
                    topvalue: value1,
                    botvalue: value2
                };
        }
    }

    const recenterPointer = (e) => {
        const {orientation} = getRotationValues(rotation);
        const isVertical = orientation === 'v';
        const dominoWidth = isVertical ? CELL_SIZE : CELL_SIZE*2;
        const dominoHeight = isVertical ? CELL_SIZE*2 : CELL_SIZE;

        const dominoRect = dominoRef.current.getBoundingClientRect();
        const clickOffsetX = e.clientX - dominoRect.left;
        const clickOffsetY = e.clientY - dominoRect.top;

        const centerOffsetX = dominoWidth / 2;
        const centerOffsetY = dominoHeight / 2;

        const shiftX = clickOffsetX - centerOffsetX;
        const shiftY = clickOffsetY - centerOffsetY;

        return {shiftX, shiftY}
    }

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingRef.current && dominoRef.current){
                const clientX = e.clientX || e.touches?.[0]?.clientX;
                const clientY = e.clientY || e.touches?.[0]?.clientY;

                currentMousePos.current = {x: clientX, y: clientY}
                const dragOffset = dragOffsetRef.current;

                const newX = clientX - dragOffset.x;
                const newY = clientY - dragOffset.y;

                dominoRef.current.style.left = `${newX}px`;
                dominoRef.current.style.top = `${newY}px`;
            }
        };

        const handleMouseUp = (e) => {
            if (e.button !== 0 && e.type === 'mouseup') return;
            if (!isDraggingRef.current) return;

            isDraggingRef.current = false;
            setIsDraggingVisual(false);
            if(dominoRef.current) {
                dominoRef.current.style.cursor = 'grab';
            }

            const board = document.getElementById('board');
            const container = containerRef.current;
            const domino = dominoRef.current;
            if(!board || !container) {
                setPosition({x:0,y:0});
                if (dominoRef.current) {
                  dominoRef.current.style.left = '0px';
                  dominoRef.current.style.top = '0px';
                }
                return;
            }

            const boardRect = board.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();
            const dominoRect = domino.getBoundingClientRect();

            const dominoX = dominoRect.left + CELL_SIZE/2 - boardRect.left;
            const dominoY = dominoRect.top + CELL_SIZE/2 - boardRect.top;

            const gridX = Math.floor(dominoX/CELL_SIZE);
            const gridY = Math.floor(dominoY/CELL_SIZE);

            const { orientation, topvalue, botvalue} = getRotationValues(rotationRef.current);

            //NEW 1x2
            let cells = [];
            if(orientation === 'h'){
                cells = [
                {gridX: gridX, gridY: gridY, value: topvalue},
                {gridX: gridX + 1, gridY: gridY, value: botvalue}
            ];
            } else {
                cells = [
                    {gridX: gridX, gridY: gridY, value: topvalue},
                    {gridX: gridX, gridY: gridY + 1, value: botvalue}
                ];
            }

            const success = onPlacement(id, cells);

            if(success){
                const snappedX = boardRect.left - containerRect.left + (gridX * CELL_SIZE) + 1;
                const snappedY = boardRect.top - containerRect.top + (gridY * CELL_SIZE) + 1;

                setPosition({x:snappedX,y:snappedY});
                if (dominoRef.current) {
                  dominoRef.current.style.left = `${snappedX}px`;
                  dominoRef.current.style.top = `${snappedY}px`;
                }
                setIsPlaced(true);
            } else {
                setPosition({x:0,y:0});
                setRotation(0);
                if (dominoRef.current) {
                  dominoRef.current.style.left = '0px';
                  dominoRef.current.style.top = '0px';
                }
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('touchmove', handleMouseMove);
        document.addEventListener('touchend', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('touchmove', handleMouseMove);
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [id,value1,value2,onPlacement,isPlaced]);

    const handleMouseDown = (e) => {
        if (e.button !== 0 && e.type === 'mousedown') return;

        if(e.type === 'touchstart'){
            e.preventDefault();
        }

        if (isPlaced && onPickup) {
            onPickup(id);
            setIsPlaced(false);
        }

        isDraggingRef.current = true;
        setIsDraggingVisual(true);

        const { shiftX, shiftY} = recenterPointer(e);


        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;

        dragOffsetRef.current = {
            x: clientX - position.x - shiftX,
            y: clientY - position.y - shiftY
        };

        const newX = clientX - dragOffsetRef.current.x;
        const newY = clientY - dragOffsetRef.current.y;

        if(dominoRef.current) {
            dominoRef.current.style.left = `${newX}px`;
            dominoRef.current.style.top = `${newY}px`;
            dominoRef.current.style.cursor = 'grabbing';
        }
    };

    const handleRotation = () => {
        if(isDraggingRef.current){
            const {orientation: currentOrientation} = getRotationValues(rotationRef.current);
            const currentIsVertical = currentOrientation === 'v';

            const currentLeft = parseFloat(dominoRef.current.style.left) || position.x;
            const currentTop = parseFloat(dominoRef.current.style.top) || position.y;

            const currentWidth = currentIsVertical ? CELL_SIZE : CELL_SIZE*2;
            const currentHeight = currentIsVertical ? CELL_SIZE*2 : CELL_SIZE;
            const centerX = currentLeft + currentWidth/2;
            const centerY = currentTop + currentHeight/2;

            const newRotation = (rotationRef.current + 90) % 360;

            const{orientation: newOrientation} = getRotationValues(newRotation);
            const newIsVertical = newOrientation === 'v';

            const newWidth = newIsVertical ? CELL_SIZE : CELL_SIZE*2;
            const newHeight = newIsVertical ? CELL_SIZE*2 : CELL_SIZE;

            const newLeft = centerX - newWidth/2;
            const newTop = centerY - newHeight/2;

            if(dominoRef.current){
                dominoRef.current.style.left = `${newLeft}px`;
                dominoRef.current.style.top = `${newTop}px`;
            }

            dragOffsetRef.current = {
                x: currentMousePos.current.x - newLeft,
                y: currentMousePos.current.y - newTop
            }

            setPosition({x: newLeft, y: newTop});
            setRotation(newRotation);
        }
    }

    const handleKeyDown = (e) => {
        // console.log(e.key);
        if (e.key === 'r') {
            handleRotation(e);
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        handleRotation(e);
    };

    const checkValidity = () => {
        if(!isPlaced || !validatedGrid){
            return null;
        }

        const board = document.getElementById('board');
        const domino = dominoRef.current;
        const boardRect = board.getBoundingClientRect();
        const dominoRect = domino.getBoundingClientRect();

        const dominoX = dominoRect.left + CELL_SIZE/2 - boardRect.left;
        const dominoY = dominoRect.top + CELL_SIZE/2 - boardRect.top;

        const gridX = Math.floor(dominoX/CELL_SIZE);
        const gridY = Math.floor(dominoY/CELL_SIZE);

        return validatedGrid[gridY]?.[gridX] !== null;
    }

    const getDominoColor = () => {
        const isValid = checkValidity();
        if(!isPlaced || isValid === null){ return '#191919'; }
        return isValid ? '#4CAF50' : '#f44336';
    }

    const {orientation, topvalue, botvalue} = getRotationValues(rotation);
    const isVertical = orientation === 'v';
    const width = isVertical ? CELL_SIZE : CELL_SIZE * 2;
    const height = isVertical ? CELL_SIZE*2 : CELL_SIZE;

    return (
        <div className="domino-wrapper" ref={containerRef} >
            <div
                className="domino"
                ref={dominoRef}
                onMouseDown={handleMouseDown}
                onTouchStart={handleMouseDown}
                onContextMenu={handleContextMenu}
                onKeyDown={handleKeyDown}
                style={{
                    width: width,
                    height: height,
                    left: position.x,
                    top: position.y,
                    backgroundColor: '#f8f8ff',
                    cursor: isPlaced ? 'default' : 'grab',
                    zIndex: isDraggingVisual ? 1000 : 1,
                    flexDirection: isVertical ? 'column' : 'row',
                    boxShadow: isDraggingVisual ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                }}
            >
                <div
                    className="domino-half top-half-domino"
                    style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: isVertical ? '8px 8px 0 0': '8px 0 0 8px',
                        borderStyle: isVertical ? "none" : "none none solid none"
                    }}
                >
                    <DominoPips value={topvalue} color={getDominoColor()}/>
                </div>
                <div className="domino-divider"/>
                <div
                    className="domino-half bot-half-domino"
                    style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: isVertical ? ' 0 0 8px 8px': '0 8px 8px 0'
                    }}>
                     <DominoPips value={botvalue} color={getDominoColor()}/>
                </div>
            </div>
        </div>
    );
}

export default Domino;