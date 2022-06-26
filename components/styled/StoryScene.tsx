import styled from "styled-components"

export const StoryScene = styled.div<{ selected: boolean }>`
  padding-left: 10px;
  cursor: pointer;
  &:hover {
    background-color: lightyellow;
  }
  ${(props) => (props.selected ? "background-color: yellow;" : "")}
`
