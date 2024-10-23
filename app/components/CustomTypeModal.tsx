import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { CustomTaskType } from '../types/Task';
import { Modal, ModalContent, Button } from '../styles/TaskStyles';
import { CustomTypeForm, CustomTypeList } from '../styles/CustomTypeModalStyles';

interface CustomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTypesUpdate: (types: CustomTaskType[]) => void;
}

const CustomTypeModal: React.FC<CustomTypeModalProps> = ({ isOpen, onClose, onTypesUpdate }) => {
  const { customTypes, setCustomTypes } = useTaskContext();
  const [newType, setNewType] = useState<CustomTaskType>({ name: '', emoji: '' });

  useEffect(() => {
    const storedTypes = localStorage.getItem('taskTypes');
    if (storedTypes) {
      const parsedTypes = JSON.parse(storedTypes);
      setCustomTypes(parsedTypes);
      onTypesUpdate(parsedTypes);
    }
  }, [setCustomTypes, onTypesUpdate]);

  const handleSave = () => {
    if (newType.name && newType.emoji) {
      const updatedTypes = [...customTypes, newType];
      setCustomTypes(updatedTypes);
      localStorage.setItem('taskTypes', JSON.stringify(updatedTypes));
      onTypesUpdate(updatedTypes);
      setNewType({ name: '', emoji: '' });
    }
  };

  const handleDelete = (name: string) => {
    const updatedTypes = customTypes.filter(type => type.name !== name);
    setCustomTypes(updatedTypes);
    localStorage.setItem('taskTypes', JSON.stringify(updatedTypes));
    onTypesUpdate(updatedTypes);
  };

  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        <h2>Customize Task Types</h2>
        <CustomTypeForm>
          <input
            type="text"
            placeholder="Type name"
            value={newType.name}
            onChange={(e) => setNewType({ ...newType, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Emoji"
            value={newType.emoji}
            onChange={(e) => setNewType({ ...newType, emoji: e.target.value })}
          />
          <Button onClick={handleSave}>Add Type</Button>
        </CustomTypeForm>
        <CustomTypeList>
          {customTypes.map(type => (
            <li key={type.name}>
              {type.emoji} {type.name}
              <Button onClick={() => handleDelete(type.name)}>Delete</Button>
            </li>
          ))}
        </CustomTypeList>
        <Button onClick={onClose}>Close</Button>
      </ModalContent>
    </Modal>
  );
};

export default CustomTypeModal;
