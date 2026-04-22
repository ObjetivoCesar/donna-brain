
import React, { useState, useEffect } from 'react';

interface DigitalClockProps {
  onTimeUpdate: (date: Date) => void;
}

const DigitalClock: React.FC<DigitalClockProps> = ({ onTimeUpdate }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => {
      const newTime = new Date();
      setTime(newTime);
      onTimeUpdate(newTime);
    }, 1000);
    return () => clearInterval(timerId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-center bg-black/20 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-white/10">
      <h2 className="text-5xl md:text-6xl font-bold text-white tracking-wider">
        {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}
      </h2>
    </div>
  );
};

export default DigitalClock;
