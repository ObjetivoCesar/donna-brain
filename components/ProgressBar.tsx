import React, { useState, useEffect } from 'react';

const ProgressBar: React.FC = () => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const calculateProgress = () => {
            const now = new Date();
            const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 4, 30, 0); // 4:30 AM
            const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 0, 0); // 11:00 PM
            const totalMilliseconds = endOfDay.getTime() - startOfDay.getTime();
            const elapsedMilliseconds = now.getTime() - startOfDay.getTime();
            
            if (now < startOfDay) return 0;
            if (now > endOfDay) return 100;

            const calculatedProgress = Math.floor((elapsedMilliseconds / totalMilliseconds) * 100);
            setProgress(calculatedProgress);
        };
        
        calculateProgress();
        const interval = setInterval(calculateProgress, 60000); // Update every minute
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-1">
                <p className="text-sm text-gray-300">Progreso del día</p>
                <span className="text-sm font-semibold text-green-400">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200/20 rounded-full h-2.5">
                <div 
                    className="bg-green-400 h-2.5 rounded-full transition-all duration-500 ease-out" 
                    style={{ width: `${progress}%` }}
                ></div>
            </div>
        </div>
    );
};

export default ProgressBar;