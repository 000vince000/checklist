import styled, { css } from 'styled-components';
import { animated } from 'react-spring';
import { Task } from '../types/Task';
import { getPriorityColor } from '../utils/taskUtils';
import { keyframes } from 'styled-components';

// New function to calculate grid dimensions
export const getGridDimensions = (effort: Task['effort'], priority: number) => {
  let runningDimension = 0;
  switch (effort) {
    case 'large':
      runningDimension = 2;
      break;
    case 'medium':
      runningDimension = 3;
      break;
    case 'small':
    default:
      runningDimension = 4;
  }
  if (priority <= 2.5) {
    runningDimension *= 0.3;
  } else if (priority <= 4) {
    runningDimension *= 0.6;
  } else if (priority <= 5) {
    runningDimension *= 0.8;
  } else {
    runningDimension *= 1;
  }
  return { columns: Math.round(runningDimension), rows: Math.round(runningDimension) };
};

export const HeatmapContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: #2c2c2c;
  padding: 0px;
  margin: -20px;
  border-radius: 8px;

  @media (min-width: 768px) {
    padding: 10px;
  }
`;

export const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
  grid-auto-rows: minmax(40px, auto);
  grid-auto-flow: dense;
  gap: 5px;
  padding: 0;
  margin: 0;
  justify-content: center;
  overflow: hidden;
  touch-action: pan-y;

  @media (min-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 10px;
    padding: 10px;
  }
`;

export const TaskBox = styled.div<{ priority: number; effort: Task['effort'] }>`
  border-radius: 4px;
  background-color: ${props => getPriorityColor(props.priority)};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: ${props => props.priority > 3.5 ? 'white' : 'black'};
  transition: transform 0.2s;
  padding: 2px;
  margin: 0;
  text-align: center;
  overflow: hidden;
  word-wrap: break-word;
  word-break: break-word;
  hyphens: auto;
  ${props => {
    const { columns, rows } = getGridDimensions(props.effort, props.priority);
    return `
      grid-column: span ${columns};
      grid-row: span ${rows};
    `;
  }}

  @media (min-width: 768px) {
    font-size: 12px;
    padding: 10px;
  }

  &:hover {
    transform: scale(1.05);
    z-index: 1;
  }
`;

export const Legend = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
  flex-wrap: wrap;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin: 5px;
`;

export const LegendColor = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  margin-right: 5px;
  background-color: ${props => props.color};
`;

export const LegendSize = styled.div<{ size: string }>`
  width: ${props => props.size};
  height: ${props => props.size};
  margin-right: 5px;
  border: 1px solid white;
`;

export const CompletedTasksSection = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #3c3c3c;
  border-radius: 8px;
`;

export const CompletedTaskItem = styled.div`
  padding: 5px;
  margin: 5px 0;
  background-color: #4a4a4a;
  border-radius: 4px;
`;

export const AnimatedTaskBox = animated(TaskBox);

// WIP Task components
export const WIPRowContainer = styled.div`
  display: flex;
  padding: 10px 0;
  margin-bottom: 10px;
  overflow-x: auto;
  background-color: #3c3c3c;
  border-radius: 8px;
`;

export const WIPHeader = styled.div`
  font-weight: bold;
  padding: 10px;
  display: flex;
  align-items: center;
`;

export const WIPTaskBox = styled(AnimatedTaskBox)`
  flex: 0 0 auto;
  margin: 0 10px;
  min-width: 150px;
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

export const Tooltip = styled.div`
  position: fixed;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  z-index: 9999;
  pointer-events: none;
  animation: ${fadeIn} 0.2s ease-in;
  max-width: 300px;
  word-wrap: break-word;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  white-space: normal;
`;
