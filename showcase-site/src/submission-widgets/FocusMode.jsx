import React, { useEffect, useState } from "react";

/* Button component that can run a function and toggle
   Boolean `disabled` upon being clicked. Children is what is
   displayed as button
*/
function Button({ onClick, disabled, children, className }) {
  return (
    <button onClick={onClick} disabled={disabled} className={className}>
      {children}
    </button>
  );
}

/* Primary function. Currently just tracks time
 */
const FocusMode = () => {
  const [sec, setSec] = useState(0);
  const [min, setMin] = useState(0);
  const [hour, setHour] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const changeHour = (e) => {
    const value = Math.max(0, Math.min(99, parseInt(e.target.value) || 0));
    setHour(value);
  };

  const changeMin = (e) => {
    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
    setMin(value);
  };

  const changeSec = (e) => {
    const value = Math.max(0, Math.min(99, parseInt(e.target.value) || 0));
    setSec(value);
  };

  /* Decrements time */
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
  }, [isRunning, timeLeft]);

  /* Initialises timer */
  const startTimer = () => {
    setIsRunning(true);
    const totSeconds = hour * 3600 + min * 60 + sec;
    if (totSeconds > 0) {
      setTimeLeft(totSeconds);
    } else {
      setIsRunning(false);
    }
  };

  /* Formats time in hh:mm:ss */
  const formatTime = (time) => {
    const hour = Math.floor(time / 3600);
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="h-[560px] w-[315px] bg-gray-200 p-5 text-center rounded-md">
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover rounded-md z-0"
        src="homepage.mp4"
        type="video/mp4"
      ></video>
      {/* New Start Button at the top */}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-10">
        <button
          onClick={startTimer}
          disabled={isRunning}
          className="w-34 h-12 bg-[url('/Start-btn.png')] bg-cover bg-center bg-no-repeat transition duration 200 active:brightness-50 disabled:opacity-0"
        />
      </div>
      {!isRunning && (<div className="absolute h-[50px] bottom-22 left-1/2 -translate-x-1/2 z-10 bg-gray-700 px-1 py-1 rounded-md grid grid-cols-3 gap-1">
        <input
          className="bg-white text-center rounded-xs px-1.5"
          style={{ fontFamily: "Lilita One" }}
          type="number"
          min="0"
          max="99"
          value={hour}
          onChange={changeHour}
          disabled={isRunning}
          placeholder="hh"
        />
        <input
          className="bg-white text-center rounded-xs px-1.5"
          style={{ fontFamily: "Lilita One" }}
          type="number"
          min="0"
          max="59"
          value={min}
          onChange={changeMin}
          disabled={isRunning}
          placeholder="mm"
        />
        <input
          className="bg-white text-center rounded-xs px-1.5"
          style={{ fontFamily: "Lilita One" }}
          type="number"
          min="0"
          max="59"
          value={sec}
          onChange={changeSec}
          disabled={isRunning}
          placeholder="ss"
        />
      </div>)}
    </div>
  );
};

export default FocusMode;
