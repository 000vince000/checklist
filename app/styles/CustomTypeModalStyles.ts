import styled from 'styled-components';

export const CustomTypeForm = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  position: relative;
`;

export const CustomTypeList = styled.ul`
  list-style-type: none;
  padding: 0;

  li {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
`;

export const EmojiPickerContainer = styled.div`
  position: absolute;
  z-index: 1;
  top: 100%;
  left: 0;
  margin-top: 5px;
`;

export const EmojiInput = styled.input`
  cursor: pointer;
`;
