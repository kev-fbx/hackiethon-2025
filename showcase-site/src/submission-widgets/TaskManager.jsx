import { useState,  } from "react";
import { Trash, CheckCircle, Maximize, X, Edit, PieChart } from "lucide-react";
import Confetti from "react-confetti";
import {  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,  } from "recharts";

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
    Homework: "#EC4899",
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
              <option value="Homework">📚 Assignment</option>
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

  return (
    isExpanded ? (
      <div className="p-5 bg-white shadow-2xl rounded-2xl border border-gray-300 w-[40vw]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Expanded View</h2>
          <X className="text-gray-500 cursor-pointer hover:text-gray-700" onClick={() => setIsExpanded(false)} />
        </div>
        <div className="flex justify-center space-x-4 mb-6 border-b pb-4">
          {["Tasks", "Statistics","Calendar", ].map(tab => (
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
           <div className="flex items-center justify-center h-full text-lg font-semibold text-gray-600">{activeTab}</div>}
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