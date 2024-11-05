import styled, { createGlobalStyle } from 'styled-components';
import { NewTaskButton } from './TaskStyles';

export const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background-color: #1e1e1e;
  }
`;

export const AppContainer = styled.div`
  width: 100%;
  margin: 0;
  padding: 1rem;
  font-family: 'Roboto', sans-serif;
  color: #e0e0e0;
  background-color: #1e1e1e;
  min-height: 100vh;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 2rem;
  }
`;

export const Header = styled.header`
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;

  @media (min-width: 768px) {
    margin-bottom: 2rem;
  }
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 300;
  color: #ffffff;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 2.5rem;
  }
`;

export const ButtonAndFilterContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;

  @media (max-width: 768px) {
    margin-top: 10px;
    justify-content: space-between;
  }
`;

export const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 768px) {
    margin: 0px 0px;
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  
  @media (max-width: 768px) {
    flex: 1;
    justify-content: flex-end;
  }
`;

export const FilterDropdown = styled.select`
  padding: 8px;
  border-radius: 4px;
  background-color: #2c2c2c;
  color: #ffffff;
  border: 1px solid #3498db;
  cursor: pointer;

  @media (max-width: 768px) {
    padding: 6px;
    font-size: 12px;
    max-width: 90px;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.5);
  }
`;

export const LuckyButtonStyled = styled(NewTaskButton)`
  background-color: transparent;
  border: 1px solid #FFA500;
  color: #FFA500;

  &:hover {
    background-color: #FFA500;
    color: white;
  }
`;

export const Section = styled.section`
  background-color: #2c2c2c;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 0.5rem;

  @media (max-width: 768px) {
    padding: 1rem;
    margin-bottom: 0.5rem;
  }
`;

export const MoodModal = styled.div<{ isOpen: boolean }>`
  display: ${props => props.isOpen ? 'flex' : 'none'};
  position: fixed;
  z-index: 1;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: center;
  align-items: center;
`;

export const MoodModalContent = styled.div`
  background-color: #3c3c3c;
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const MoodButton = styled.button`
  background-color: transparent;
  border: 1px solid #4CAF50;
  color: #4CAF50;
  padding: 10px 20px;
  margin: 5px;
  cursor: pointer;
  font-size: 18px;
  border-radius: 4px;
  transition: background-color 0.3s ease, color 0.3s ease;

  &:hover {
    background-color: #4CAF50;
    color: white;
  }
`;

export const SearchBar = styled.input`
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

export const SearchAndTopWordsContainer = styled.div`
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 1rem;
  gap: 10px;
  flex-wrap: wrap;
`;

export const TopWordButton = styled(LuckyButtonStyled)`
  font-size: 0.8rem;
  padding: 5px 10px;
`;

export const LoadingIndicator = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  color: white;
  font-size: 24px;
`;

export const ExpandableRow = styled.div`
  margin-top: 2px;
  padding-top: 1rem;

  button {
    background-color: #f6f8fa;
    border: 1px solid #d1d5da;
    border-radius: 6px;
    color: #24292e;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    padding: 6px 12px;
    margin-bottom: 0rem;

    &:hover {
      background-color: #e1e4e8;
    }
  }
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

export const SearchBarContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 300px;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

export const ClearButton = styled.button`
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #666;
  padding: 0 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;

  &:hover {
    color: #333;
  }
`;
