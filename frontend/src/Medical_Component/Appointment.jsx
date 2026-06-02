import { useState } from "react";
import styles from "../CSS/Appointment.module.css";

function Appointment({ doctor, setBookAppointment }) {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
    age: "",
    appointmentDate: "",
    serviceType: "",
  });

  async function book(event) {

    event.preventDefault(); 
    const token = localStorage.getItem("Token"); 
    const appointmentData = {
      doctorEmail: doctor.email,
      doctorOrganization: doctor.zone,
      userEmail: formData.email,
      userAge: formData.age,
      userMobile: formData.phone,
      serviceType: formData.serviceType,
    };

    console.log("Booking appointment with data:", appointmentData);
    try {
      const token=localStorage.getItem("Token");
      const response = await fetch(`${window.API_BASE_URL}/api/bookappointment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Send token in Authorization header
        },
        body: JSON.stringify(appointmentData),
      });

      const result = await response.json();
      console.log("Response:", result);

      if (response.ok) {
        alert("Appointment booked successfully!");
        setBookAppointment(false);
      } else {
        alert("Error booking appointment. Try again.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to connect to the server.");
    }
  }

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  return (
    
    <div className={styles.card}>
      <div className={styles.header}>
        <h2>Appointment Booking</h2>
        <p>Fill out the form to book your appointment.</p>
      </div>
      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={book} noValidate>
          <h4>Personal Information</h4>
          <div className={styles.inputGroup}>
            <label htmlFor="firstName">First Name</label>
            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phone">Phone Number</label>
            <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="age">Age</label>
            <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} required />
          </div>

          

          <div className={styles.inputGroup}>
            <label htmlFor="serviceType">Service Type</label>
            <select id="serviceType" name="serviceType" value={formData.serviceType} onChange={handleChange} required>
              <option value="">Choose...</option>
              <option>Consultation</option>
              <option>General Checkup</option>
              <option>Other</option>
            </select>
          </div>

          <div className={styles.checkbox}>
            <input type="checkbox" id="terms" required />
            <label htmlFor="terms">I agree to the terms and conditions</label>
          </div>

          <button className={styles.btn} type="submit">
            Book Appointment
          </button>
        </form>
      </div>
    </div>
  );
}

export default Appointment;
