import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./app"
import "./styles/expression-editor/style.scss"

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename="/expression-engine">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
