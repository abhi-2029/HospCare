import React, { useState } from "react";
import styles from "../CSS/Login.module.css";
import HospCareLogo from "../assets/HospCare.png";
import DoctorImage from "../assets/doctar.jpeg";
import FamilyImage from "../assets/Family.jpg";

const Login = ({ login, setlogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("patient"); // Default category
  const [error, setError] = useState(""); // To show errors if login fails
  const [loading, setLoading] = useState(false); // Loading state

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    const loginData = { email, password, category };

    try {
      setLoading(true); // Start loading
      const response = await fetch(`${window.API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Login failed");
      }

      // Store in local storage
      if (result.token && result.user) {
        localStorage.setItem("Token", result.token);
        localStorage.setItem("Data", JSON.stringify(result.user));

        // Update login state
        setlogin(true);
        alert("Login Successful!");
        window.location = "/"; // Redirect after login state update
      } else {
        throw new Error("Invalid server response");
      }
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <div className={styles.logoSection}>
          
          <h1 className={styles.brandName}>HospCare</h1>
          <p className={styles.tagline}>Your Health, Our Priority</p>
        </div>
        
        <div className={styles.contentSection}>
          <h2 className={styles.welcomeTitle}>Welcome Back to HospCare</h2>
          <p className={styles.description}>
            Access your personalized healthcare dashboard. Connect with top doctors, manage appointments, 
            and take control of your well-being with our comprehensive hospital management system.
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🏥</span>
              <div>
                <h3>Advanced Hospital Network</h3>
                <p>Partnered with 500+ certified hospitals across the country</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>👨‍⚕️</span>
              <div>
                <h3>Expert Medical Team</h3>
                <p>Access to board-certified physicians and specialists</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>📱</span>
              <div>
                <h3>Seamless Experience</h3>
                <p>24/7 support with user-friendly mobile and desktop access</p>
              </div>
            </div>
          </div>
          
          <div className={styles.testimonial}>
            <img src={FamilyImage} alt="Happy Family" className={styles.testimonialImage} />
            <blockquote className={styles.quote}>
              "HospCare transformed our family's healthcare experience. From booking appointments to 
              receiving personalized care, everything is just a click away."
            </blockquote>
            <cite className={styles.cite}>- Sarah Johnson, Patient</cite>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>10,000+</span>
              <span className={styles.statLabel}>Patients Served</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Partner Hospitals</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>24/7</span>
              <span className={styles.statLabel}>Support Available</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <h2 className={styles.title}>Login to Your Account</h2>
          <form onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Password</label>
              <input
                type="password"
                className={styles.input}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Category</label>
              <select
                className={styles.input}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
                <option value="medical">Administrative</option>
              </select>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          <p className={styles.link}>
            Don't have an account? <a href="/signup">Sign up</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
