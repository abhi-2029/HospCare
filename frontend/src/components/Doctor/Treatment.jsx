import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { bodyCheckupCategories } from "../../obj";
import styles from "../../CSS/Treatment.module.css";

function Treatment() {
  const [token, setToken] = useState("");
  const [patientDetails, setPatientDetails] = useState({});
  const [AllMediCalTests, setAllMediCalTests] = useState(bodyCheckupCategories);
  const [allMedicines, setAllMedicines] = useState([]);
  const [medQuantity, setMedQuantity] = useState(0);
  const [assignedMedicines, setAssignedMedicines] = useState([]);
  const [assignedTests, setAssignedTests] = useState([]);

  useEffect(() => {
    const storedToken = localStorage.getItem("Token");
    const storedUser = localStorage.getItem("userDetails");

    if (!storedToken) {
      alert("⚠️ Token missing. Please log in again.");
      return;
    }

    setToken(storedToken);
    setPatientDetails(JSON.parse(storedUser) || {});
  }, []);

  useEffect(() => {
    if (!token) return;

    async function fetchMedicines() {
      try {
        const user = JSON.parse(localStorage.getItem("Data")) || {};
        const { email, zone } = user;

        const res = await fetch(`${window.API_BASE_URL}/api/Medical/Medicine`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            email,
            zone,
          }),
        });

        const data = await res.json();
        setAllMedicines(data?.medicines?.Medicines || []);
      } catch (err) {
        console.error("Error fetching medicines:", err);
        alert("❌ Failed to fetch medicine data.");
      }
    }

    fetchMedicines();
  }, [token]);

  const addMedicineRow = () => {
    setAssignedMedicines([
      { medicine: "", quantity: "", search: "", showSuggestions: false },
      ...assignedMedicines,
    ]);
  };

  const addTestRow = () => {
    setAssignedTests([{ test: "", search: "", showSuggestions: false }, ...assignedTests]);
  };

  const handleMedicineChange = (index, field, value) => {
    const updated = [...assignedMedicines];
    updated[index][field] = value;

    if (field === "quantity" && Number(value) > Number(medQuantity) && medQuantity > 0) {
      alert(`Only ${medQuantity} tablets available in stock!`);
      updated[index][field] = medQuantity;
    }

    if (field === "search") updated[index].showSuggestions = true;
    setAssignedMedicines(updated);
  };

  const handleTestChange = (index, field, value) => {
    const updated = [...assignedTests];
    updated[index][field] = value;
    if (field === "search") updated[index].showSuggestions = true;
    setAssignedTests(updated);
  };

  const handleMedicineEnter = () => addMedicineRow();
  const handleTestEnter = () => addTestRow();

  const selectMedicine = (index, medName, noOfTablets) => {
    const updated = [...assignedMedicines];
    setMedQuantity(noOfTablets || 0);
    updated[index].medicine = medName;
    updated[index].search = medName;
    updated[index].showSuggestions = false;
    setAssignedMedicines(updated);
  };

  const selectTest = (index, testName) => {
    const updated = [...assignedTests];
    updated[index].test = testName;
    updated[index].search = testName;
    updated[index].showSuggestions = false;
    setAssignedTests(updated);
  };

  const removeMedicineRow = (index) => {
    setAssignedMedicines(assignedMedicines.filter((_, i) => i !== index));
  };

  const removeTestRow = (index) => {
    setAssignedTests(assignedTests.filter((_, i) => i !== index));
  };

  const totalMedicineUnits = assignedMedicines.reduce(
    (sum, med) => sum + (Number(med.quantity) || 0),
    0
  );

  const lowStockItems = allMedicines
    .filter((item) => Number(item.noOfTablets) > 0 && Number(item.noOfTablets) <= 15)
    .slice(0, 4);

  const doctorData = JSON.parse(localStorage.getItem("Data")) || {};

  const careSteps = [
    { label: "Review patient details", hint: "Confirm symptoms and history." },
    { label: "Add medicines", hint: "Choose from available inventory." },
    { label: "Recommend tests", hint: "Select targeted body tests." },
    { label: "Finalize treatment", hint: "Submit the care plan quickly." },
  ];

  const handleSubmit = async () => {
    const user = JSON.parse(localStorage.getItem("Data")) || {};
    const { email, zone } = user;

    const payload = {
      patientEmail: patientDetails.userEmail,
      patientMobile: patientDetails.userMobile,
      doctorEmail: email,
      zone,
      medicines: assignedMedicines.map((med) => ({
        name: med.medicine,
        quantity: Number(med.quantity),
      })),
      tests: assignedTests.map((test) => ({ name: test.test })),
    };

    try {
      const res = await fetch(`${window.API_BASE_URL}/api/Medical/SubmitTreatment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to submit");

      const data = await res.json();

      const updatedMedicines = allMedicines.map((med) => {
        const used = assignedMedicines.find((m) => m.medicine === med.name);
        if (used) {
          const newStock = Number(med.noOfTablets) - Number(used.quantity);
          return { ...med, noOfTablets: newStock >= 0 ? newStock : 0 };
        }
        return med;
      });

      setAllMedicines(updatedMedicines);

      await fetch(`${window.API_BASE_URL}/api/Medical/MedicineUpdate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          AllMedicines: payload.medicines,
          zones: zone,
        }),
      });

      setAssignedMedicines([]);
      setAssignedTests([]);
      alert("✅ Treatment submitted successfully!");
      console.log(data);
    } catch (err) {
      console.error("Submission Error:", err);
      alert("❌ Failed to submit treatment.");
    }
  };

  return (
    <div className={styles.treatmentContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Treatment Dashboard</h1>
          <p className={styles.pageSubtitle}>
            Build precise prescriptions, recommend tests, and keep patient treatment plans organized.
          </p>
        </div>
        <div className={styles.headerBadge}>HospCare Care Plan</div>
      </div>

      <div className={styles.topGrid}>
        <section className={styles.patientCard}>
          <div className={styles.cardTitle}>Patient Snapshot</div>
          <div className={styles.patientInfoList}>
            <div className={styles.patientInfoRow}>
              <span>Email</span>
              <strong>{patientDetails.userEmail || "Not available"}</strong>
            </div>
            <div className={styles.patientInfoRow}>
              <span>Phone</span>
              <strong>{patientDetails.userMobile || "Not available"}</strong>
            </div>
            <div className={styles.patientInfoRow}>
              <span>Doctor</span>
              <strong>{doctorData.email || "Your profile"}</strong>
            </div>
            <div className={styles.patientInfoRow}>
              <span>Treatment Zone</span>
              <strong>{doctorData.zone || "N/A"}</strong>
            </div>
          </div>
          <div className={styles.patientBadgeGroup}>
            <span className={styles.patientBadge}>Priority: High</span>
            <span className={styles.patientBadge}>Status: Active</span>
            <span className={styles.patientBadge}>Treatment ready</span>
          </div>
        </section>

        <section className={styles.highlightCard}>
          <div className={styles.cardTitle}>Care Navigator</div>
          <div className={styles.stepGrid}>
            {careSteps.map((step, index) => (
              <div key={step.label} className={styles.stepItem}>
                <div className={styles.stepIndex}>{index + 1}</div>
                <div>
                  <div className={styles.stepLabel}>{step.label}</div>
                  <div className={styles.stepHint}>{step.hint}</div>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.tipNote}>
            <strong>Tip:</strong> Keep the treatment plan concise, aligned with inventory levels, and easy to review.
          </div>
        </section>
      </div>

      <div className={styles.actionPanelGrid}>
        <section className={styles.actionPanel}>
          <div className={styles.actionsHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Prescribe Medicine</h2>
              <p className={styles.sectionText}>
                Search inventory, set a dose and see the available stock at a glance.
              </p>
            </div>
            <button className={styles.actionButton} onClick={addMedicineRow}>
              + Add Medicine
            </button>
          </div>

          {assignedMedicines.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.customTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Medicine</th>
                    <th>Quantity</th>
                    <th>Stock</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedMedicines.map((row, index) => {
                    const suggestions = allMedicines.filter((med) =>
                      med.name?.trim().toLowerCase().includes(row.search.toLowerCase())
                    );
                    const selectedStock = allMedicines.find((med) => med.name?.trim() === row.medicine)?.noOfTablets;
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className={styles.suggestionCell}>
                          <input
                            type="text"
                            className={styles.inputField}
                            placeholder="Search medicine"
                            value={row.search}
                            onChange={(e) => handleMedicineChange(index, "search", e.target.value)}
                          />
                          {row.search && row.showSuggestions && suggestions.length > 0 && (
                            <ul className={styles.suggestionList}>
                              {suggestions.map((med) => (
                                <li
                                  key={med._id}
                                  onClick={() => selectMedicine(index, med.name?.trim(), med.noOfTablets)}
                                >
                                  <span>{med.name?.trim()}</span>
                                  <small>{med.noOfTablets} left</small>
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td>
                          <input
                            type="number"
                            min="1"
                            className={styles.inputField}
                            value={row.quantity}
                            onChange={(e) => handleMedicineChange(index, "quantity", e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleMedicineEnter(index);
                            }}
                          />
                        </td>
                        <td>
                          <span className={styles.stockBadge}>
                            {selectedStock != null ? `${selectedStock} pcs` : "—"}
                          </span>
                        </td>
                        <td>
                          <button className={styles.removeButton} onClick={() => removeMedicineRow(index)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No medicines have been added yet.</p>
              <button className={styles.secondaryButton} onClick={addMedicineRow}>
                Start with a medicine
              </button>
            </div>
          )}
        </section>

        <section className={styles.actionPanel}>
          <div className={styles.actionsHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Recommend Tests</h2>
              <p className={styles.sectionText}>
                Choose tests from common categories and provide a clear plan for follow-up.
              </p>
            </div>
            <button className={styles.actionButtonSecondary} onClick={addTestRow}>
              + Add Test
            </button>
          </div>

          {assignedTests.length > 0 ? (
            <div className={styles.tableWrapper}>
              <table className={styles.customTable}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Test Name</th>
                    <th>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedTests.map((row, index) => {
                    const suggestions = AllMediCalTests.filter((test) =>
                      test.toLowerCase().includes(row.search.toLowerCase())
                    );
                    return (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td className={styles.suggestionCell}>
                          <input
                            type="text"
                            className={styles.inputField}
                            placeholder="Search test"
                            value={row.search}
                            onChange={(e) => handleTestChange(index, "search", e.target.value)}
                          />
                          {row.search && row.showSuggestions && suggestions.length > 0 && (
                            <ul className={styles.suggestionList}>
                              {suggestions.map((test, testIndex) => (
                                <li key={testIndex} onClick={() => selectTest(index, test)}>
                                  {test}
                                </li>
                              ))}
                            </ul>
                          )}
                        </td>
                        <td>
                          <button className={styles.removeButton} onClick={() => removeTestRow(index)}>
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p>No tests have been added yet.</p>
              <button className={styles.secondaryButton} onClick={addTestRow}>
                Start with a test
              </button>
            </div>
          )}
        </section>
      </div>

      <div className={styles.summaryGrid}>
        <section className={styles.metricsCard}>
          <div className={styles.cardTitle}>Treatment Summary</div>
          <div className={styles.metricRow}>
            <div>
              <div className={styles.metricValue}>{assignedMedicines.length}</div>
              <div className={styles.metricLabel}>Medicines</div>
            </div>
            <div>
              <div className={styles.metricValue}>{assignedTests.length}</div>
              <div className={styles.metricLabel}>Body Tests</div>
            </div>
            <div>
              <div className={styles.metricValue}>{totalMedicineUnits}</div>
              <div className={styles.metricLabel}>Total Units</div>
            </div>
          </div>
          <div className={styles.metricNote}>
            A quick overview of the current regimen and care balance.
          </div>
        </section>

        <section className={styles.notesCard}>
          <div className={styles.cardTitle}>Treatment Notes</div>
          <ul className={styles.notesList}>
            <li>Use medicines with a clear dosing schedule.</li>
            <li>Verify allergy history before final submission.</li>
            <li>Recommend follow-up in 7 days for review.</li>
          </ul>
        </section>

        <section className={styles.insightCard}>
          <div className={styles.cardTitle}>Inventory Alerts</div>
          {lowStockItems.length > 0 ? (
            <ul className={styles.lowStockList}>
              {lowStockItems.map((item) => (
                <li key={item._id}>
                  <span>{item.name}</span>
                  <strong>{item.noOfTablets} tablets left</strong>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.emptyState}>No low-stock medicines right now.</div>
          )}
        </section>
      </div>

      <div className={styles.footerBar}>
        <div>
          <h3>Ready to finalize treatment?</h3>
          <p>Review the summary, then submit the complete plan for the patient.</p>
        </div>
        <button className={styles.submitButton} onClick={handleSubmit}>
          Submit Treatment
        </button>
      </div>
    </div>
  );
}

export default Treatment;
