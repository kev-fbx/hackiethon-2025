import { useState, useEffect, useRef } from "react";

export default function VideoTimerWidget() {
  // Game state
  const [elapsedTime, setElapsedTime] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [timeReached, setTimeReached] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("video1");
  const Multiplier = 5; // Points multiplier for visual effect
  const duration = 30; // Total session duration in seconds

  // Video references and timers
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const timerRef = useRef(null);
  const scoreTimerRef = useRef(null);
  const scoreRef = useRef(0); // Mutable score reference for intervals

  // Load high score from browser storage on startup
  useEffect(() => {
    const savedHighScore = localStorage.getItem("videoHighScore") || 0;
    setHighScore(Number(savedHighScore));
  }, []);

  // video transitions
  const checkVideo1End = () => {
    // Switch to looping video after initial video finishes
    video2Ref.current.currentTime = 0;
    video2Ref.current.play().catch(console.error);
    setCurrentVideo("video2");
  };

  // Score increment system (Roughly 1 point every 90ms from game)
  useEffect(() => {
    scoreTimerRef.current = setInterval(() => {
      scoreRef.current += 1;
      setScore((prev) => prev + 1);
    }, 90);

    return () => clearInterval(scoreTimerRef.current);
  }, []);

  // Main game timer and video initialization
  useEffect(() => {
    // Set up 1-second interval timer
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    // Preload and prepare videos for smooth transitions
    const prepareVideos = async () => {
      try {
        // Warm up video buffers
        await video1Ref.current.play();
        video1Ref.current.pause();
        video1Ref.current.currentTime = 0;

        await video2Ref.current.play();
        video2Ref.current.pause();
        video2Ref.current.currentTime = 0;

        // Start first video
        video1Ref.current.play();
      } catch (error) {
        console.error("Video initialization failed:", error);
      }
    };

    prepareVideos();

    // Cleanup timers
    return () => {
      clearInterval(timerRef.current);
      clearInterval(scoreTimerRef.current);
    };
  }, []);

  // Game completion handler
  useEffect(() => {
    if (elapsedTime >= duration) {
      // Stop all timers
      clearInterval(timerRef.current);
      clearInterval(scoreTimerRef.current);
      
      // Update game state to true
      setTimeReached(true);
      
      // Pause videos
      video1Ref.current?.pause();
      video2Ref.current?.pause();

      // Update high score if current score is better
      if (score > highScore) {
        const newHighScore = score;
        setHighScore(newHighScore);
        localStorage.setItem("videoHighScore", newHighScore.toString());
      }
    }
  }, [elapsedTime]);

  // buffer videos early so the transitions are smooth
  useEffect(() => {
    const video2 = video2Ref.current;
    const checkBuffer = () => {
      if (video2.buffered.length > 0 && video2.buffered.end(0) > 5) {
        video1Ref.current.addEventListener("ended", checkVideo1End);
      } else {
        requestAnimationFrame(checkBuffer);
      }
    };

    video2.preload = "auto";
    checkBuffer();
  }, []);

  // Format time display as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Restart game functionality
  const startAgain = () => {
    // Reset values
    setElapsedTime(0);
    setScore(0);
    scoreRef.current = 0;
    setTimeReached(false);
    setCurrentVideo("video1");
    
    // Reset videos
    video1Ref.current.currentTime = 0;
    video1Ref.current.play();

    // Restart timers
    timerRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    scoreTimerRef.current = setInterval(() => {
      scoreRef.current += 1;
      setScore((prev) => prev + 1);
    }, 90);
  };

  // Format score with leading zeros (000000 format)
  const formatScore = (score) => {
    return String(score * Multiplier)
      .padStart(6, "0")
      .slice(-6);
  };

  return (
    <div className="relative bg-black overflow-hidden" style={{ width: 315, height: 560 }}>
      {/* Game HUD - Top Right */}
      <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
        <div className="bg-black/50 text-white px-2 py-1 rounded-md text-sm" style={{ fontFamily: "Lilita One" }}>
          {formatTime(elapsedTime)}
        </div>
        <div className="bg-black/50 text-white px-2 py-1 rounded-md text-sm" style={{ fontFamily: "Lilita One" }}>
          {formatScore(score)}
        </div>
        <div className="bg-black/50 text-white px-2 py-1 rounded-md text-sm" style={{ fontFamily: "Lilita One" }}>
          TOP RUN: {formatScore(highScore)} 
        </div>
      </div>

      {/* Video Players */}
      <video
        ref={video1Ref}
        muted
        playsInline
        className={`w-full h-full object-cover ${currentVideo !== "video1" ? "hidden" : ""}`}
      >
        <source src="/Start.mp4" type="video/mp4" />
      </video>

      <video
        ref={video2Ref}
        muted
        loop
        playsInline
        className={`w-full h-full object-cover ${currentVideo !== "video2" ? "hidden" : ""}`}
      >
        <source src="/Loop.mp4" type="video/mp4" />
      </video>

      {/* End Screen Overlay */}
      {timeReached && (
        <div
          className="w-full h-full flex flex-col items-center justify-center text-white p-4 text-center absolute inset-0 z-50"
          style={{
            backgroundImage: `url(/End_Screen.png)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Score Display */}
            <p className="absolute top-14 right-13.5 text-xl font-bold " style={{ fontFamily: "Lilita One"}}>
              {formatScore(score)}
            </p>

          {/* Action Buttons */}
          <div className="absolute bottom-7 w-full flex justify-center gap-8">
            <img
              src="/Start.png"
              alt="Restart"
              className="cursor-pointer h-11 w-auto hover:scale-105 transition-transform"
              onClick={startAgain}
            />
            <img
              src="/Quit.png"
              alt="Home"
              className="cursor-pointer h-11 w-auto hover:scale-105 transition-transform"
              //onClick not too sure what to do yet 
            />
          </div>
        </div>
      )}
    </div>
  );
}