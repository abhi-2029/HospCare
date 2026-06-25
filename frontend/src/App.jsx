import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Bootstrap
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

// Components
import Login from "./components/Login";
import SignUp from "./components/Signup";
import Navbar from "./components/Navbar";
import About from "./components/About";
import Profile from "./components/Profile";
import Home from "./components/Home";
import HomePage from "./Medical_Component/HomePage.jsx";
import Appointments from "./components/Doctor/Appointments";
import Treatment from "./components/Doctor/Treatment";
import Dashboard from "./components/Doctor/Dashboard";
import ChatBot from "./Medical_Component/ChatBot.jsx";
import ProtectedRoute from "./components/ui/ProtectedRoute.jsx";

// Styles
import styles from "./CSS/App.module.css";


// 🎬 Wrapper Component for Delayed Fade-In Animation
function DelayedComponent({ children, delay = 500 }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div className={`${styles.fadeIn} ${isVisible ? styles.show : ""}`}>
      {isVisible && children}
    </div>
  );
}


function App() {
  const [login, setLogin] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check login status
  useEffect(() => {
    if (localStorage.getItem("Data")) {
      setLogin(true);
    }
  }, []);


  return (
    <Router>
      <div className={`${styles.appContainer} ${sidebarOpen ? styles.sidebarOpen : ""}`}>

        {/* Top Navigation */}
        <Navbar
          login={login}
          setlogin={setLogin}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />

        {/* Page Content */}
        <div className={styles.pageContent}>
          <Routes>

            {/* Home with ChatBot */}
            <Route
              path="/"
              element={
                <DelayedComponent>
                  <Home login={login} setlogin={setLogin} />
                  <ChatBot />
                </DelayedComponent>
              }
            />

            {/* Appointments */}
            <Route
              path="/appointment"
              element={
                <ProtectedRoute>
                  <Appointments />
                </ProtectedRoute>
              }
            />

            {/* Doctors */}
            <Route
              path="/Doctors"
              element={
                <ProtectedRoute>
                  <DelayedComponent delay={700}>
                    <HomePage login={login} setlogin={setLogin} />
                  </DelayedComponent>
                </ProtectedRoute>
              }
            />

            {/* Login */}
            <Route
              path="/login"
              element={
                <DelayedComponent delay={900}>
                  <Login login={login} setlogin={setLogin} />
                </DelayedComponent>
              }
            />

            {/* Signup */}
            <Route
              path="/signup"
              element={
                <DelayedComponent delay={1100}>
                  <SignUp login={login} setlogin={setLogin} />
                </DelayedComponent>
              }
            />

            {/* About */}
            <Route
              path="/about"
              element={
                <DelayedComponent delay={1300}>
                  <About login={login} setlogin={setLogin} />
                </DelayedComponent>
              }
            />

            {/* Doctor Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DelayedComponent delay={1500}>
                    <Dashboard login={login} setlogin={setLogin} />
                  </DelayedComponent>
                </ProtectedRoute>
              }
            />

            {/* User Profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <DelayedComponent delay={1500}>
                    <Profile login={login} setlogin={setLogin} />
                  </DelayedComponent>
                </ProtectedRoute>
              }
            />

            {/* Treatment Page */}
            <Route
              path="/appointment/treatment"
              element={
                <ProtectedRoute>
                  <Treatment />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
