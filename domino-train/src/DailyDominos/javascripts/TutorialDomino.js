import {useEffect, useRef, useState} from "react";
import {soundGenerator} from "./SoundEffects";
import DominoPips from "./DominoPips";
import  '../stylesheets/domino.css';

function TutorialDomino({CELL_SIZE, onRotation, onFirstDown, onFirstUp, onFirstMove, onFirstRotate, validPlace}){
    const value1 = 1;
    const value2 = 2;

    const [position, setPosition] = useState({x:0,y:0});
    const [rotation, setRotation]= useState(270);
    const [isDraggingVisual, setIsDraggingVisual] = useState(false);

    const containerRef = useRef(null);
    const dominoRef = useRef(null);
    const rotationRef = useRef(0);
    const isDraggingRef = useRef(false);
    const dragOffsetRef = useRef({x:0,y:0})

    const currentMousePos = useRef({x: 0, y: 0});
    const lastRotationAngle = useRef(0);
    const isRotatingRef = useRef(false);
    const neededRotationAngle = 10;

    useEffect(() => {
        rotationRef.current = rotation;
        onRotation(getRotationValues(rotation).orientation);
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
                    orientation: 'h',
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

        const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.startsWith('touch') ? e.touches[0].clientY : e.clientY;

        const dominoRect = dominoRef.current.getBoundingClientRect();
        const clickOffsetX = clientX - dominoRect.left;
        const clickOffsetY = clientY - dominoRect.top;

        const centerOffsetX = dominoWidth / 2;
        const centerOffsetY = dominoHeight / 2;

        const shiftX = clickOffsetX - centerOffsetX;
        const shiftY = clickOffsetY - centerOffsetY;

        return {shiftX, shiftY}
    }

    const getTouchAngle = (touch1, touch2) => {
        const dx = touch2.clientX - touch1.clientX;
        const dy = touch2.clientY - touch1.clientY;
        return Math.atan2(dy, dx) * (180 / Math.PI);
    }

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (isDraggingRef.current && dominoRef.current){
                if(e.type === 'touchmove'){
                    e.preventDefault()
                }

                onFirstMove(e);

                //TOUCH ROTATION

                if(e.type === 'touchmove' && e.touches.length === 2){
                    isRotatingRef.current = true;

                    const currentAngle = getTouchAngle(e.touches[0], e.touches[1]);

                    if(lastRotationAngle.current !== null){
                        const angleDiff = currentAngle - lastRotationAngle.current;

                        if(Math.abs(angleDiff) > neededRotationAngle){
                            handleRotation(e, (angleDiff/Math.abs(angleDiff) * 90));
                            lastRotationAngle.current = currentAngle;
                        }
                    } else {
                        lastRotationAngle.current = currentAngle;
                    }
                }

                if(e.type === 'touchmove' && e.touches.length === 1){
                    if (isRotatingRef.current){
                        lastRotationAngle.current = null;
                        isRotatingRef.current = false;
                        return;
                    }
                }

                //DRAGGING

                if(e.type === 'mousemove' || e.touches.length === 1) {
                    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
                    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;

                    currentMousePos.current = {x: clientX, y: clientY}
                    const dragOffset = dragOffsetRef.current;

                    const newX = clientX - dragOffset.x;
                    const newY = clientY - dragOffset.y;

                    dominoRef.current.style.left = `${newX}px`;
                    dominoRef.current.style.top = `${newY}px`;
                } else if(e.type === 'touchmove' && e.touches.length === 2){
                    const mainX = e.touches[0].clientX;
                    const mainY = e.touches[0].clientY;

                    const secondX = e.touches[1].clientX;
                    const secondY = e.touches[1].clientY;

                    const midX = (mainX + secondX) / 2;
                    const midY = (mainY + secondY) / 2;

                    currentMousePos.current = {x: midX, y: midY}
                    const dragOffset = dragOffsetRef.current;

                    const newX = midX - dragOffset.x;
                    const newY = midY - dragOffset.y;

                    dominoRef.current.style.left = `${newX}px`;
                    dominoRef.current.style.top = `${newY}px`;
                }
            }
        };

        const handleMouseUp = (e) => {
            if (e.button !== 0 && e.type === 'mouseup') return;
            if (!isDraggingRef.current) return;
            if(e.type === 'touchend' && e.touches.length > 0) return;

            onFirstUp(e);

            lastRotationAngle.current = null;
            isRotatingRef.current = false;

            isDraggingRef.current = false;
            setIsDraggingVisual(false);
            if(dominoRef.current) {
                dominoRef.current.style.cursor = 'grab';
            }

            setPosition({x:0,y:0});
            if (dominoRef.current) {
              dominoRef.current.style.left = '0px';
              dominoRef.current.style.top = '0px';
            }
            soundGenerator.playPutDown();
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('touchmove', handleMouseMove, {passive: false});
        document.addEventListener('touchend', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('touchmove', handleMouseMove, {passive: false});
            document.removeEventListener('touchend', handleMouseUp);
        };
    }, [value1,value2]);

    const handleMouseDown = (e) => {
        if (e.button !== 0 && e.type === 'mousedown') return;

        onFirstDown(e);

        if(e.type === 'touchstart'){
            e.preventDefault();
        }

        isDraggingRef.current = true;
        setIsDraggingVisual(true);

        let { shiftX, shiftY} = recenterPointer(e);
        if(e.type === 'touchstart'){
            shiftX = 0;
            shiftY = 0;
        }

        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;

        currentMousePos.current.x = clientX;
        currentMousePos.current.y = clientY;

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

        soundGenerator.playPickup();
    };

    const handleRotation = () => {
        if(isDraggingRef.current){

            onFirstRotate();

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
            soundGenerator.playRotate();
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'r') {
            handleRotation(e);
        }
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        handleRotation(e);
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
                onTouchStart={handleMouseDown}
                onContextMenu={handleContextMenu}
                onKeyDown={handleKeyDown}
                style={{
                    width: width,
                    height: height,
                    left: 0,
                    top: 0,
                    backgroundColor: '#f8f8ff',
                    cursor: 'grab',
                    zIndex: isDraggingVisual ? 1000 : 1,
                    flexDirection: isVertical ? 'column' : 'row',
                    boxShadow: isDraggingVisual ? '0 0.2rem 0.5rem rgba(255,255,200,0.5)' : 'none',
                    touchAction: 'none'
                }}
            >
                <div
                    className="domino-half top-half-domino"
                    style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: isVertical ? '0.5rem 0.5rem 0 0': '0.5rem 0 0 0.5rem',
                        borderStyle: isVertical ? "none" : "none none solid none",
                        borderColor: "#ccc"
                    }}
                >
                    <DominoPips CELL_SIZE={CELL_SIZE} value={topvalue} color={(validPlace && !isDraggingVisual) ? '#4CAF50' : '#191919'} inHolder={false}/>
                </div>
                <div className="domino-divider" style={{width: isVertical ?  '100%' : '0.15rem', height: isVertical ? '0.15rem' : '100%'}}/>
                <div
                    className="domino-half bot-half-domino"
                    style={{
                        width: CELL_SIZE,
                        height: CELL_SIZE,
                        borderRadius: isVertical ? ' 0 0 0.5rem 0.5rem': '0 0.5rem 0.5rem 0',
                        borderColor: "#ccc"
                    }}>
                     <DominoPips CELL_SIZE={CELL_SIZE} value={botvalue} color={(validPlace && !isDraggingVisual) ? '#4CAF50' : '#191919'} inHolder={false}/>
                </div>
            </div>
        </div>
    );
}

export default TutorialDomino;