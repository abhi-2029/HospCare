import React, { useEffect, useState } from "react";
import { FaBars, FaTimes } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import styles from "../CSS/Navbar.module.css";
import "bootstrap/dist/css/bootstrap.min.css";
import imgage from "../assets/HospCare.png";

function Navbar({ login, setlogin }) {
  const [user, setUser] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userCategory, setUserCategory] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  // ---------------- FETCH USER ----------------
  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem("Token");

      try {
        if (!storedToken) {
          setUser(null);
          setUserCategory("");
          return;
        }

        const response = await fetch(
          `${window.API_BASE_URL}/api/auth/User`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${storedToken}`,
            },
            body: JSON.stringify({ token: storedToken }),
          }
        );

        if (!response.ok) {
          throw new Error("Unauthorized Access");
        }

        const data = await response.json();

        setUser(data);

        const userData = JSON.parse(localStorage.getItem("Data"));

        if (userData) {
          setUserCategory(userData.category);
          setFirstName(userData.firstName);
          setLastName(userData.lastName);
        }
      } catch (error) {
        console.error("Error fetching user:", error);

        setUser(null);
        setUserCategory("");
      }
    };

    fetchUser();
  }, []);

  // ---------------- LOGOUT ----------------
  const Logout = () => {
    localStorage.removeItem("Token");
    localStorage.removeItem("Data");

    setUser(null);
    setUserCategory("");

    setlogin(false);
    setSidebarOpen(false);

    navigate("/", { replace: true });
  };

  return (
    <div className={styles.navContainer}>
      {/* ---------------- LOGO ---------------- */}
      <div className={styles.logoContainer}>
        <img
          src={imgage}
          className={styles.logo}
          alt="HospCare Logo"
        />
      </div>

      {/* ---------------- BRAND NAME ---------------- */}
      <div className={styles.brandName}>
        HospCare.com
      </div>

      {/* ---------------- SEARCH BAR ---------------- */}
      <div className={styles.searchBar}></div>

      {/* ---------------- MENU BUTTON ---------------- */}
      <button
        className={styles.menuButton}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* ---------------- SIDEBAR ---------------- */}
      <div
        className={`${styles.sidebar} ${
          sidebarOpen ? styles.open : ""
        }`}
      >
        <ul className={styles.navList}>

          {/* ---------------- MEDICAL USER ---------------- */}
          {userCategory === "medical" ? (
            <>
              <li>
                <Link
                  to="/"
                  onClick={() => setSidebarOpen(false)}
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/dashboard"
                  onClick={() => setSidebarOpen(false)}
                >
                  Dashboard
                </Link>
              </li>

              <li>
                <button
                  onClick={Logout}
                  className={styles.logoutBtn}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              {/* ---------------- NORMAL USERS ---------------- */}

              <li>
                <Link
                  to="/"
                  onClick={() => setSidebarOpen(false)}
                >
                  Home
                </Link>
              </li>

              {/* Hide Doctors for doctor category */}
              {userCategory !== "doctor" && (
                <li>
                  <Link
                    to="/Doctors"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Doctors
                  </Link>
                </li>
              )}

              <li>
                <Link
                  to="/appointment"
                  onClick={() => setSidebarOpen(false)}
                >
                  Appointment
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  onClick={() => setSidebarOpen(false)}
                >
                  About
                </Link>
              </li>

              {(userCategory === "admin" ||
                userCategory === "medical") && (
                <li>
                  <Link
                    to="/dashboard"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Dashboard
                  </Link>
                </li>
              )}

              <li>
                <Link
                  to="/profile"
                  onClick={() => setSidebarOpen(false)}
                >
                  Profile
                </Link>
              </li>

              {login ? (
                <li>
                  <button
                    onClick={Logout}
                    className={styles.logoutBtn}
                  >
                    Logout
                  </button>
                </li>
              ) : (
                <li>
                  <Link
                    to="/login"
                    onClick={() => setSidebarOpen(false)}
                  >
                    Login
                  </Link>
                </li>
              )}
            </>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Navbar;