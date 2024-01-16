import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { Container } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      <Container fluid>
        <Router>
          <Routes>
            <Route path='login' element={<Login />} />
            <Route path='*' element={<Home />} />
          </Routes>
        </Router>
      </Container>
      <ToastContainer autoClose={2300} theme='dark' />
    </>
  );
}

export default App;
