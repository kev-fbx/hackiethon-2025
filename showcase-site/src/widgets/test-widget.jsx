import React, { useState } from 'react';
import { Plus, Minus, RotateCcw } from 'lucide-react';

const CounterWidget = () => {
  const [count, setCount] = useState(0);

  const increment = () => setCount(prev => prev + 1);
  const decrement = () => setCount(prev => prev - 1);
  const reset = () => setCount(0);

  return (
    <div className="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-lg">
      <div className="text-center space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Counter Widget</h2>
        
        <div className="text-4xl font-bold text-blue-600">
          {count}
        </div>
        
        <div className="flex justify-center space-x-4">
          <button
            onClick={decrement}
            className="p-2 bg-red-100 rounded-full hover:bg-red-200 transition-colors"
          >
            <Minus className="w-6 h-6 text-red-600" />
          </button>
          
          <button
            onClick={increment}
            className="p-2 bg-green-100 rounded-full hover:bg-green-200 transition-colors"
          >
            <Plus className="w-6 h-6 text-green-600" />
          </button>
        </div>
        
        <button
          onClick={reset}
          className="flex items-center justify-center space-x-2 px-4 py-2 w-full bg-blue-500 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
};

export default CounterWidget;