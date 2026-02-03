import {useEffect, useRef, useState} from "react";
import {CELL_SIZE, GRID_WIDTH, GRID_HEIGHT} from "./constants";
import './style.css'

function Domino({id, value1, value2, initRotation = 0, onPlacement, onPickup}){
    const [position, setPosition] = useState({x:0,y:0});
    const [rotation, setRotation]= useState(initRotation);
    const [isPlaced, setIsPlaced] = useState(false);
    const [isDraggingVisual, setIsDraggingVisual] = useState(false);

    const containerRef = useRef(null);
    const dominoRef = useRef(null);
    const rotationRef = useRef(0);
    const isDraggingRef = useRef(false);
    const dragOffsetRef = useRef({x:0,y:0})

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
                    topvalue: value1,
                    botvalue: value2
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
                    topvalue: value2,
                    botvalue: value1
                };
            default:
                return{
                    orientation: 'v',
                    topvalue: value1,
                    botvalue: value2
                };
        }
    }

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
            if (e.button !== 0) return;

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
                if (dominoRef.current) {
                  dominoRef.current.style.left = '0px';
                  dominoRef.current.style.top = '0px';
                }
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [id,value1,value2,onPlacement,isPlaced]);

    const handleMouseDown = (e) => {
        if (e.button !== 0) return;

        if (isPlaced && onPickup) {
            onPickup(id);
            setIsPlaced(false);
        }

        isDraggingRef.current = true;
        setIsDraggingVisual(true);
        dragOffsetRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
        if(dominoRef.current) {
            dominoRef.current.style.cursor = 'grabbing';
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
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

            setPosition({x: newLeft, y: newTop});
            setRotation(newRotation);
        }
    };

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
                onContextMenu={handleContextMenu}
                style={{
                    width: width,
                    height: height,
                    left: position.x,
                    top: position.y,
                    backgroundColor: isPlaced ? '#2196F3' : '#4CAF50',
                    cursor: isPlaced ? 'default' : 'grab',
                    zIndex: isDraggingVisual ? 1000 : 1,
                    flexDirection: isVertical ? 'column' : 'row',
                    boxShadow: isDraggingVisual ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
                }}
            >
                <div
                    className="top-half-domino"
                    style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: isVertical ? '8px 8px 0 0': '8px 0 0 8px'
                    }}
                >
                    {topvalue}
                </div>
                <div
                    className="bot-half-domino"
                    style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: isVertical ? ' 0 0 8px 8px': '0 8px 8px 0'
                    }}>
                    {botvalue}
                </div>
            </div>
        </div>
    );
}

export default Domino;

//OLD VERSION 1x1

// import {useEffect, useRef, useState} from "react";
// import {GRID_SIZE, CELL_SIZE, GRID_WIDTH, GRID_HEIGHT} from "./constants";
// import './style.css'
//
// function Domino({id, value, onPlacement, onPickup, isFixed = false}){
//     const [position, setPosition] = useState({x:0,y:0});
//     const [isPlaced, setIsPlaced] = useState(false);
//
//     const dominoRef = useRef(null);
//     const isDraggingRef = useRef(false);
//     const [isDraggingVisual, setIsDraggingVisual] = useState(false);
//
//     const dragOffsetRef = useRef({x:0,y:0})
//
//     const containerRef = useRef(null);
//
//
//     useEffect(() => {
//         if(isFixed) return;
//
//         const handleMouseMove = (e) => {
//             if (isDraggingRef.current && dominoRef.current){
//                 let dragOffset = dragOffsetRef.current;
//
//                 const newX = e.clientX - dragOffset.x;
//                 const newY = e.clientY - dragOffset.y;
//
//                 dominoRef.current.style.left = `${newX}px`;
//                 dominoRef.current.style.top = `${newY}px`;
//             }
//         };
//
//         const handleMouseUp = (e) => {
//             if (!isDraggingRef.current) return;
//
//             isDraggingRef.current = false;
//             setIsDraggingVisual(false);
//             if(dominoRef.current) {
//                 dominoRef.current.style.cursor = 'grab';
//             }
//
//             const board = document.getElementById('board');
//             const container = containerRef.current;
//             if(!board || !container) {
//                 setPosition({x:0,y:0});
//                 if (dominoRef.current) {
//                   dominoRef.current.style.left = '0px';
//                   dominoRef.current.style.top = '0px';
//                 }
//                 return;
//             }
//
//             const boardRect = board.getBoundingClientRect();
//             const containerRect = container.getBoundingClientRect();
//
//             const relativeX = e.clientX - boardRect.left;
//             const relativeY = e.clientY - boardRect.top;
//
//             const gridX = Math.floor(relativeX/CELL_SIZE);
//             const gridY = Math.floor(relativeY/CELL_SIZE);
//
//             if (gridX >= 0 && gridX < GRID_WIDTH && gridY >= 0 && gridY < GRID_HEIGHT){
//                 const success = onPlacement(id, value, gridX, gridY);
//                 if(success){
//                     const snappedX = boardRect.left - containerRect.left + (gridX * CELL_SIZE) + 1;
//                     const snappedY = boardRect.top - containerRect.top + (gridY * CELL_SIZE) + 1;
//
//                     setPosition({x:snappedX,y:snappedY});
//                     setIsPlaced(true);
//                 } else {
//                     setPosition({x:0,y:0});
//                     if (dominoRef.current) {
//                       dominoRef.current.style.left = '0px';
//                       dominoRef.current.style.top = '0px';
//                     }
//                     console.log("moved back")
//                 }
//             } else {
//                 setPosition({x:0,y:0});
//                 if (dominoRef.current) {
//                   dominoRef.current.style.left = '0px';
//                   dominoRef.current.style.top = '0px';
//                 }
//             }
//         };
//
//         document.addEventListener('mousemove', handleMouseMove);
//         document.addEventListener('mouseup', handleMouseUp);
//
//         return () => {
//             document.removeEventListener('mousemove', handleMouseMove);
//             document.removeEventListener('mouseup', handleMouseUp);
//         };
//     }, [id,value,onPlacement]);
//
//     const handleMouseDown = (e) => {
//         if (isFixed) return;
//
//         if (isPlaced && onPickup) {
//             onPickup(id);
//             setIsPlaced(false);
//         }
//
//         isDraggingRef.current = true;
//         setIsDraggingVisual(true);
//         dragOffsetRef.current = {
//             x: e.clientX - position.x,
//             y: e.clientY - position.y
//         };
//         if(dominoRef.current) {
//             dominoRef.current.style.cursor = 'grabbing';
//         }
//     };
//
//     return (
//         <div className="domino-wrapper" ref={containerRef} >
//             <div
//                 className="domino"
//                 ref={dominoRef}
//                 onMouseDown={handleMouseDown}
//                 style={{
//                     left: position.x,
//                     top: position.y,
//                     backgroundColor: isFixed ? '#FFD700' : (isPlaced ? '#2196F3' : '#4CAF50'),
//                     cursor: isPlaced ? 'default' : 'grab',
//                     zIndex: isDraggingVisual ? 1000 : 1,
//                     boxShadow: isDraggingVisual ? '0 2px 8px rgba(0,0,0,0.2)' : 'none'
//                 }}
//             >
//                 {value}
//             </div>
//         </div>
//     );
// }
//
// export default Domino;