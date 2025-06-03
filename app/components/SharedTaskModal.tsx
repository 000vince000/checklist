import React from 'react';
import { useTaskContext } from '../context/TaskContext';
import { useModalContext } from '../context/ModalContext';
import TaskModal from './TaskModal';

const SharedTaskModal: React.FC = () => {
  const { 
    tasks, 
    updateTask, 
    completeTask, 
    deleteTask
  } = useTaskContext();
  
  const {
    selectedTask,
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
      handleAccept={() => handleAccept(selectedTask.id)}
      handleReject={() => handleReject(selectedTask, updateTask)}
      handleDone={() => handleDone(selectedTask.id, completeTask)}
      handleAbandon={() => handleAbandon(selectedTask, updateTask)}
      handleDelete={() => handleDelete(selectedTask.id, deleteTask)}
      handleUpdateTask={(task) => handleUpdateTask(task, updateTask)}
      tasks={tasks}
      openTaskModal={(taskId) => openModal(taskId, tasks, [])}
      updateSelectedTask={updateSelectedTask}
    />
  );
};

export default SharedTaskModal; 