import { useState, useEffect, useRef } from "react";
import { Trash, CheckCircle, Maximize, X, Edit, PieChart } from "lucide-react";
import Confetti from "react-confetti";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { AlertCircle, Bell, Clock, Eye, EyeOff, XCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { motion } from "framer-motion";
import PropTypes from 'prop-types';

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [category, setCategory] = useState("Personal");
  const [isExpanded, setIsExpanded] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editedText, setEditedText] = useState("");
  const [activeTab, setActiveTab] = useState("Tasks");
  const [showConfetti, setShowConfetti] = useState(false);
  const [activityLog, setActivityLog] = useState([]);
  const [currentSessionTime, setCurrentSessionTime] = useState(0);
  const [distractionCount, setDistractionCount] = useState(0);
  const [lastDistraction, setLastDistraction] = useState(null);
  const [totalDistractionTime, setTotalDistractionTime] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(true);

  // Initialize the session timer when the component mounts
  useEffect(() => {
    // Handle visibility change (browser tab changes)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // User left the page/app
        setIsVisible(false);
        setLastDistraction(new Date());
      } else {
        // User returned to the page/app
        setIsVisible(true);
        
        if (lastDistraction) {
          const timeAway = Math.round((new Date() - lastDistraction) / 1000);
          setTotalDistractionTime(prev => prev + timeAway);
          setDistractionCount(prev => prev + 1);
        }
      }
    };

    // Session timer - runs regardless of which internal tab is active
    const sessionTimer = setInterval(() => {
      if (isVisible) { // Only increment time when tab is visible
        const elapsed = Math.round((new Date() - sessionStartTime) / 1000);
        setCurrentSessionTime(prev => elapsed);
      }
    }, 1000);

    // Add event listener for visibility change
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Clean up
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(sessionTimer);
    };
  }, [lastDistraction, sessionStartTime, isVisible]);

  const priorityColors = {
    High: "bg-red-200 border-red-500",
    Medium: "bg-yellow-200 border-yellow-500",
    Low: "bg-green-200 border-green-500",
  };

  const chartColors = {
    High: "#EF4444",
    Medium: "#F59E0B",
    Low: "#10B981",
    completed: "#3B82F6",
    added: "#6366F1",
    Personal: "#8B5CF6",
    Assignment: "#EC4899",
    Projects: "#F97316",
    Exams: "#0EA5E9",
  };

  // Log task activity
  const logActivity = (action, taskData) => {
    const timestamp = new Date();
    const formattedDate = timestamp.toLocaleDateString();
    
    setActivityLog(prevLog => [
      ...prevLog,
      {
        id: Date.now(),
        action,
        taskData,
        timestamp,
        formattedDate
      }
    ]);
  };

  const addTask = () => {
    if (newTask.trim() === "") return;
    
    const newTaskData = {
      id: Date.now(),
      text: newTask,
      completed: false,
      priority: isExpanded ? priority : "Medium",
      category: isExpanded ? category : "Personal",
      createdAt: new Date().toISOString()
    };
    
    setTasks([...tasks, newTaskData]);
    logActivity('added', newTaskData);
    
    setNewTask("");
    setPriority("Medium");
    setCategory("Personal");
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, completed: !task.completed };
        
        if (!task.completed) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
          logActivity('completed', updatedTask);
        } else {
          logActivity('uncompleted', updatedTask);
        }
        
        return updatedTask;
      }
      return task;
    }));
  };

  const deleteTask = (id) => {
    const taskToDelete = tasks.find(task => task.id === id);
    logActivity('deleted', taskToDelete);
    setTasks(tasks.filter(task => task.id !== id));
  };

  const startEditing = (task) => {
    setEditingTask(task.id);
    setEditedText(task.text);
  };

  const saveEdit = (id) => {
    setTasks(tasks.map(task => {
      if (task.id === id) {
        const updatedTask = { ...task, text: editedText };
        logActivity('edited', updatedTask);
        return updatedTask;
      }
      return task;
    }));
    setEditingTask(null);
  };
  
  // Get statistics data
  const getStatisticsData = () => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const incompleteTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    // Priority breakdown
    const priorityCounts = {
      High: tasks.filter(task => task.priority === "High").length,
      Medium: tasks.filter(task => task.priority === "Medium").length,
      Low: tasks.filter(task => task.priority === "Low").length,
    };
    
    // Category breakdown
    const categoryCounts = {};
    tasks.forEach(task => {
      if (!categoryCounts[task.category]) {
        categoryCounts[task.category] = 0;
      }
      categoryCounts[task.category]++;
    });
    
    // Activity by date
    const activityByDate = {};
    
    // Initialize with the last 7 days
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const formattedDate = date.toLocaleDateString();
      last7Days.push(formattedDate);
      activityByDate[formattedDate] = { date: formattedDate, completed: 0, added: 0 };
    }
    
    // Populate with actual data
    activityLog.forEach(log => {
      if (!activityByDate[log.formattedDate]) {
        activityByDate[log.formattedDate] = { date: log.formattedDate, completed: 0, added: 0 };
      }
      
      if (log.action === 'added') {
        activityByDate[log.formattedDate].added++;
      } else if (log.action === 'completed') {
        activityByDate[log.formattedDate].completed++;
      }
    });
    
    // Convert to array for charts, include only the last 7 days
    const activityData = last7Days.map(date => activityByDate[date] || { date, completed: 0, added: 0 });
    
    return {
      totalTasks,
      completedTasks,
      incompleteTasks,
      completionRate,
      priorityCounts,
      categoryCounts,
      activityData
    };
  };

  const renderTaskList = () => (
    <div className="h-64 overflow-y-auto p-2 border rounded-lg bg-gray-50">
      {showConfetti && <Confetti numberOfPieces={1000} recycle={false} />} 
      <div className="flex gap-3 mb-4">
        <input 
          value={newTask} 
          onChange={(e) => setNewTask(e.target.value)} 
          placeholder="Add a new task..." 
          className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
        />
        {isExpanded && (
          <>
            <select 
              value={priority} 
              onChange={(e) => setPriority(e.target.value)} 
              className="p-3 border border-gray-300 rounded-lg">
              <option value="High">🔥 High</option>
              <option value="Medium">⚡ Medium</option>
              <option value="Low">✅ Low</option>
            </select>
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="p-3 border border-gray-300 rounded-lg">
              <option value="Assignment">📚 Assignment</option>
              <option value="Projects">🚀 Projects</option>
              <option value="Exams">📝 Exams</option>
              <option value="Personal">🏠 Personal</option>
            </select>
          </>
        )}
        <button className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition" onClick={addTask}>
          Add
        </button>
      </div>
      <ul className="space-y-3">
        {tasks.map(task => (
          <li key={task.id} className={`flex items-center justify-between p-3 border-l-4 rounded-lg shadow-md hover:bg-gray-100 transition ${priorityColors[task.priority]}`}>
            <div>
              {editingTask === task.id ? (
                <input 
                  value={editedText} 
                  onChange={(e) => setEditedText(e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-lg"
                />
              ) : (
                <div>
                  <span className={task.completed ? "line-through text-gray-500" : "text-gray-800 font-medium"}>{task.text}</span>
                  <p className="text-sm text-gray-600">{task.category}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              {editingTask === task.id ? (
                <button  
                  disabled={editedText.trim() === ''}
                  onClick={() => saveEdit(task.id)}
                  className={`font-semibold transition ${
                    editedText.trim() === '' ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-700'
                  }`}
                >
                  Save
                </button>
              ) : (
                <Edit className="text-gray-500 cursor-pointer hover:text-blue-600 transition" onClick={() => startEditing(task)} />
              )}
              <CheckCircle 
                className={`cursor-pointer ${task.completed ? "text-green-500" : "text-gray-500 hover:text-green-500 transition"}`} 
                onClick={() => toggleTask(task.id)} 
              />
              <Trash className="text-red-500 cursor-pointer hover:text-red-600 transition" onClick={() => deleteTask(task.id)} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );

  const renderStatistics = () => {
    const stats = getStatisticsData();
    const noDataMessage = (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <PieChart size={40} className="mb-3 opacity-50" />       
        <p className="text-sm mt-1">Add some tasks to see statistics</p>
      </div>
    );

    return (
      <div className="h-64 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {/* Summary Cards */}
          <div className="col-span-2 grid grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-medium text-gray-700">Total Tasks</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalTasks}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-medium text-gray-700">Completed</h3>
              <p className="text-3xl font-bold text-green-600">{stats.completedTasks}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
              <h3 className="text-lg font-medium text-gray-700">Completion Rate</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.completionRate}%</p>
            </div>
          </div>

          {/* Task Completion Trend */}
          <div className="col-span-2 bg-white p-4 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Weekly Task Activity</h3>
            <div className="h-64">
              {stats.activityData.some(day => day.added > 0 || day.completed > 0) ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.activityData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completed" name="Completed Tasks" fill={chartColors.completed} />
                    <Bar dataKey="added" name="Added Tasks" fill={chartColors.added} />
                  </BarChart>
                </ResponsiveContainer>
              ) : noDataMessage}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Reset session function that doesn't get triggered by tab changes
  const resetSession = () => {
    setSessionStartTime(new Date());
    setCurrentSessionTime(0);
    setDistractionCount(0);
    setTotalDistractionTime(0);
  };

  return (
    isExpanded ? (
      <div className="p-5 bg-white shadow-2xl rounded-2xl border border-gray-300 w-[40vw]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Expanded View</h2>
          <X className="text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => setIsExpanded(false)} />
        </div>
        <div className="flex justify-center space-x-4 mb-6 border-b pb-4">
          {["Tasks", "Statistics", "Focus Mode", "Game analytics"].map(tab => (
            <button 
              key={tab} 
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${activeTab === tab ? "bg-blue-600 text-white shadow-md" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`} 
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="h-80 overflow-y-auto p-4 bg-gray-100 rounded-lg shadow-inner">
          {activeTab === "Tasks" ? renderTaskList() : 
           activeTab === "Statistics" ? renderStatistics() :
           activeTab === "Focus Mode" ? 
           <DistractionAlertWidget 
             currentSessionTime={currentSessionTime} 
             isVisible={isVisible}
             distractionCount={distractionCount}
             totalDistractionTime={totalDistractionTime}
             resetSession={resetSession}
           />: 
           activeTab === "Game analytics" ?
           <div>
            <SubwaySurfers/>
          </div>:<div></div>
          }
        </div>
      </div>
    ) : (
      <div className="relative p-5 bg-white shadow-2xl rounded-2xl border border-gray-300 w-110">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Task Manager</h2>
        {renderTaskList()}
        <div className="mt-4 flex justify-end">
          <Maximize 

            className="text-gray-500 cursor-pointer hover:text-gray-700 transition" 
            onClick={() => setIsExpanded(true)} 
          />
        </div>
      </div>
    )
  );
}

const DistractionAlertWidget = ({ currentSessionTime, isVisible, distractionCount, totalDistractionTime, resetSession }) => {
  DistractionAlertWidget.propTypes = {
    currentSessionTime: PropTypes.number.isRequired,
    isVisible: PropTypes.bool.isRequired,
    distractionCount: PropTypes.number.isRequired,
    totalDistractionTime: PropTypes.number.isRequired,
    resetSession: PropTypes.func.isRequired,
  };

  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [isWidgetMinimized, setIsWidgetMinimized] = useState(false);
  const [distractionTime, setDistractionTime] = useState(0);
  
  // When isVisible changes from false to true, show welcome back message
  useEffect(() => {
    // Only show welcome back message when returning from being away
    if (isVisible && distractionCount > 0) {
      // Calculate time of last distraction
      if (totalDistractionTime > 0 && distractionCount > 0) {
        // Estimate the last distraction time (simplified)
        const estimatedLastDistractionTime = Math.round(totalDistractionTime / distractionCount);
        setDistractionTime(estimatedLastDistractionTime);
      }
      
      setShowWelcomeBack(true);
      
      // Hide the welcome back message after 5 seconds
      const timer = setTimeout(() => {
        setShowWelcomeBack(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, distractionCount, totalDistractionTime]);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center w-full max-w-md mx-auto"
    >
      {/* Welcome back notification */}
      {showWelcomeBack && (
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className="bg-blue-600 text-white p-4 rounded-xl shadow-lg mb-3 flex items-center gap-2"
        >
          <Bell className="text-white" size={20} />
          <div>
            <p className="font-semibold">Welcome back!</p>
            <p className="text-sm opacity-80">You were away for {formatTime(distractionTime)}. Stay focused!</p>
          </div>
        </motion.div>
      )}

      {/* Focus Monitor Widget */}
      <div className="bg-white/70 backdrop-blur-lg shadow-md rounded-xl overflow-hidden border border-gray-200 w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-3 flex justify-between items-center">
          <div className="flex items-center">
            {isVisible ? <Eye className="mr-2" size={18} /> : <EyeOff className="mr-2" size={18} />}
            <h3 className="font-semibold text-sm">Focus Monitor</h3>
          </div>
          <button onClick={() => setIsWidgetMinimized(!isWidgetMinimized)} className="text-white hover:text-gray-300">
            {isWidgetMinimized ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {/* Status */}
        <div className="px-4 py-2 flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${isVisible ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-sm">{isVisible ? "Focused" : "Distracted"}</span>
          </div>
          <div className={`text-xs font-medium px-3 py-1 rounded-full ${isVisible ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {isVisible ? "Active" : "Away"}
          </div>
        </div>

        {/* Metrics */}
        {!isWidgetMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4"
          >
            <div className="mb-3">
              <p className="text-xs text-gray-600">Focus rate</p>
              <div className="relative w-full bg-gray-200 rounded-full h-2 mt-1">
                <motion.div
                  className="absolute top-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: `${calculateFocusPercentage()}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-right text-xs font-semibold mt-1">{calculateFocusPercentage()}%</p>
            </div>

            {/* Session Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              {[
                { label: "Session", icon: <Clock size={14} className="text-gray-500" />, value: formatTime(currentSessionTime) },
                { label: "Distractions", icon: <AlertCircle size={14} className="text-yellow-500" />, value: distractionCount },
                { label: "Time away", value: formatTime(totalDistractionTime) },
                { label: "Last break", value: distractionTime ? formatTime(distractionTime) : "00:00" }
              ].map(({ label, icon, value }, index) => (
                <div key={index}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <div className="flex justify-center items-center mt-1 gap-1">
                    {icon}
                    <span className="text-sm font-medium">{value}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex justify-center mt-4">
              <button onClick={resetSession} className="flex items-center text-xs text-gray-600 hover:text-red-600 transition">
                <XCircle size={14} className="mr-1" />
                Reset Session
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

function SubwaySurfers() {
  
  /* Timer states */
  const [sec, setSec] = useState(0);
  const [min, setMin] = useState(0);
  const [hour, setHour] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  /* Game footage states */
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [highScore, setHighScore] = useState(0);
  const [showGameOver, setShowGameOver] = useState(false);
  const [currentVideo, setCurrentVideo] = useState("home");
  const [timeReached, setTimeReached] = useState(false);
  const video1Ref = useRef(null);
  const video2Ref = useRef(null);
  const scoreTimerRef = useRef(null);
  const scoreRef = useRef(0);

  /* Updates high score */
  useEffect(() => {
    const savedHighScore = localStorage.getItem("highScore") || 0;
    setHighScore(Number(savedHighScore));
  }, []);

  /* Timer countdown */
  useEffect(() => {
    if (isRunning && timeLeft > 0 && !isPaused) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && isRunning) {
      endGame();
    }
  }, [isRunning, timeLeft, isPaused]);

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

  /* Buffer videos early so the transitions are smooth */
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

  /* Pauses game */
  const togglePause = () => {
    if (!timeReached) {
      const currPauseState = !isPaused;
      setIsPaused(currPauseState);

      if (currPauseState) {
        clearInterval(scoreTimerRef.current);
        video1Ref.current.pause();
        video2Ref.current.pause();
      } else {
        scoreTimerRef.current = setInterval(() => {
          scoreRef.current += 1;
          setScore((prev) => prev + 1);
        }, 90);

        currentVideo === "game-start"
          ? video1Ref.current.play()
          : video2Ref.current.play();
      }
    }
  };

  /* Ends game */
  const endGame = () => {
    setIsRunning(false);
    setShowGameOver(true);
    video1Ref.current.pause();
    video2Ref.current.pause();

    if (score > highScore) {
      localStorage.setItem("highScore", score.toString());
      setHighScore(score);
    }
  };

  /* Returns to home page and resets */
  const returnHome = () => {
    setScore(0);
    setShowGameOver(false);
    setCurrentVideo("home");
    setIsRunning(false);
    setTimeReached(false);
    setIsPaused(false);
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

      {/* Pause Button */}
      {isRunning && !isPaused && (
        <img
          src="/Pause.png"
          alt="Pause"
          className="absolute top-3 left-3 z-10 cursor-pointer h-8 w-auto hover:scale-110 transition-transform"
          onClick={togglePause}
        />
      )}

      {/* Pause Overlay */}
      {isPaused && (
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
          style={{
            width: "240px",
            height: "171.6px",
            backgroundImage: `url(/PauseMenu.png)`,
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 px-4">
            <img
              src="/Yes.png"
              alt="Resume"
              className="cursor-pointer h-12 w-auto max-w-[80px] hover:scale-105 transition-transform object-contain"
              onClick={togglePause}
            />
            <img
              src="/No.png"
              alt="Quit"
              className="cursor-pointer h-12 w-auto max-w-[80px] hover:scale-105 transition-transform object-contain"
              onClick={() => {
                setIsPaused(false);
                endGame();
              }}
            />
          </div>
        </div>
      )}

      {/* GAME: HUD */}
      {isRunning && (
        <div className="absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
          <div className="bg-black/50 text-white px-2 py-1 rounded-md text-sm">
            {formatTime(timeLeft)}
          </div>
          <div className="bg-black/50 text-white px-2 py-1 rounded-md text-sm">
            SCORE: {formatScore(score)}
          </div>
          <div
            className="bg-black/50 text-white px-2 py-1 rounded-md text-sm"
            style={{ fontFamily: "Lilita One" }}
          >
            TOP RUN: {formatScore(highScore)}
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
          style={{
            backgroundImage: `url(/End_Screen.png)`, backgroundSize: "cover", backgroundPosition: "center"
          }}
        >
          <div className="mt-24 text-center">
            <p className="absolute top-14 right-13.5 text-xl font-bold " style={{ fontFamily: "Lilita One" }}>
              {formatScore(score)}
            </p>
          </div>
          <div className="absolute bottom-7 w-full flex justify-center gap-8">
            <img
              src="/Home.png"
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
