
import React from 'react';

interface ResultCardProps {
  growth: number | null;
}

const ResultCard: React.FC<ResultCardProps> = ({ growth }) => {
  const isCalculated = growth !== null && isFinite(growth);
  const displayValue = isCalculated ? growth.toFixed(2) : '--';
  
  let colorClass = 'text-gray-300';
  if (isCalculated) {
    if (growth > 15) colorClass = 'text-green-400';
    else if (growth > 5) colorClass = 'text-green-500';
    else if (growth > 0) colorClass = 'text-yellow-400';
    else colorClass = 'text-red-400';
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col items-center justify-center space-y-2 border border-gray-700">
      <h3 className="text-lg font-medium text-gray-400">Implicit Growth Rate (g)</h3>
      <p className={`text-5xl font-bold ${colorClass} transition-colors duration-300`}>
        {displayValue}%
      </p>
      <p className="text-xs text-gray-500">Based on your inputs</p>
    </div>
  );
};

export default ResultCard;
