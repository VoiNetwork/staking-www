import React, { useState, useEffect } from "react";
import { Box, Typography, LinearProgress } from "@mui/material";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface WeekDeadlineProps {
  week: number;
  deadline: Date;
}

const DeadlineCountdown: React.FC<WeekDeadlineProps> = ({ week, deadline }) => {
  const calculateTimeRemaining = (): TimeRemaining => {
    const now = new Date();
    const timeDifference = deadline.getTime() - now.getTime();

    if (timeDifference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((timeDifference / (1000 * 60)) % 60);
    const seconds = Math.floor((timeDifference / 1000) % 60);

    return { days, hours, minutes, seconds };
  };

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(
    calculateTimeRemaining()
  );
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const remainingTime = calculateTimeRemaining();
      setTimeRemaining(remainingTime);

      // Calculate the percentage of time passed (assuming the deadline is 7 days from the start).
      const totalWeekTime = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      const timePassed =
        totalWeekTime - (deadline.getTime() - new Date().getTime());
      const newProgress = Math.min((timePassed / totalWeekTime) * 100, 100);
      setProgress(newProgress);

      if (
        remainingTime.days === 0 &&
        remainingTime.hours === 0 &&
        remainingTime.minutes === 0 &&
        remainingTime.seconds === 0
      ) {
        clearInterval(interval); // Stop the interval when the deadline is reached
      }
    }, 1000);

    return () => clearInterval(interval); // Cleanup the interval on component unmount
  }, [deadline]);

  return (
    <Box textAlign="center">
      {timeRemaining.days +
        timeRemaining.hours +
        timeRemaining.minutes +
        timeRemaining.seconds ===
      0 ? (
        <Typography variant="h6" color="error">
          Week {week} deadline has passed.
        </Typography>
      ) : (
        <>
          <Typography variant="h6">
            Time Remaining until Week {week} Deadline:
          </Typography>
          <Typography variant="body1">
            {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}
            m {timeRemaining.seconds}s
          </Typography>
          <LinearProgress variant="determinate" value={progress} />
        </>
      )}
    </Box>
  );
};

export default DeadlineCountdown;
