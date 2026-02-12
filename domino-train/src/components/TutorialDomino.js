import {useEffect, useRef, useState} from "react";
import DominoPips from "./DominoPips";
import {HOLDER_SCALING} from "./Constants";
import {soundGenerator} from "./SoundEffects";
import './modal.css'
import './style.css'

function TutorialDomino({CELL_SIZE}){
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

            const {orientation, topvalue, botvalue} = getRotationValues(rotation);
            const isVertical = orientation === 'v';
            const width = isVertical ? CELL_SIZE : CELL_SIZE * 2;
            const height = isVertical ? CELL_SIZE*2 : CELL_SIZE;

            setPosition({x:0,y:0});

            if (dominoRef.current) {
                dominoRef.current.style.left = `0px`;
                dominoRef.current.style.top = `0px`;
            }
            soundGenerator.playPutDown();
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
    });

    const handleMouseDown = (e) => {
        if (e.button !== 0 && e.type === 'mousedown') return;

        if(e.type === 'touchstart'){
            e.preventDefault();
        }

        isDraggingRef.current = true;
        setIsDraggingVisual(true);

        const { shiftX, shiftY} = recenterPointer(e);

        const clientX = e.clientX || e.touches?.[0]?.clientX;
        const clientY = e.clientY || e.touches?.[0]?.clientY;

        dragOffsetRef.current = {
            x: clientX - shiftX,
            y: clientY - shiftY
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
        <div className="tutorial-domino-wrapper" ref={containerRef} >
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
                    x: isVertical ? width/2 : 0,
                    y: 0,
                    backgroundColor: '#f8f8ff',
                    cursor: 'grab',
                    zIndex: isDraggingVisual ? 1000 : 1,
                    flexDirection: isVertical ? 'column' : 'row',
                    boxShadow: isDraggingVisual ? '0 0.2rem 0.5rem rgba(255,255,200,0.5)' : 'none',
                    transform: isDraggingVisual ? 'scale(1.0)' : 'scale('+HOLDER_SCALING.toString()+')'
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
                    <DominoPips CELL_SIZE={CELL_SIZE} value={topvalue} color={'#191919'} inHolder={!isDraggingVisual}/>
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
                     <DominoPips CELL_SIZE={CELL_SIZE} value={botvalue} color={'#191919'} inHolder={!isDraggingVisual}/>
                </div>
            </div>
        </div>
    );
}

export default TutorialDomino;