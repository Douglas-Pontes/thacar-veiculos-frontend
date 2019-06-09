import { createGlobalStyle } from "styled-components"
import "react-circular-progressbar/dist/styles.css"

export default createGlobalStyle`
    *{
        margin: 0;
        padding: 0;
        outline: 0;
        box-sizing: border-box;
    }

    body{
        font-family: Arial, Helvetica, sans-serif;
        font-size: 14px;
        background: #7159c1;
        text-rendering: optimizeLegibility;
        -webkit-font-smoothing: antialiased;
        background-image: url("http://thacarveiculos.com.br/images/fundinho.png");
        background-repeat: repeat-y;
    }

    html, body, #root {
        height: 100%;
    }
`