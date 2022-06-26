import styled from "styled-components"

export const Page = styled.div`
  width: 40%;

  overflow: auto;
  border-right: 1px solid black;
  & > div {
    img {
      max-width: 100%;
      max-height: 100%;
      height: auto;
      width: auto;
    }
  }
`
