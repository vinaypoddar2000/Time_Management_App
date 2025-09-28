import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import TableView from "./components/TableView";
import ListView from "./components/ListView";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/timesheets" element={<TableView />} />
        <Route path="/timesheets/:weekId" element={<ListView />} />
      </Routes>
    </Router>
  );
}

export default App;
