import React, { useState } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { CustomTaskType } from '../types/Task';
import { Modal, ModalContent, Button } from '../styles/TaskStyles';
import { CustomTypeForm, CustomTypeList } from '../styles/CustomTypeModalStyles';

interface CustomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CustomTypeModal: React.FC<CustomTypeModalProps> = ({ isOpen, onClose }) => {
  const { customTypes, setCustomTypes } = useTaskContext();
  const [newType, setNewType] = useState<CustomTaskType>({ name: '', emoji: '' });

  const handleSave = () => {
    if (newType.name && newType.emoji) {
      setCustomTypes([...customTypes, newType]);
      setNewType({ name: '', emoji: '' });
    }
  };

  const handleDelete = (name: string) => {
    setCustomTypes(customTypes.filter(type => type.name !== name));
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

