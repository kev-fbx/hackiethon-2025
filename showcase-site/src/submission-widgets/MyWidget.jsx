import React, { useEffect, useState } from 'react';

/* Button component that can run a function and toggle
   Boolean `disabled` upon being clicked. Children is what is
   displayed as button
*/
function Button({ onClick, disabled, children, className }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  )
}

/* Primary function. Currently just tracks time
*/
const StudyTracker = () => {
  const [sec, setSec] = useState(0);
  const [min, setMin] = useState(0);
  const [hour, setHour] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

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
    const initHour = parseInt(hour) || 0;
    const initMin = parseInt(min) || 0;
    const initSec = parseInt(sec) || 0;
    if (initHour > 0 || initMin > 0 || initSec > 0) {
      setTimeLeft(initHour * 3600 + initMin * 60 + initSec);
      setIsRunning(true);
    }
  }

  /* Formats time in hh:mm:ss */
  const formatTime = (time) => {
    const hour = Math.floor(time / 3600);
    const min = Math.floor(time / 60);
    const sec = time % 60;
    return `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  return (
    <div className='h-[700px] w-[300px] bg-gray-200 p-5 text-center rounded-md'>
      <div className='text-center space-y-4'>
        <h2 className='text-xl font-bold text-gray-800'>Surfer</h2>
        <div className='timer-input'>
          <input
            type='number'
            min='0'
            value={hour}
            onChange={(e) => setHour(Number(e.target.value))}
            className='w-1/5 bg-blue-100 rounded-md p-1 text-center'
            disabled={isRunning}
          />
          <input
            type='number'
            min='0'
            value={min}
            onChange={(e) => setMin(Number(e.target.value))}
            className='w-1/5 bg-blue-100 rounded-md p-1 text-center'
            disabled={isRunning}
          />
          <input
            type='number'
            min='0'
            value={sec}
            onChange={(e) => setSec(Number(e.target.value))}
            className='w-1/5 bg-blue-100 rounded-md p-1 text-center'
            disabled={isRunning}
          />
        </div>
        <div>
          <Button
            onClick={startTimer}
            disabled={isRunning}
            children={"Start timer!"}
            className='bg-teal-600 text-black py-2 px-4 rounded-md hover:bg-teal-700 disabled:opacity-50'
          ></Button>
          <div className='countdown'>
            {isRunning && <div className='mt-5 text-2xl font-bold'>{formatTime(timeLeft)}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTracker;
