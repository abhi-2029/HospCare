import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { FaCommentMedical, FaTimes, FaArrowLeft, FaClipboardList, FaCommentAlt, FaStethoscope } from "react-icons/fa";
import styles from "../CSS/ChatBot.module.css";

function FloatingChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("menu"); // "menu" | "guided" | "free"
  const [error, setError] = useState("");
  
  // Guided mode states
  const questions = [
    { key: "age", text: "👋 What is your age?", type: "number" },
    { key: "gender", text: "What is your gender?", type: "select", options: ["male", "female"] },
    { key: "fever", text: "Do you have a fever?", type: "boolean" },
    { key: "cough", text: "Do you have a cough?", type: "boolean" },
    { key: "headache", text: "Do you have a headache?", type: "boolean" },
    { key: "severity", text: "Severity of symptoms?", type: "select", options: ["mild", "moderate", "severe"] }
  ];
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [patientData, setPatientData] = useState({});

  // Messages states
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  // Scroll to bottom whenever messages list changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  // Set initial state based on mode selection
  const selectMode = (selectedMode) => {
    setMode(selectedMode);
    setError("");
    if (selectedMode === "guided") {
      setCurrentQuestion(0);
      setPatientData({});
      setMessages([{ sender: "bot", text: questions[0].text }]);
    } else if (selectedMode === "free") {
      setMessages([
        { 
          sender: "bot", 
          text: "Hi! I am your AI Medical Assistant. Feel free to describe your symptoms, vital readings, or questions (e.g., 'I am a 25 year old male experiencing a severe fever and dry cough for 3 days') and I'll analyze them for you." 
        }
      ]);
    }
  };

  const handleReset = () => {
    setMode("menu");
    setMessages([]);
    setInput("");
    setError("");
  };

  const handleNextGuided = async () => {
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
      await predictMedicineGuided(updated);
    }

    setInput("");
  };

  const predictMedicineGuided = async (data) => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${window.API_BASE_URL}/api/predict`, data);
      console.log("Prediction Guided:", res.data);

      setMessages(prev => [
        ...prev,
        { 
          sender: "bot", 
          text: "Here is your prescription recommendation based on your inputs:",
          card: {
            disease: res.data.patient_info?.diagnosis || "viral_fever",
            medicine: res.data.prediction?.medicine || "Not available",
            dosage: res.data.prediction?.dosage || "Not available",
            frequency: res.data.prediction?.frequency || "Not available",
            route: res.data.prediction?.route || "oral",
            precautions: res.data.prediction?.precautions || "Drink plenty of water and rest.",
            when_to_visit_doctor: res.data.prediction?.when_to_visit_doctor || "Consult a professional if symptoms persist."
          }
        }
      ]);
    } catch (err) {
      setError("Prediction service is currently offline.");
    }

    setLoading(false);
  };

  const handleFreeSend = async () => {
    if (!input.trim()) return;

    const textToSend = input;
    setMessages(prev => [...prev, { sender: "user", text: textToSend }]);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${window.API_BASE_URL}/api/chatBot`, { message: textToSend });
      if (res.data?.status === "success") {
        const pred = res.data.prediction;
        setMessages(prev => [
          ...prev,
          { 
            sender: "bot", 
            text: pred.human_reply,
            card: {
              disease: pred.disease,
              medicine: pred.medicine,
              dosage: pred.dosage,
              frequency: pred.frequency,
              route: pred.route,
              precautions: pred.precautions,
              when_to_visit_doctor: pred.when_to_visit_doctor
            }
          }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { sender: "bot", text: "Sorry, I couldn't diagnose those symptoms. Please try naming specific symptoms (fever, cough, headache, body pain) and specify severity." }
        ]);
      }
    } catch (err) {
      setError("Chatbot service is currently offline.");
    }

    setLoading(false);
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button className={styles.fab} onClick={toggleChat}>
          <FaCommentMedical />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={styles.chatWindow}>
          
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <span className={styles.botIcon}><FaStethoscope /></span>
              <div>
                <h4>AI Medical Assistant</h4>
                <small>{mode === "guided" ? "Guided Assessment" : mode === "free" ? "Free Conversation" : "Choose Assistant Mode"}</small>
              </div>
            </div>
            <div className={styles.headerActions}>
              {mode !== "menu" && (
                <button onClick={handleReset} className={styles.backBtn} title="Back to Menu">
                  <FaArrowLeft style={{ marginRight: '4px' }} /> Menu
                </button>
              )}
              <button onClick={toggleChat} className={styles.closeBtn}>
                <FaTimes />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className={styles.body}>
            {mode === "menu" ? (
              <div className={styles.menuContainer}>
                <p className={styles.menuIntro}>
                  Welcome to HospCare AI assistant. How would you like to receive medical guidance?
                </p>
                <button className={styles.menuBtn} onClick={() => selectMode("guided")}>
                  <span className={styles.menuIcon}><FaClipboardList /></span>
                  <div className={styles.menuDetails}>
                    <strong>Guided Assessment</strong>
                    <p>Answer a step-by-step symptom questionnaire</p>
                  </div>
                </button>
                <button className={styles.menuBtn} onClick={() => selectMode("free")}>
                  <span className={styles.menuIcon}><FaCommentAlt /></span>
                  <div className={styles.menuDetails}>
                    <strong>Free Conversation</strong>
                    <p>Describe your symptoms in natural language</p>
                  </div>
                </button>
                <div className={styles.menuNote}>
                  ⚠️ <strong>Disclaimer:</strong> This local ML model provides recommendations for educational/informational purposes only. Consult a doctor for clinical diagnosis.
                </div>
              </div>
            ) : (
              <div className={styles.messagesList}>
                {messages.map((m, i) => (
                  <div key={i} className={styles.messageRow}>
                    <div className={`${styles.msg} ${styles[m.sender]}`}>
                      {m.text}
                      {m.card && (
                        <div className={styles.medicalCard}>
                          <div className={styles.cardHeader}>📄 Prescription Card</div>
                          <div className={styles.cardBody}>
                            <div className={styles.cardItem}>
                              <span className={styles.cardLabel}>Likely Diagnosis</span>
                              <span className={styles.cardValue}>{m.card.disease}</span>
                            </div>
                            <div className={styles.cardItem}>
                              <span className={styles.cardLabel}>Medicine</span>
                              <span className={styles.cardValueHighlight}>{m.card.medicine}</span>
                            </div>
                            <div className={styles.cardItem}>
                              <span className={styles.cardLabel}>Dosage</span>
                              <span className={styles.cardValue}>{m.card.dosage}</span>
                            </div>
                            <div className={styles.cardItem}>
                              <span className={styles.cardLabel}>Frequency</span>
                              <span className={styles.cardValue}>{m.card.frequency}</span>
                            </div>
                            <div className={styles.cardItem}>
                              <span className={styles.cardLabel}>Route</span>
                              <span className={styles.cardValue}>{m.card.route}</span>
                            </div>
                            <div className={styles.cardDivider}></div>
                            <div className={styles.cardTextGroup}>
                              <span className={styles.cardTextTitle}>Precautions:</span>
                              <p className={styles.cardTextVal}>{m.card.precautions}</p>
                            </div>
                            <div className={styles.cardTextGroup}>
                              <span className={styles.cardTextTitleWarning}>Warning Alert:</span>
                              <p className={styles.cardTextValWarning}>{m.card.when_to_visit_doctor}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {loading && (
                  <div className={styles.messageRow}>
                    <div className={`${styles.msg} ${styles.bot} ${styles.loadingBubble}`}>
                      <div className={styles.typingIndicator}>
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
                
                {error && <div className={styles.error}>{error}</div>}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          {mode !== "menu" && (!loading || mode === "free") && (
            <div className={styles.inputArea}>
              {mode === "guided" ? (
                <>
                  {questions[currentQuestion]?.type === "select" ? (
                    <select
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className={styles.chatInput}
                    >
                      <option value="">Select option...</option>
                      {questions[currentQuestion].options.map(o => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  ) : questions[currentQuestion]?.type === "boolean" ? (
                    <select 
                      value={input} 
                      onChange={(e) => setInput(e.target.value)}
                      className={styles.chatInput}
                    >
                      <option value="">Select answer...</option>
                      <option value="yes">Yes</option>
                      <option value="no">No</option>
                    </select>
                  ) : (
                    <input
                      type="number"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Type age..."
                      className={styles.chatInput}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleNextGuided();
                      }}
                    />
                  )}
                  <button onClick={handleNextGuided} className={styles.sendBtn}>Submit</button>
                </>
              ) : (
                <>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type symptoms (e.g. fever, headache)..."
                    className={styles.chatInput}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleFreeSend();
                    }}
                  />
                  <button onClick={handleFreeSend} className={styles.sendBtn}>Send</button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default FloatingChatBot;