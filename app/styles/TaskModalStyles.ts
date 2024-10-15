import styled from 'styled-components';

export const ModalHeaderStyled = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
`;

export const LeftSection = styled.div`
  flex: 1;
`;

export const BackButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 15px;
  cursor: pointer;
  padding: 0px;
  margin-left: 0px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;

  &:hover {
    color: #3498db;
  }
`;

export const CloseButtonStyled = styled.button`
  background: none;
  border: none;
  color: #aaa;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0px;
  margin-right: 0px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: #fff;
  }
`;

export const ButtonGroupStyled = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 2px;
`;

export const SubtaskText = styled.span`
  margin-right: 5px;
`;

export const SubtaskButton = styled.button`
  background: none;
  border: none;
  color: #ffffff;
  font-size: 15px;
  cursor: pointer;
  padding: 0px;
  display: inline-flex;
  align-items: bottom;
  justify-content: bottom;
  transition: color 0.3s ease;
  margin-bottom: -5px; // Adjust this value to fine-tune vertical alignment

  &:hover {
    color: #3498db;
  }
`;
