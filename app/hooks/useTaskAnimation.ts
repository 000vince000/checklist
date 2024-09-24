import { useSpring } from 'react-spring';

export const useTaskAnimation = (animatingTaskId: number | null) => {
  const taskSpring = useSpring({
    opacity: animatingTaskId ? 0 : 1,
    transform: animatingTaskId ? 'scale(0.5) rotate(10deg)' : 'scale(1) rotate(0deg)',
    config: { tension: 300, friction: 10, duration: 1000 },
  });

  return taskSpring;
};