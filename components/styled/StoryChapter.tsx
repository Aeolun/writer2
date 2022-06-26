import styled from "styled-components"

export const StoryChapter = styled.div<{ selected: boolean }>`
  cursor: pointer;
  &:hover {
    background-color: lightyellow;
  }
  ${(props) => (props.selected ? "background-color: yellow;" : "")}
`
