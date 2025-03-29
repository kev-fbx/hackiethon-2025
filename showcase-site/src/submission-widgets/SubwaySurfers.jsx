import React, { useEffect, useState, useRef } from "react";

function SubwaySurfers() {
  /* Timer states */
  const [sec, setSec] = useState(0);
  const [min, setMin] = useState(0);
  const [hour, setHour] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  /* Game footage states */
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("home");
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const scoreTimerRef = useRef(null);
  const scoreRef = useRef(0);

  /* Updates high score */
  useEffect(() => {
    const savedHighScore = localStorage.getItem("highScore") || 0;
    setHighScore(Number(savedHighScore));
  }, []);

  /* Gets hour input from user */
  const changeHour = (e) => {
    const value = Math.max(0, Math.min(99, parseInt(e.target.value) || 0));
    setHour(value);
  };

  /* Gets minute input from user */
  const changeMin = (e) => {
    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
    setMin(value);
  };

  /* Gets second input from user */
  const changeSec = (e) => {
    const value = Math.max(0, Math.min(59, parseInt(e.target.value) || 0));
    setSec(value);
  };

  /* Timer countdown */
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isRunning) {
      endGame();
    }
  }, [isRunning, timeLeft]);

  /* Score system */
  useEffect(() => {
    if (isRunning) {
      scoreTimerRef.current = setInterval(() => {
        scoreRef.current += 1;
        setScore((prev) => prev + 1);
      }, 90);
    }
    return () => clearInterval(scoreTimerRef.current);
  }, [isRunning]);

  /* Changes videos */
  const checkVideo1End = () => {
    video2Ref.current.currentTime = 0;
    video2Ref.current.play().catch(console.error);
    setCurrentVideo("game-loop");
  };

  /* Initialise game */
  const startGame = async () => {
    const totalSeconds = hour * 3600 + min * 60 + sec;
    if (totalSeconds > 0) {
      setIsRunning(true);
      setTimeLeft(totalSeconds);
      setCurrentVideo("game-start");
      
      try {
        await video1Ref.current.play();
        video1Ref.current.addEventListener("ended", checkVideo1End);
      } catch (error) {
        console.error("Video playback error:", error);
      }
    }
  };

  /* Ends game */
  const endGame = () => {
    setIsRunning(false);
    setShowGameOver(true);
    video1Ref.current?.pause();
    video2Ref.current?.pause();
    
    if (score > highScore) {
      localStorage.setItem("highScore", score.toString());
      setHighScore(score);
    }
  };

  /* Returns to home page and resets */
  const returnHome = () => {
    setShowGameOver(false);
    setCurrentVideo("home");
    setScore(0);
    scoreRef.current = 0;
    video1Ref.current.currentTime = 0;
    video2Ref.current.currentTime = 0;
  };

  /* Time formatting */
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const formatScore = (score) => String(score).padStart(6, "0").slice(-6);

  return (
    <div className="relative h-[560px] w-[315px] bg-black overflow-hidden rounded-md" style={{ fontFamily: "Lilita One" }}>
      {/* HOME: looping background footage */}
      {currentVideo === "home" && (
        <video
          autoPlay
          loop
          muted
          className="absolute top-0 left-0 w-full h-full object-cover"
          src="homepage.mp4"
        />
      )}

      {/* GAME: game footage */}
      <video
        ref={video1Ref}
        muted
        playsInline
        className={`absolute top-0 left-0 w-full h-full object-cover ${currentVideo !== "game-start" ? "hidden" : ""
        }`}
      >
        <source src="/Start.mp4" type="video/mp4" />
      </video>

      <video
        ref={video2Ref}
        muted
        loop
        playsInline
        className={`absolute top-0 left-0 w-full h-full object-cover ${currentVideo !== "game-loop" ? "hidden" : ""
        }`}
      >
        <source src="/Loop.mp4" type="video/mp4" />
      </video>

      {/* GAME: HUD */}
      {isRunning && (
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
          <div className="bg-black/50 text-white px-2 py-1 rounded-md text-sm">
            {formatTime(timeLeft)}
          </div>
          <div className="bg-black/50 text-white px-2 py-1 rounded-md text-sm">
            SCORE: {formatScore(score)}
          </div>
        </div>
      )}

      {/* HOME: Timer input panel */}
      {!isRunning && !showGameOver && (
        <div >
          <p className="absolute bottom-40 text-white translate-x-4 flex animate-pulse -rotate-8">Input how long your task is!</p>
          <div className="absolute bottom-25 left-1/2 -translate-x-1/2 z-10 bg-gray-700 px-2 py-2 rounded-md grid grid-cols-3 gap-2" style={{ fontFamily: "Lilita One" }}>
            <input
              className="text-center bg-white rounded p-1"
              type="number"
              min="0"
              max="99"
              value={hour}
              onChange={changeHour}
              placeholder="hh"
            />
            <input
              className="text-center bg-white rounded p-1"
              type="number"
              min="0"
              max="59"
              value={min}
              onChange={changeMin}
              placeholder="mm"
            />
            <input
              className="text-center bg-white rounded p-1"
              type="number"
              min="0"
              max="59"
              value={sec}
              onChange={changeSec}
              placeholder="ss"
            />
          </div>
        </div>
      )}

      {/* HOME: Start button */}
      {!isRunning && !showGameOver && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10">
          <button
            onClick={startGame}
            disabled={isRunning}
            className="w-34 h-12 bg-[url('/Start-btn.png')] bg-cover bg-center hover:scale-105"
          />
        </div>
      )}

      {/* END: Game over screen */}
      {showGameOver && (
        <div
          className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center absolute inset-0 z-50"
          style={{backgroundImage: `url(/End_Screen.png)`, backgroundSize: "cover", backgroundPosition: "center"
          }}
        >
          <div className="mt-24 text-center">
          <p className="absolute top-14 right-13.5 text-xl font-bold " style={{ fontFamily: "Lilita One"}}>
              {formatScore(score)}
            </p>
          </div>
          <div className="absolute bottom-7 w-full flex justify-center gap-8">
            <img
              src="/Quit.png"
              alt="Home"
              className="cursor-pointer h-11 w-auto hover:scale-105 transition-transform"
              onClick={returnHome}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SubwaySurfers;