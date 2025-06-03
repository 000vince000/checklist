import React, { useEffect, useState } from 'react';
import { commitHistoryHeatmapStyles } from '../styles/CommitHistoryHeatmapStyles';
import { Task } from '../types/Task';
import { useTaskContext } from '../context/TaskContext';
import styled from 'styled-components';

interface DayData {
  date: string;
  count: number;
}

interface MonthLabel {
  month: string;
  width: number;
  offset: number;
}

const DESKTOP_CELL_SIZE = 22;
const MOBILE_CELL_SIZE = Math.round(DESKTOP_CELL_SIZE * 0.65);
const DAYS_IN_WEEK = 7;

const MonthLabel = styled.div`
  // ... other existing styles ...
  width: 80%; /* Make month labels 20% narrower */
  // ... other existing styles ...
`;

const CommitHistoryHeatmap: React.FC = () => {
  const { tasks } = useTaskContext();
  const [heatmapData, setHeatmapData] = useState<DayData[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const generateHeatmapData = () => {
      console.log('[CommitHistoryHeatmap] Calculating activity data...');
      const data: { [key: string]: number } = {};
      const today = new Date();
      const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
      const startDate = sixMonthsAgo;

      for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
        data[d.toISOString().split('T')[0]] = 0;
      }

      tasks.forEach((task: Task) => {
        const completionDate = task.completedAt ? new Date(task.completedAt) : null;
        const updateDate = task.updatedAt ? new Date(task.updatedAt) : null;

        if (completionDate && completionDate >= startDate && completionDate <= today) {
          const dateKey = completionDate.toISOString().split('T')[0];
          data[dateKey] = (data[dateKey] || 0) + 1;
        }

        if (updateDate && updateDate >= startDate && updateDate <= today && (!completionDate || updateDate < completionDate)) {
          const dateKey = updateDate.toISOString().split('T')[0];
          data[dateKey] = (data[dateKey] || 0) + 1;
        }
      });

      return Object.entries(data).map(([date, count]) => ({ date, count }));
    };

    setHeatmapData(generateHeatmapData());
  }, [tasks]);

  const CELL_SIZE = isMobile ? MOBILE_CELL_SIZE : DESKTOP_CELL_SIZE;

  const getColor = (count: number) => {
    if (count === 0) return '#ebedf0';
    if (count < 5) return '#9be9a8';
    if (count < 10) return '#40c463';
    if (count < 15) return '#30a14e';
    return '#216e39';
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getMonthLabels = (): MonthLabel[] => {
    if (heatmapData.length === 0) return [];

    const today = new Date();
    const sixMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const labels: MonthLabel[] = [];
    let currentDate = new Date(sixMonthsAgo);
    let totalOffset = 15;

    while (currentDate <= today) {
      const month = currentDate.getMonth();
      const year = currentDate.getFullYear();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);
      
      const daysInMonth = lastDay.getDate();
      const weeksInMonth = Math.ceil((firstDay.getDay() + daysInMonth) / DAYS_IN_WEEK);

      const width = (weeksInMonth * CELL_SIZE) * 0.88; // 88% of the width is the magic number to align the heatmap with the month labels. DO NOT CHANGE THIS.

      if (currentDate.getTime() === sixMonthsAgo.getTime()) {
        totalOffset += -(firstDay.getDay() * CELL_SIZE) / DAYS_IN_WEEK;
      }

      labels.push({
        month: months[month],
        width,
        offset: totalOffset
      });

      totalOffset += width;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return labels;
  };

  const totalWeeks = Math.ceil(heatmapData.length / DAYS_IN_WEEK);

  return (
    <div style={commitHistoryHeatmapStyles.container}>
      <h3 style={commitHistoryHeatmapStyles.title}>Task Activity Heatmap (Last 6 Months)</h3>
      <div style={commitHistoryHeatmapStyles.heatmapWrapper}>
        <div style={commitHistoryHeatmapStyles.heatmapContent}>
          <div style={commitHistoryHeatmapStyles.monthLabels}>
            {getMonthLabels().map(({ month, width, offset }, index) => (
              <MonthLabel key={index} style={{
                ...commitHistoryHeatmapStyles.monthLabel,
                left: `${offset}px`,
                width: `${width}px`,
                fontSize: isMobile ? '10px' : '12px',
              }}>
                {month}
              </MonthLabel>
            ))}
          </div>
          <div style={{
            ...commitHistoryHeatmapStyles.heatmapGrid,
            gridTemplateColumns: `repeat(${totalWeeks}, ${CELL_SIZE}px)`,
            gap: isMobile ? '1px' : '2px',
          }}>
            {heatmapData.map((day, index) => (
              <div
                key={index}
                style={{
                  ...commitHistoryHeatmapStyles.heatmapCell,
                  width: `${CELL_SIZE - (isMobile ? 1 : 2)}px`,
                  height: `${CELL_SIZE - (isMobile ? 1 : 2)}px`,
                  backgroundColor: getColor(day.count),
                }}
                title={`${day.date}: ${day.count} activities`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommitHistoryHeatmap;
