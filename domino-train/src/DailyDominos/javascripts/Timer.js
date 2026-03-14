import {useCallback, useRef, useState} from "react";

export default function Timer(){
    const [elapsedTime, setElapsedTime] = useState(0);
    const startTimeRef = useRef(null);
    const tickRef = useRef(null);

    const tick = useCallback(() => {
        setElapsedTime(Date.now() - startTimeRef.current);
        tickRef.current = requestAnimationFrame(tick);
    }, []);

    const startTimer = useCallback(() => {
        startTimeRef.current = Date.now();
        tickRef.current = requestAnimationFrame(tick);
    }, [tick]);

    const stopTimer = useCallback(() => {
        cancelAnimationFrame(tickRef.current);
        tickRef.current = null;
    }, [])

    const resetTimer = () => {
        setElapsedTime(0);
    }

    const getTime = useCallback(() => {
        const seconds = Math.floor(elapsedTime/1000);
        const minutes = Math.floor((seconds % 3600)/60);
        const hours = Math.floor(minutes/60);
        const pad = (n) => String(n).padStart(2, '0');
        return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds % 60)}` : `${pad(minutes)}:${pad(seconds % 60)}`
    }, [elapsedTime])

    const bestTimeCompare = (time1, time2) => {
        if(!time1) return time2;
        if(!time2) return time1;

        const time1s = parseInt(time1.slice(-2,time1.length), 10);
        const time2s = parseInt(time2.slice(-2,time2.length), 10);
        const time1m = parseInt(time1.slice(-5,-3), 10);
        const time2m = parseInt(time2.slice(-5,-3), 10);
        let time1h = parseInt('00', 10);
        let time2h = parseInt('00', 10);
        if(time1.length > 5) { time1h = parseInt(time1.slice(0,2), 10); }
        if(time2.length > 5) { time2h = parseInt(time2.slice(0,2), 10); }

        if(time1h > time2h){
            // console.log("1", time1h, time2h, time1m, time2m, time1s, time2s);
            return time2;
        } else if(time1h < time2h){
            // console.log("2", time1h, time2h, time1m, time2m, time1s, time2s);
            return time1;
        } else if(time1m > time2m){
            // console.log("3", time1h, time2h, time1m, time2m, time1s, time2s);
            return time2;
        } else if(time1m < time2m){
            // console.log("4", time1h, time2h, time1m, time2m, time1s, time2s);
            return time1;
        } else if(time1s > time2s){
            // console.log("5", time1h, time2h, time1m, time2m, time1s, time2s);
            return time2;
        } else {
            // console.log("6", time1h, time2h, time1m, time2m, time1s, time2s);
            return time1;
        }
    }

    return { startTimer, stopTimer, resetTimer, getTime, bestTimeCompare}
}