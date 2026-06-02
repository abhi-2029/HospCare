import React, { useEffect, useState } from "react";
import styles from "../CSS/Profile.module.css";

function Profile() {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    profilePic: "",
    dob: "",
    address: "",
    category: "",
    gender: "",
    bloodGroup: "",
    medicalHistory: "",
    emergencyContact: "",
    about: "",
  });

  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedData = localStorage.getItem("Data");
    if (storedData) setProfile(JSON.parse(storedData));

    const fetchUser = async () => {
      const storedToken = localStorage.getItem("Token");

      try {
        const response = await fetch("http://localhost:5000/api/auth/User", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${storedToken}`,
          },
          body: JSON.stringify({ token: storedToken }),
        });

        if (!response.ok) {
          window.location = "/";
          return;
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  return (
    <div className={styles.page}>

      {/* HOSPITAL HEADER */}
      <div className={styles.hospitalHeader}>
        <div className={styles.left}>
          <img
            src={profile.profilePic || "https://via.placeholder.com/150"}
            alt="profile"
          />
        </div>

        <div className={styles.right}>
          <h2>{profile.firstName} {profile.lastName}</h2>
          <p className={styles.role}>
            Patient ID: HC-{Math.floor(Math.random() * 90000)}
          </p>

          <div className={styles.tags}>
            <span>{profile.gender || "Not specified"}</span>
            <span>{profile.bloodGroup || "N/A"}</span>
            <span>{profile.category || "General Patient"}</span>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className={styles.grid}>

        {/* ABOUT */}
        <div className={styles.card}>
          <h3>🧾 Patient Overview</h3>
          <p>{profile.about || "No medical description available."}</p>
        </div>

        {/* PERSONAL INFO */}
        <div className={styles.card}>
          <h3>👤 Personal Details</h3>

          <div className={styles.infoGrid}>
            <div><span>Email</span><b>{profile.email || "N/A"}</b></div>
            <div><span>Mobile</span><b>{profile.mobile || "N/A"}</b></div>
            <div><span>DOB</span><b>{profile.dob || "N/A"}</b></div>
            <div><span>Address</span><b>{profile.address || "N/A"}</b></div>
          </div>
        </div>

        {/* VITAL STYLE HEALTH CARD */}
        <div className={styles.card}>
          <h3>❤️ Health Snapshot</h3>

          <div className={styles.vitals}>
            <div>
              <h4>Blood Group</h4>
              <p>{profile.bloodGroup || "Unknown"}</p>
            </div>

            <div>
              <h4>Risk Level</h4>
              <p className={styles.low}>Low</p>
            </div>

            <div>
              <h4>Emergency Contact</h4>
              <p>{profile.emergencyContact || "Not added"}</p>
            </div>
          </div>
        </div>

        {/* MEDICAL HISTORY */}
        <div className={styles.card}>
          <h3>🩺 Medical History</h3>
          <p>{profile.medicalHistory || "No past medical records found."}</p>
        </div>

        {/* AI INSIGHTS */}
        <div className={styles.card}>
          <h3>🧠 AI Health Insights</h3>
          <ul className={styles.list}>
            <li>Maintain regular sleep cycle (7–8 hrs)</li>
            <li>Drink sufficient water daily</li>
            <li>Monitor vitals weekly</li>
            <li>Recommended: light exercise</li>
          </ul>
        </div>
      </div>

      {/* HOSPITAL FOOTER */}
      <div className={styles.footer}>
        <h3>🏥 HospCare</h3>
        <p>Advanced AI-powered Healthcare Management System</p>
        <small>© {new Date().getFullYear()} HospCare • All rights reserved</small>
      </div>

    </div>
  )
};

export default Profile;