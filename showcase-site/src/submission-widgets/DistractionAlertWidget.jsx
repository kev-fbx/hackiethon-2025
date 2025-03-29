import  { useState, useEffect } from 'react';
import { AlertCircle, Bell, Clock, Eye, EyeOff, XCircle, ChevronUp, ChevronDown } from 'lucide-react';

const DistractionAlertWidget = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [distractionCount, setDistractionCount] = useState(0);
  const [lastDistraction, setLastDistraction] = useState(null);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [distractionTime, setDistractionTime] = useState(0);
  const [totalDistractionTime, setTotalDistractionTime] = useState(0);
  const [isWidgetMinimized, setIsWidgetMinimized] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState(new Date());
  const [currentSessionTime, setCurrentSessionTime] = useState(0);

  useEffect(() => {
    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the page
        setIsVisible(false);
        setLastDistraction(new Date());
      } else {
        // User returned to the page
        setIsVisible(true);
        
        if (lastDistraction) {
          const timeAway = Math.round((new Date() - lastDistraction) / 1000);
          setDistractionTime(timeAway);
          setTotalDistractionTime(prev => prev + timeAway);
          setDistractionCount(prev => prev + 1);
          setShowWelcomeBack(true);
          

        //   const audio = new Audio();
        //   audio.src = './mixkit-software-interface-remove-2576.wav'; 

        //   audio.play().catch(e => console.log("Audio play failed:", e));
          
          // Hide the welcome back message after 5 seconds
          setTimeout(() => {
            setShowWelcomeBack(false);
          }, 5000);
        }
      }
    };

    // Session timer
    const sessionTimer = setInterval(() => {
      const elapsed = Math.round((new Date() - sessionStartTime) / 1000);
      setCurrentSessionTime(elapsed);
    }, 1000);

    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(sessionTimer);
    };
  }, [lastDistraction, sessionStartTime]);

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate focus percentage
  const calculateFocusPercentage = () => {
    if (currentSessionTime === 0) return 100;
    const focusedTime = currentSessionTime - totalDistractionTime;
    return Math.max(0, Math.min(100, Math.round((focusedTime / currentSessionTime) * 100)));
  };

  // Reset session
  const resetSession = () => {
    setSessionStartTime(new Date());
    setCurrentSessionTime(0);
    setDistractionCount(0);
    setTotalDistractionTime(0);
    setDistractionTime(0);
  };

  return (
    <div >
      {/* Welcome back notification */}
      {showWelcomeBack && (
        <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg mb-2 animate-bounce">
          <div className="flex items-center">
            <Bell className="mr-2" size={20} />
            <span className="font-semibold">Welcome back!</span>
          </div>
          <p className="text-sm mt-1">
            You were away for {formatTime(distractionTime)}. 
            Stay focused on your task!
          </p>
        </div>
      )}

      {/* Main widget */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 w-64">
        {/* Widget header */}
        <div className="bg-blue-600 text-white p-3 flex justify-between items-center">
          <div className="flex items-center">
            {isVisible ? 
              <Eye className="mr-2" size={18} /> : 
              <EyeOff className="mr-2" size={18} />
            }
            <h3 className="font-semibold text-sm">Focus Monitor</h3>
          </div>
          <div className="flex items-center">
            <button 
              onClick={() => setIsWidgetMinimized(!isWidgetMinimized)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              {isWidgetMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>
        </div>
        
        {/* Widget status indicator */}
        <div className="px-3 py-2 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isVisible ? 'bg-green-600' : 'bg-red-600'}`}></div>
            <span className="text-sm">{isVisible ? 'Focused' : 'Distracted'}</span>
          </div>
          <div className={`text-xs font-medium px-2 py-1 rounded-full ${
            isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {isVisible ? 'Active' : 'Away'}
          </div>
        </div>
        
        {/* Widget body - only shown when not minimized */}
        {!isWidgetMinimized && (
          <>
            {/* Focus metrics */}
            <div className="p-3 border-b border-gray-200">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Focus rate</span>
                <span className="text-xs font-semibold">{calculateFocusPercentage()}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${calculateFocusPercentage()}%` }}
                ></div>
              </div>
            </div>
          
            {/* Session stats */}
            <div className="p-3 grid grid-cols-2 gap-2 text-center">
              <div>
                <div className="text-xs text-gray-500">Session</div>
                <div className="flex justify-center items-center mt-1">
                  <Clock size={14} className="text-gray-400 mr-1" />
                  <span className="text-sm font-medium">{formatTime(currentSessionTime)}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Distractions</div>
                <div className="flex justify-center items-center mt-1">
                  <AlertCircle size={14} className="text-amber-500 mr-1" />
                  <span className="text-sm font-medium">{distractionCount}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Time away</div>
                <div className="text-sm font-medium">{formatTime(totalDistractionTime)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Last break</div>
                <div className="text-sm font-medium">{distractionTime ? formatTime(distractionTime) : "00:00"}</div>
              </div>
            </div>
          
            {/* Widget footer */}
            <div className="p-3 bg-gray-50 flex justify-center">
              <button 
                onClick={resetSession}
                className="flex items-center text-xs text-gray-600 hover:text-red-600 transition-colors"
              >
                <XCircle size={14} className="mr-1" />
                Reset Session
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DistractionAlertWidget;