import React, { useEffect, useState } from "react";
import styles from "../CSS/HomePage.module.css";
import image3 from "../assets/Family.png";
import Appointment from "./Appointment";

function HomePage({ login, setlogin }) {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [selectedSpecialization, setSelectedSpecialization] = useState(""); 
  const [BookAppointment, setBookAppointment] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null); // Store selected doctor info

  const specializations = [
    "All", "General Physician", "Cardiologist", "Dermatologist", "Neurologist",
    "Orthopedic", "Pediatrician", "Psychiatrist", "Surgeon", "Ophthalmologist",
    "ENT Specialist", "Urologist", "Nephrologist", "Gastroenterologist", "Endocrinologist",
    "Pulmonologist", "Oncologist", "Rheumatologist", "Hematologist", "Radiologist",
    "Pathologist", "Anesthesiologist", "Gynecologist & Obstetrician", "Andrologist",
    "Sexologist", "Dentist", "Plastic Surgeon", "Cosmetologist", "Immunologist",
    "Geriatrician", "Sports Medicine Specialist", "Neonatologist", "Palliative Care Specialist",
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      const storedToken = localStorage.getItem("Token");
      if (!storedToken) {
        setlogin(false);
        window.location = "/";
        return;
      }
      try {
        const response = await fetch("http://localhost:5000/api/doctors", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
        });
        if(response.statusText=="Unauthorized"){
          window.alert("You have logged out");
          window.location="/login";
        }
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setDoctors(data);
        console.log("Fetched doctors:", data);  
        setFilteredDoctors(data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };

    fetchDoctors();
  }, []);

  useEffect(() => {
    if (selectedSpecialization === "All" || selectedSpecialization === "") {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(
        doctors.filter((doctor) => doctor.specialization === selectedSpecialization)
      );
    }
  }, [selectedSpecialization, doctors]);

  const handleSpecializationClick = (category) => {
    setSelectedSpecialization(category);
  };

  const bookAppointment = (doctor) => {
    console.log("Selected doctor for appointment:", doctor);
    setSelectedDoctor(doctor);
    setBookAppointment(true);
  };

  return (
    <>
      {BookAppointment ? (
        <Appointment doctor={selectedDoctor} setBookAppointment={setBookAppointment}/>
      ) : (
        <div className={styles.container}>
          <div className={styles.filterContainer}>
            <div className={styles.filter}>
              {specializations.map((category, index) => (
                <div
                  key={index}
                  className={`${styles.filterItem} ${
                    selectedSpecialization === category ? styles.active : ""
                  }`}
                  onClick={() => handleSpecializationClick(category)}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>

          <h2 className={styles.title}>Meet Our Doctors</h2>
          <div className={styles.cardContainer}>
            {filteredDoctors.length > 0 ? (
              filteredDoctors.map((doctor) => (
                <div key={doctor._id} className={styles.card}>
                  <div className={styles.doctprofile}>
                    <img
                      src={image3 || "https://via.placeholder.com/150"}
                      alt="Doctor"
                      className={styles.image}
                    />
                  </div>
                  <div className={styles.doctorinfo}>
                    <h3 className={styles.info}>
                      {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className={styles.info}>
                      <strong>Email:</strong> {doctor.email}
                    </p>
                    <p className={styles.info}>
                      <strong>Contact:</strong> {doctor.mobile}
                    </p>
                    <p className={styles.info}>
                      <strong>Specialization:</strong> {doctor.specialization}
                    </p>
                    <p className={styles.info}>
                      <strong>Experience:</strong> {doctor.experience} years
                    </p>
                    <p className={styles.info}>
                      <strong>Address:</strong> {doctor.address}
                    </p>
                    <p className={styles.rating}>⭐ {doctor.rating} / 5</p>
                  </div>
                  <div className={styles.book}>
                    <h1>BOOK APPOINTMENT</h1>
                    <button
                      className={styles.bookButton}
                      onClick={() => bookAppointment(doctor)} // Pass doctor info
                    >
                      Book Appointment
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noData}>No doctors available.</p>
            )}
            </div>
            
             {/* HOSPITAL FOOTER */}
    <div className={styles.footer}>
      <h3>🏥 HospCare</h3>
      <p>Advanced AI-powered Healthcare Management System</p>
      <small>© {new Date().getFullYear()} HospCare • All rights reserved</small>
    </div>
        </div>
      )}
    </>
  );
}

export default HomePage;
