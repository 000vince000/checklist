import React, { useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../context/TaskContext';
import { CustomTaskType } from '../types/Task';
import { Modal, ModalContent, Button, CloseButton } from '../styles/TaskStyles';
import { CustomTypeForm, CustomTypeList, EmojiPickerContainer, EmojiInput, TypeListItem, ButtonGroup } from '../styles/CustomTypeModalStyles';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface CustomTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTypesUpdate: (types: CustomTaskType[]) => void;
}

const CustomTypeModal: React.FC<CustomTypeModalProps> = ({ isOpen, onClose, onTypesUpdate }) => {
  const { customTypes, setCustomTypes } = useTaskContext();
  const [newType, setNewType] = useState<CustomTaskType>({ name: '', emoji: '' });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const storedTypes = localStorage.getItem('taskTypes');
    if (storedTypes) {
      const parsedTypes = JSON.parse(storedTypes);
      setCustomTypes(parsedTypes);
      onTypesUpdate(parsedTypes);
    }
  }, [setCustomTypes, onTypesUpdate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showEmojiPicker &&
          emojiPickerRef.current &&
          !emojiPickerRef.current.contains(event.target as Node) &&
          emojiInputRef.current &&
          !emojiInputRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSave = () => {
    if (newType.name && newType.emoji) {
      const updatedTypes = [...customTypes, newType];
      setCustomTypes(updatedTypes);
      localStorage.setItem('taskTypes', JSON.stringify(updatedTypes));
      onTypesUpdate(updatedTypes);
      setNewType({ name: '', emoji: '' });
      setShowEmojiPicker(false);
    }
  };

  const handleDelete = (index: number) => {
    const updatedTypes = customTypes.filter((_, i) => i !== index);
    setCustomTypes(updatedTypes);
    localStorage.setItem('taskTypes', JSON.stringify(updatedTypes));
    onTypesUpdate(updatedTypes);
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const updatedTypes = [...customTypes];
      [updatedTypes[index - 1], updatedTypes[index]] = [updatedTypes[index], updatedTypes[index - 1]];
      setCustomTypes(updatedTypes);
      localStorage.setItem('taskTypes', JSON.stringify(updatedTypes));
      onTypesUpdate(updatedTypes);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewType({ ...newType, emoji: emojiData.emoji });
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  return (
    <Modal isOpen={isOpen}>
      <ModalContent>
        <CloseButton onClick={onClose}>&times;</CloseButton>
        <h2>Customize Task Types</h2>
        <CustomTypeForm>
          <input
            type="text"
            placeholder="Type name"
            value={newType.name}
            onChange={(e) => setNewType({ ...newType, name: e.target.value })}
          />
          <EmojiInput
            ref={emojiInputRef}
            type="text"
            placeholder="Emoji"
            value={newType.emoji}
            onClick={toggleEmojiPicker}
            readOnly
          />
          <Button onClick={handleSave} style={{ alignSelf: 'flex-end' }}>Add</Button>
          {showEmojiPicker && (
            <EmojiPickerContainer ref={emojiPickerRef}>
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </EmojiPickerContainer>
          )}
        </CustomTypeForm>
        <div style={{ fontSize: '12px', color: '#888', marginTop: '10px' }}>Arrange them from most <i>joyful</i> at the top to most <i>painful</i> at the bottom</div>
        <CustomTypeList>
          {customTypes.map((type, index) => (
            <TypeListItem key={index}>
              {type.emoji} {type.name}
              <ButtonGroup>
                {index > 0 && (
                  <Button onClick={() => handleMoveUp(index)}>Move Up</Button>
                )}
                <Button onClick={() => handleDelete(index)}>X</Button>
              </ButtonGroup>
            </TypeListItem>
          ))}
        </CustomTypeList>
      </ModalContent>
    </Modal>
  );
};

export default CustomTypeModal;
