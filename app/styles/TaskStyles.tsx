import styled from 'styled-components';

export const Button = styled.button`
  background-color: transparent;
  border: 1px solid #4CAF50;
  color: #4CAF50;
  padding: 8px 16px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 14px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #4CAF50;
    color: white;
  }
`;

export const Modal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  align-items: center;
  justify-content: center;
`;

export const ModalContent = styled.div`
  background-color: #2c2c2c;
  padding: 40px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  color: #ffffff;
`;

export const CloseButton = styled.span`
  color: #aaa;
  float: right;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s ease;

  &:hover {
    color: #000;
  }
`;

export const ModalHeader = styled.h2`
  color: #4CAF50;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
`;

export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

export const InlineFormGroup = styled.div`
  display: flex;
  align-items: center;
`;

export const Label = styled.label`
  font-weight: 500;
  color: #4CAF50;
`;

export const InlineLabel = styled.label`
  margin-right: 10px;
  min-width: 150px; // Ensure a minimum width for labels
  font-weight: 500;
  color: #4CAF50;
  white-space: nowrap; // Prevent label wrapping
`;

export const Input = styled.input`
  flex: 1;
  padding: 8px; // Reduced from 10px
  border: 1px solid #4CAF50;
  border-radius: 4px;
  font-size: 14px; // Reduced from 16px
  background-color: #3c3c3c;
  color: #ffffff;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.5);
  }
`;

export const Select = styled.select`
  flex: 1;
  padding: 8px; // Reduced from 10px
  border: 1px solid #4CAF50;
  border-radius: 4px;
  font-size: 14px; // Reduced from 16px
  background-color: #3c3c3c;
  color: #ffffff;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.5);
  }
`;

export const Textarea = styled.textarea`
  width: 100%;
  padding: 8px; // Reduced from 10px
  border: 1px solid #4CAF50;
  border-radius: 4px;
  font-size: 14px; // Reduced from 16px
  background-color: #3c3c3c;
  color: #ffffff;
  min-height: 80px; // Reduced from 100px
  resize: vertical;

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.5);
  }
`;

export const SubmitButton = styled(Button)`
  background-color: #4CAF50;
  color: white;

  &:hover {
    background-color: #45a049;
  }
`;

export const DropdownItem = styled.div`
  padding: 10px;
  cursor: pointer;

  &:hover {
    background-color: #4CAF50;
    color: white;
  }
`;

export const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: #3c3c3c;
  border: 1px solid #4CAF50;
  border-top: none;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

export const SearchContainer = styled.div`
  position: relative;
`;

export const SearchInput = styled(Input)`
  width: 100%;
`;

export const TaskDetails = styled.div`
  margin-bottom: 20px;
`;

export const TaskProperty = styled.p`
  margin: 10px 0;
  font-size: 14px;
`;

export const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 20px;
`;

export const ActionButton = styled(Button)`
  flex: 1;
  padding: 10px;
  font-size: 14px;
`;

export const AcceptButton = styled(ActionButton)`
  background-color: #4CAF50;
  color: white;
  &:hover { background-color: #45a049; }
`;

export const RejectButton = styled(ActionButton)`
  background-color: #ff9800;
  color: white;
  &:hover { background-color: #f57c00; }
`;

export const DeleteButton = styled(ActionButton)`
  background-color: #f44336;
  color: white;
  &:hover { background-color: #d32f2f; }
`;

export const SaveButton = styled(ActionButton)`
  background-color: #2196f3;
  color: white;
  &:hover { background-color: #1976d2; }
`;
