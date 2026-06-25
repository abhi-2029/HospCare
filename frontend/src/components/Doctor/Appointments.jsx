import { useEffect, useState } from "react";
import styles from "../../CSS/Appointments.module.css";
import HospCareLogo from "../../assets/HospCare.png";
import DoctorImage from "../../assets/doctar.jpeg";
import FamilyImage from "../../assets/Family.jpg";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [windowAppointments, setWindowAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [times, setTimes] = useState({});


  const [windowSize, setWindowSize] = useState(5);
  const [windowSize2] = useState(10);
  const [windowSize3] = useState(100);

  // 📌 helper: scheduling
  const scheduling = async (data) => {
    setAppointments(data);

    const firstBatch = data.slice(0, windowSize);
    const firstBatch2 = data.slice(windowSize, windowSize2);
    const firstBatch3 = data.slice(windowSize2, windowSize3);

    const user = JSON.parse(localStorage.getItem("Data"));
    const { email: userEmail, category } = user;

    if (firstBatch.length > 0 && category === "doctor") {
      await fetch(
        `${window.API_BASE_URL}/api/doctors/appointment/Status/1?userEmail=${userEmail}&number1=0&number2=4`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
    }

    if (firstBatch2.length > 0 && category === "doctor") {
      await fetch(
        `${window.API_BASE_URL}/api/doctors/appointment/Status/2?userEmail=${userEmail}&number1=5&number2=9`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
    }

    if (firstBatch3.length > 0 && category === "doctor") {
      await fetch(
        `${window.API_BASE_URL}/api/doctors/appointment/Status/3?userEmail=${userEmail}&number1=10&number2=99`,
        { method: "POST", headers: { "Content-Type": "application/json" } }
      );
    }

    setWindowAppointments(firstBatch);
  };

  const FetchTime = async (doctorEmail,status) => {
    try {
      console.log("Fetching schedule time for:", doctorEmail);

      const user = JSON.parse(localStorage.getItem("Data"));
      const token = localStorage.getItem("Token");

      if (!user || !user.email || !user.category) {
        setError("User data not found");
        setLoading(false);
        return;
      }

      const { email: userEmail, category } = user;
      console.log("User category:", category);
      if (category === "patient") {
        const response = await fetch(
          `${window.API_BASE_URL}/api/doctors/appointment/getTime?userEmail=${userEmail}&doctorEmail=${doctorEmail}&category=${category}&Status=${status}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Time for schedule");
        }

        const data = await response.json();
        console.log("Fetched time:", data);

        // store time specific to this doctor
        setTimes((prev) => ({
          ...prev,
          [doctorEmail]: data.estimatedTime || "N/A",
        }));
      }
    } catch (err) {
      console.error("Error fetching time:", err);
    }
  };

  // 📌 main fetch appointments
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("Data"));
        const token = localStorage.getItem("Token");

        if (!user || !user.email || !user.category) {
          setError("User data not found");
          setLoading(false);
          return;
        }

        console.log(user)
        const { email: userEmail, category, doctorEmail } = user;

        const response = await fetch(
          `${window.API_BASE_URL}/api/doctors/appointment?userEmail=${userEmail}&doctorEmail=${doctorEmail}&category=${category}&Token=${token}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch appointments");
        }

        const data = await response.json();
        scheduling(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  // 📌 attend function
  const Attend = (appointment) => {
    localStorage.setItem("userDetails", JSON.stringify(appointment));

    if (windowSize > 0) setWindowSize((prev) => prev - 1);

    window.location.href = "/appointment/treatment";
  };

  // 📌 window updates
  useEffect(() => {
    setWindowAppointments(appointments.slice(0, windowSize));
  }, [windowSize, appointments]);

  const userData = JSON.parse(localStorage.getItem("Data"));

  // ---------------- RENDER ----------------
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingHeader}>
          <img src={HospCareLogo} alt="HospCare Logo" className={styles.loadingLogo} />
          <h3 className={styles.loadingBrand}>HospCare</h3>
        </div>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading Your Appointments...</p>
        <p className={styles.loadingSubtext}>
          We're connecting you with the best healthcare professionals. Your health journey starts here at HospCare.
          While we prepare everything for you, did you know that HospCare serves over 10,000 patients monthly
          and partners with 500+ certified doctors across various specialties?
        </p>
        <div className={styles.loadingFeatures}>
          <div className={styles.loadingFeature}>
            <span className={styles.featureIcon}>⚡</span>
            <span>Instant Booking</span>
          </div>
          <div className={styles.loadingFeature}>
            <span className={styles.featureIcon}>🔒</span>
            <span>Secure & Private</span>
          </div>
          <div className={styles.loadingFeature}>
            <span className={styles.featureIcon}>💬</span>
            <span>24/7 Support</span>
          </div>
        </div>
        <img src={FamilyImage} alt="Happy Family" className={styles.loadingFamilyImage} />
        <p className={styles.loadingQuote}>
          "Your health is not just a priority—it's our promise. Welcome to a better way of healthcare."
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <img src={HospCareLogo} alt="HospCare Logo" className={styles.errorLogo} />
        <h2 className={styles.errorTitle}>Session Expired</h2>
        <p className={styles.errorText}>
          For your security, we've logged you out. Please log back in to access your appointments.
          At HospCare, we take your privacy seriously and implement the highest security standards
          to protect your health information.
        </p>
        <div className={styles.errorBenefits}>
          <h3 className={styles.benefitsTitle}>Why Choose HospCare?</h3>
          <ul className={styles.benefitsList}>
            <li>🔐 Bank-level security for your medical data</li>
            <li>👨‍⚕️ Access to board-certified physicians</li>
            <li>📱 Seamless mobile and desktop experience</li>
            <li>💙 Compassionate care with a personal touch</li>
          </ul>
        </div>
        <a href="/login" className={styles.loginButton}>Log In Again</a>
        <p className={styles.errorSubtext}>
          Need help? Our dedicated support team is here for you 24/7.
          Contact HospCare Support at support@hospcare.com or call 1-800-HOSPCARE
        </p>
        <p className={styles.errorQuote}>
          "We're more than just an app—we're your healthcare partner for life."
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      
      <div className={styles.welcomeSection}>
        <h2 className={styles.welcomeTitle}>Welcome to Your Health Dashboard</h2>
        <p className={styles.welcomeText}>
          Here you can view all your upcoming appointments, manage your healthcare schedule,
          and connect with your dedicated medical professionals. Your well-being is just a few clicks away.
        </p>
      </div>
      <h2 className={styles.title}>Your Appointments</h2>
      <div className={styles.cardGrid}>
        {windowAppointments.length > 0 ? (
          windowAppointments.map((appointment, index) => (
            <div key={index} className={styles.card}>
              <div className={styles.cardImageContainer}>
                <img src={DoctorImage} alt="Doctor" className={styles.cardImage} />
                <div className={styles.cardOverlay}>
                  <span className={styles.serviceIcon}>🏥</span>
                </div>
              </div>
              {/* header */}
              <div className={styles.cardHeader}>
                <h5 className={styles.cardTitle}>{appointment.serviceType}</h5>
                <div className={styles.statusContainer}>
                  {appointment.status === 1 && (
                    <span className={styles.statusBadgeGreen1}>✅ Confirmed</span>
                  )}
                  {appointment.status === 2 && (
                    <span className={styles.statusBadgeOrange1}>⏳ Pending</span>
                  )}
                  {(!appointment.status || appointment.status > 2) && (
                    <span className={styles.statusBadgeRed1}>❌ Not Scheduled</span>
                  )}
                </div>
              </div>

              {/* body */}
              <div className={styles.cardBody}>
                <div className={styles.patientInfo}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>👨‍⚕️</span>
                    <span><strong>Doctor:</strong> {appointment.doctorEmail}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>🏢</span>
                    <span><strong>Organization:</strong> {appointment.doctorOrganization}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>👤</span>
                    <span><strong>Patient:</strong> {appointment.userEmail}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>🎂</span>
                    <span><strong>Age:</strong> {appointment.userAge}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoIcon}>📱</span>
                    <span><strong>Mobile:</strong> {appointment.userMobile}</span>
                  </div>
                </div>
                <div className={styles.appointmentNote}>
                  <p className={styles.noteText}>
                    <strong>Remember:</strong> Your health is our priority. Please arrive 15 minutes early for your appointment.
                    Bring any relevant medical records and don't hesitate to ask questions about your care.
                  </p>
                  <p className={styles.encouragement}>
                    "Taking care of your health today ensures a brighter tomorrow. We're here to support you every step of the way!"
                  </p>
                </div>

                <div className={styles.timeSection}>
                  {appointment.status === 1 && (
                    <div className={styles.timeButtonContainer}>
                      <button
                        className={styles.timeButton}
                        onClick={() => FetchTime(appointment.doctorEmail, appointment.status)}
                      >
                        Get Your Time
                      </button>
                      {times[appointment.doctorEmail] && (
                        <div className={styles.timeDisplay}>
                          <span className={styles.timeIcon}>🕒</span>
                          {times[appointment.doctorEmail]}
                        </div>
                      )}
                    </div>
                  )}
                  {appointment.status === 2 && (
                    <div className={styles.timeButtonContainer}>
                      <button
                        className={styles.timeButton}
                        onClick={() => FetchTime(appointment.doctorEmail, appointment.status)}
                      >
                        Get Time
                      </button>
                      {times[appointment.doctorEmail] && (
                        <div className={styles.timeDisplay}>
                          <span className={styles.timeIcon}>🕒</span>
                          {times[appointment.doctorEmail]}
                        </div>
                      )}
                    </div>
                  )}
                  {(!appointment.status || appointment.status > 2) && (
                    <div className={styles.timeButtonContainer}>
                      <button
                        className={styles.timeButton}
                        onClick={() => FetchTime(appointment.doctorEmail, appointment.status)}
                      >
                        Get Time
                      </button>
                      {times[appointment.doctorEmail] && (
                        <div className={styles.timeDisplay}>
                          <span className={styles.timeIcon}>🕒</span>
                          {times[appointment.doctorEmail]}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* footer for doctors */}
              {userData?.category === "doctor" && (
                <div className={styles.cardFooter}>
                  <button className={styles.attendBtn} onClick={() => Attend(appointment)}>
                    <span className={styles.btnIcon}>👨‍⚕️</span>
                    Attend
                  </button>
                  
                </div>
              )}
            </div>
          ))
        ) : (
          <div className={styles.noDataContainer}>
            <div className={styles.noDataContent}>
              <img src={FamilyImage} alt="No Appointments" className={styles.noDataImage} />
              <h3 className={styles.noDataTitle}>No Appointments Yet</h3>
              <p className={styles.noDataText}>
                Your appointment list is empty. When you have upcoming appointments, they'll appear here.
                Don't worry—taking care of your health is easier than ever with HospCare!
              </p>
              <div className={styles.noDataStory}>
                <h4 className={styles.storyTitle}>Why Regular Check-ups Matter</h4>
                <p className={styles.storyText}>
                  Did you know that preventive care can detect potential health issues before they become serious?
                  Regular appointments with your doctor can help maintain your well-being and catch problems early.
                  At HospCare, we make scheduling these important visits simple and stress-free.
                </p>
              </div>
              <div className={styles.noDataFeatures}>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>📅</span>
                  <span>Easy Scheduling</span>
                  <p className={styles.featureDesc}>Book appointments in seconds</p>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>👨‍⚕️</span>
                  <span>Expert Doctors</span>
                  <p className={styles.featureDesc}>Certified healthcare professionals</p>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>💙</span>
                  <span>Care & Compassion</span>
                  <p className={styles.featureDesc}>Patient-centered approach</p>
                </div>
                <div className={styles.feature}>
                  <span className={styles.featureIcon}>🔒</span>
                  <span>Secure & Private</span>
                  <p className={styles.featureDesc}>Your data is always protected</p>
                </div>
              </div>
              <div className={styles.healthTips}>
                <h4 className={styles.tipsTitle}>Quick Health Tips While You Wait</h4>
                <ul className={styles.tipsList}>
                  <li>💧 Stay hydrated—drink at least 8 glasses of water daily</li>
                  <li>🏃‍♀️ Aim for 30 minutes of moderate exercise most days</li>
                  <li>🥗 Include plenty of fruits and vegetables in your diet</li>
                  <li>😴 Get 7-9 hours of quality sleep each night</li>
                  <li>🧘 Practice stress management techniques</li>
                </ul>
              </div>
              <p className={styles.noDataEncouragement}>
                Remember, your health is an investment in your future. Start your journey to better wellness today with HospCare!
              </p>
            </div>
          </div>
        )}
      </div>

      <header className={styles.mainHeader}>
        <div className={styles.headerContent}>
          <img src={HospCareLogo} alt="HospCare" className={styles.headerLogo} />
          <div className={styles.headerText}>
            <h1 className={styles.headerTitle}>HospCare Appointments</h1>
            <p className={styles.headerSubtitle}>Manage your healthcare appointments with ease</p>
            <p className={styles.headerDescription}>
              Experience the future of healthcare management with our cutting-edge platform.
              Connect with top-rated doctors, schedule appointments instantly, and receive
              personalized care that puts your health first.
            </p>
            <div className={styles.headerStats}>
              <div className={styles.stat}>
                <span className={styles.statNumber}>10K+</span>
                <span className={styles.statLabel}>Happy Patients</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Expert Doctors</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statNumber}>24/7</span>
                <span className={styles.statLabel}>Support</span>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.headerDecoration}>
          <div className={styles.decorationLine}></div>
          <div className={styles.decorationCircle}></div>
        </div>
        <div className={styles.testimonial}>
          <blockquote className={styles.quote}>
            "HospCare transformed how I manage my health appointments. It's intuitive, reliable, and truly patient-centered."
          </blockquote>
          <cite className={styles.cite}>- Dr. Sarah Johnson, Cardiologist</cite>
        </div>
      </header>
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <img src={HospCareLogo} alt="HospCare" className={styles.footerLogo} />
          <div className={styles.footerText}>
            <p className={styles.footerTagline}>Your Health, Our Priority</p>
            <p className={styles.footerContact}>Contact: support@hospcare.com | 📞 1-800-HOSPCARE</p>
            <p className={styles.footerMission}>
              At HospCare, we're committed to revolutionizing healthcare by making quality medical care
              accessible, affordable, and personalized for everyone. Join thousands of satisfied patients
              who trust us with their health journey.
            </p>
            <div className={styles.footerLinks}>
              <a href="/about" className={styles.footerLink}>About Us</a>
              <a href="/services" className={styles.footerLink}>Our Services</a>
              <a href="/privacy" className={styles.footerLink}>Privacy Policy</a>
              <a href="/terms" className={styles.footerLink}>Terms of Service</a>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p className={styles.footerCopyright}>
            © 2024 HospCare. All rights reserved. | Made with ❤️ for better healthcare
          </p>
          <p className={styles.footerQuote}>
            "Healthcare is not just about treating illness—it's about nurturing wellness."
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Appointments;
