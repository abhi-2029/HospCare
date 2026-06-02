import React, { useState } from "react";
import axios from "axios";
import styles from "../CSS/ChatBot.module.css";

function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleChat = () => setIsOpen(!isOpen);

  const questions = [
    { key: "age", text: "👋 What is your age?", type: "number" },
    { key: "gender", text: "What is your gender?", type: "select", options: ["male", "female"] },
    { key: "fever", text: "Do you have fever?", type: "boolean" },
    { key: "cough", text: "Do you have cough?", type: "boolean" },
    { key: "headache", text: "Do you have headache?", type: "boolean" },
    { key: "severity", text: "Severity of symptoms?", type: "select", options: ["mild", "moderate", "severe"] }
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { sender: "bot", text: questions[0].text }
  ]);

  const [patientData, setPatientData] = useState({});
  const [error, setError] = useState("");

  const handleNext = async () => {
    if (!input) return;

    const q = questions[currentQuestion];

    setMessages(prev => [...prev, { sender: "user", text: input }]);

    let value = input;
    if (q.type === "boolean") value = input === "yes" ? 1 : 0;
    if (q.type === "number") value = Number(input);

    const updated = { ...patientData, [q.key]: value };
    setPatientData(updated);

    const next = currentQuestion + 1;

    if (next < questions.length) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: questions[next].text }
        ]);
        setCurrentQuestion(next);
      }, 300);
    } else {
      await predictMedicine(updated);
    }

    setInput("");
  };

  const predictMedicine = async (data) => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://127.0.0.1:5001/api/predict", data);

      console.log("Prediction:", res.data);

      setMessages(prev => [
        ...prev,
        { sender: "bot", text: `💊 Medicine: ${res.data.prediction.medicine}` },
        { sender: "bot", text: `📌 Dosage: ${res.data.prediction.dosage}` },
        { sender: "bot", text: `⏰ Frequency: ${res.data.prediction.frequency}` }
      ]);
    } catch (err) {
      setError("Flask API not running");
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button (Always Fixed) */}
      {!isOpen && (
        <button className={styles.fab} onClick={toggleChat}>
          🏥
        </button>
      )}

      {/* Chat Window (Always Fixed) */}
      {isOpen && (
        <div className={styles.chatWindow}>
          
          {/* Header */}
          <div className={styles.header}>
            <div>
              <h4>AI Medical Assistant</h4>
              <small>Conversational Diagnosis</small>
            </div>

            <button onClick={toggleChat} className={styles.closeBtn}>
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className={styles.body}>
            {messages.map((m, i) => (
              <div key={i} className={`${styles.msg} ${styles[m.sender]}`}>
                {m.text}
              </div>
            ))}

            {error && <div className={styles.error}>{error}</div>}
          </div>

          {/* Input */}
          {!loading && (
            <div className={styles.inputArea}>
              {questions[currentQuestion]?.type === "select" ? (
                <select
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                >
                  <option value="">Select</option>
                  {questions[currentQuestion].options.map(o => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : questions[currentQuestion]?.type === "boolean" ? (
                <select value={input} onChange={(e) => setInput(e.target.value)}>
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              ) : (
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type answer..."
                />
              )}

              <button onClick={handleNext}>Send</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default FloatingChatBot;