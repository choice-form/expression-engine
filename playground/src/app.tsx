import { Routes, Route } from "react-router-dom"
import Layout from "./components/layout"
import Playground from "./pages/playground"
import Documentation from "./pages/documentation"
import "./tailwind.css"

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Layout />}
      >
        <Route
          index
          element={<Playground />}
        />
        <Route
          path="/docs"
          element={<Documentation />}
        />
      </Route>
    </Routes>
  )
}

export default App
