import React, { useState, useRef } from "react";
import styles from "../CSS/Signup.module.css";
import HospCareLogo from "../assets/HospCare.png";
import DoctorImage from "../assets/doctar.jpeg";
import FamilyImage from "../assets/Family.jpg";

const categories = [
  "General Physician", "Cardiologist", "Dermatologist", "Neurologist",
  "Orthopedic", "Pediatrician", "Psychiatrist", "Surgeon", "Ophthalmologist",
  "ENT Specialist", "Urologist", "Nephrologist", "Gastroenterologist",
  "Endocrinologist", "Pulmonologist", "Oncologist", "Rheumatologist",
  "Hematologist", "Radiologist", "Pathologist", "Anesthesiologist",
  "Gynecologist & Obstetrician", "Andrologist", "Sexologist", "Dentist",
  "Plastic Surgeon", "Cosmetologist", "Immunologist", "Geriatrician",
  "Sports Medicine Specialist", "Neonatologist", "Palliative Care Specialist"
];

function SignUp() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    profilePic: null,
    profilePicPreview: "", // Holds the image preview URL
    dob: "",
    address: "",
    category: "patient",
    specialization: "", // Only for doctors
    zone: "", // Only for doctors
    password: "",
    confirmPassword: "",
  });

  const fileInputRef = useRef(null);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);

      setFormData({ 
        ...formData, 
        profilePic: file, 
        profilePicPreview: imageUrl // Store preview URL
      });
    }
  };

  // Function to trigger file input when clicking on image preview
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    console.log("Submitting form with data:", formData);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        window.location = "/login";
      } else {
        setError(result.message || "Signup failed!");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Something went wrong! Try again.");
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
          <h2 className={styles.welcomeTitle}>Join HospCare Today</h2>
          <p className={styles.description}>
            Create your account and gain access to personalized healthcare services. Connect with top doctors, 
            manage your health records, and experience seamless medical care with our trusted platform.
          </p>
          
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🏥</span>
              <div>
                <h3>Comprehensive Care</h3>
                <p>Access to a wide network of hospitals and specialists</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>👨‍⚕️</span>
              <div>
                <h3>Expert Doctors</h3>
                <p>Verified and experienced medical professionals</p>
              </div>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🔒</span>
              <div>
                <h3>Secure & Private</h3>
                <p>Your health data is protected with advanced security</p>
              </div>
            </div>
          </div>
          
          <div className={styles.testimonial}>
            <img src={FamilyImage} alt="Happy Family" className={styles.testimonialImage} />
            <blockquote className={styles.quote}>
              "Signing up with HospCare was the best decision for our family's health. 
              The platform is intuitive and connects us with the right care instantly."
            </blockquote>
            <cite className={styles.cite}>- Michael Chen, Patient</cite>
          </div>
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Active Users</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>1M+</span>
              <span className={styles.statLabel}>Appointments Booked</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>99%</span>
              <span className={styles.statLabel}>Satisfaction Rate</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          <h2 className={styles.title}>Create Your Account</h2>
          
          {/* Profile Picture Preview (Click to Upload) */}
          <div className={styles.imageContainer} onClick={handleImageClick}>
            {formData.profilePicPreview ? (
              <img src={formData.profilePicPreview} alt="Profile" className={styles.headerimage} />
            ) : (
              <div className={styles.headerimagetxt}>Upload Photo</div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            name="profilePic"
            className={styles.input}
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: "none" }} // Hide the file input
          />

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.grid}>
              <input type="text" name="firstName" placeholder="First Name" className={styles.input} value={formData.firstName} onChange={handleChange} required />
              <input type="text" name="lastName" placeholder="Last Name" className={styles.input} value={formData.lastName} onChange={handleChange} required />
            </div>
            <input type="email" name="email" placeholder="Email" className={styles.input} value={formData.email} onChange={handleChange} required />
            <input type="text" name="mobile" placeholder="Mobile Number" className={styles.input} value={formData.mobile} onChange={handleChange} required />
            <input type="date" name="dob" className={styles.input} value={formData.dob} onChange={handleChange} required />
            <input type="text" name="address" placeholder="Address" className={styles.input} value={formData.address} onChange={handleChange} required />
            
            {/* Category Dropdown */}
            <select name="category" className={styles.input} value={formData.category} onChange={handleChange}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="medical">Administrative</option>
            </select>
            
            {/* Show specialization dropdown & organization field if user is a doctor */}
            {formData.category === "doctor" && (
              <>
                <select
                  name="specialization"
                  className={styles.input}
                  value={formData.specialization}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Specialization</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>{category}</option>
                  ))}
                </select>
                <select
                  name="zone"
                  className={styles.input}
                  value={formData.zone}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Zone</option>
                  <option value="Zone1">Zone1</option>
                  <option value="Zone2">Zone2</option>
                  <option value="Zone3">Zone3</option>
                  <option value="Zone4">Zone4</option>
                  <option value="Zone5">Zone5</option>
                  <option value="Zone6">Zone6</option>
                  <option value="Zone7">Zone7</option>
                  <option value="Zone8">Zone8</option>
                  <option value="Zone9">Zone9</option>
                </select>
              </>
            )}

            <input type="password" name="password" placeholder="Password" className={styles.input} value={formData.password} onChange={handleChange} required />
            <input type="password" name="confirmPassword" placeholder="Confirm Password" className={styles.input} value={formData.confirmPassword} onChange={handleChange} required />
            
            {error && <p className={styles.error}>{error}</p>}

            <button type="submit" className={styles.button}>Sign Up</button>
          </form>
          
          <p className={styles.text}>Already have an account? <a href="/login" className={styles.link}>Login</a></p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
