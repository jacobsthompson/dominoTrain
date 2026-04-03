import {useCallback, useRef, useState, useEffect} from "react";

export default function Timer(){
    const elapsedTime = useRef(0);
    const startTimeRef = useRef(null);

    const lastTimestamp = useRef(null);
    const isRunning = useRef(false);
    const tickRef = useRef(null);

    const [,Updater] = useState(0);

    const setTime = useCallback((time) => {
        elapsedTime.current = time;
    }, []);

    const tick = useCallback((timestamp) => {
        if(lastTimestamp.current !== null){
            elapsedTime.current += timestamp - lastTimestamp.current;
        }

        lastTimestamp.current = timestamp;
        Updater(n => n + 1);
        tickRef.current = requestAnimationFrame(tick);
    }, []);

    const startTimer = useCallback(() => {
        lastTimestamp.current = null;
        isRunning.current = true;
        tickRef.current = requestAnimationFrame(tick);
    }, [tick]);

    const stopTimer = useCallback(() => {
        isRunning.current = false;
        cancelAnimationFrame(tickRef.current);
        tickRef.current = null;
        lastTimestamp.current = null;
    }, [])

    const pauseTimer = useCallback(() => {
        if (!isRunning.current) return;
        cancelAnimationFrame(tickRef.current);
        tickRef.current = null;
        lastTimestamp.current = null;
    }, []);


    const resumeTimer = useCallback(() => {
        if (!isRunning.current || tickRef.current) return;
        lastTimestamp.current = null;
        tickRef.current = requestAnimationFrame(tick);
    }, [tick]);

    const toggleMenuTimer = useCallback(() => {
        if (tickRef.current) {
            pauseTimer();
        } else {
            resumeTimer();
        }
    }, [pauseTimer, resumeTimer]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                pauseTimer();
            } else {
                resumeTimer();
            }
        };
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [pauseTimer, resumeTimer]);

    const resetTimer = useCallback(() => {
        elapsedTime.current = 0;
        lastTimestamp.current = null;
        Updater(0);
    }, []);

    const getTime = useCallback(() => {
        const seconds = Math.floor(elapsedTime.current/1000);
        const minutes = Math.floor((seconds % 3600)/60);
        const hours = Math.floor(minutes/60);
        const pad = (n) => String(n).padStart(2, '0');
        return hours > 0 ? `${pad(hours)}:${pad(minutes)}:${pad(seconds % 60)}` : `${pad(minutes)}:${pad(seconds % 60)}`
    }, []);

    const getRawTime = useCallback(() => {
        return elapsedTime.current;
    }, []);

    const bestTimeCompare = useCallback((time1, time2) => {
        if (!time1) return time2;
        if (!time2) return time1;

        const parse = (t) => {
            const parts = t.split(":").map(Number);
            if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
            return parts[0] * 60 + parts[1];
        };

        return parse(time1) <= parse(time2) ? time1 : time2;
    }, []);

    return { startTimer, stopTimer, resetTimer, getTime, bestTimeCompare, toggleMenuTimer, getRawTime, setTime}
}