import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useModalContext } from '../context/ModalContext';
import TaskModal from './TaskModal';

const SharedTaskModal: React.FC = () => {
  const { 
    tasks, 
    updateTask, 
    completeTask, 
    deleteTask,
    updateTaskTimer 
  } = useTaskContext();
  
  const {
    selectedTask,
    timer,
    closeModal,
    handleAccept,
    handleReject,
    handleDone,
    handleAbandon,
    handleDelete,
    handleUpdateTask,
    updateSelectedTask,
    openModal
  } = useModalContext();

  if (!selectedTask) {
    return null;
  }

  return (
    <TaskModal
      selectedTask={selectedTask}
      isOpen={selectedTask !== null}
      closeModal={closeModal}
      handleAccept={() => handleAccept(selectedTask.id, updateTaskTimer)}
      handleReject={() => handleReject(selectedTask, updateTask)}
      handleDone={() => handleDone(selectedTask.id, timer, completeTask)}
      handleAbandon={() => handleAbandon(selectedTask, updateTask)}
      handleDelete={() => handleDelete(selectedTask.id, deleteTask)}
      handleUpdateTask={(task) => handleUpdateTask(task, updateTask)}
      timer={timer}
      tasks={tasks}
      openTaskModal={(taskId) => openModal(taskId, tasks, [])}
      updateSelectedTask={updateSelectedTask}
    />
  );
};

export default SharedTaskModal; 