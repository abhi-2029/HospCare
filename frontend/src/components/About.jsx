import React from "react";
import styles from "../CSS/About.module.css";
import { motion } from "framer-motion";

function About() {

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className={styles.main}>

      {/* HERO */}
      <motion.section
        className={styles.hero}
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className={styles.heroText}>
          <h1>🏥 HospCare</h1>
          <p>AI-Powered Healthcare Platform connecting Patients, Doctors, and Intelligence.</p>
        </div>

        <motion.img
          src="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5"
          alt="hospital"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
        />
      </motion.section>

      {/* MISSION */}
      <motion.section
        className={styles.section}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <h2>🎯 Our Mission</h2>
        <p>
          HospCare makes healthcare simple, fast, and intelligent using AI-driven diagnosis and automation.
        </p>
      </motion.section>

      {/* FEATURES */}
      <motion.section
        className={styles.features}
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true }}
      >

        {[
          { title: "🤖 AI Patient Assistant", desc: "Smart symptom checker and medicine suggestion." },
          { title: "📅 Appointment System", desc: "Instant doctor booking based on availability." },
          { title: "💊 Smart Prescription", desc: "AI-based medicine recommendations." },
          { title: "📊 Doctor Analytics", desc: "Performance tracking & patient recovery insights." },
          { title: "🩺 Health Dashboard", desc: "Centralized patient health monitoring." },
          { title: "⏱ Emergency AI Support", desc: "Instant health guidance in critical situations." }
        ].map((f, i) => (
          <motion.div
            className={styles.card}
            key={i}
            variants={item}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
            }}
          >
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </motion.div>
        ))}

      </motion.section>

      {/* VISION */}
      <motion.section
        className={styles.splitSection}
        initial={{ opacity: 0, x: -40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h2>🌍 Our Vision</h2>
          <p>
            A world where healthcare is instant, intelligent, and accessible to everyone.
          </p>
        </div>

        <motion.img
          src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1f"
          whileHover={{ scale: 1.05 }}
        />
      </motion.section>


      {/* FOOTER */}
      <motion.footer
        className={styles.footer}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
      >
        <h3>🏥 HospCare</h3>
        <p>AI-Powered Healthcare Ecosystem</p>
        <small>© {new Date().getFullYear()} HospCare</small>
      </motion.footer>

    </main>
  );
}

export default About;