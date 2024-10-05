import styled from 'styled-components';

export const SearchContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const SearchInput = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const Dropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ccc;
  border-top: none;
  border-radius: 0 0 4px 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
`;

export const DropdownItem = styled.div`
  padding: 8px;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }
`;