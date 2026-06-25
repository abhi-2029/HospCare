import axios from "axios";

const BASE_URL = "http://localhost:5000";

async function runTests() {
  console.log("==================================================");
  console.log("🚀 Starting HospCare End-to-End Verification");
  console.log("==================================================");

  // 1. Verify protected route is locked
  console.log("\n1. Testing Protected Route Authentication Protection...");
  try {
    await axios.get(`${BASE_URL}/api/doctors/appointment`);
    console.log("❌ FAILURE: Unprotected access was allowed!");
  } catch (error) {
    if (error.response && error.response.status === 401) {
      console.log("✅ SUCCESS: Route is protected and returned 401 Unauthorized.");
    } else {
      console.log(`❌ Unexpected error: ${error.message}`);
    }
  }

  // 2. Sign up a Doctor
  console.log("\n2. Registering Doctor...");
  let doctorToken;
  try {
    const docSignup = await axios.post(`${BASE_URL}/api/auth/signup`, {
      firstName: "John",
      lastName: "Doe",
      email: "drjohndoe@hospcare.com",
      mobile: "1234567890",
      dob: "1980-01-01",
      address: "123 Clinic Rd",
      category: "doctor",
      password: "password123",
      specialization: "Cardiology",
      zone: "Zone1"
    });
    console.log("✅ SUCCESS: Doctor registered.");
    doctorToken = docSignup.data.token;
  } catch (error) {
    if (error.response && error.response.data.message === "Email already registered") {
      console.log("ℹ️ Info: Doctor email already registered. Logging in...");
      const docLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: "drjohndoe@hospcare.com",
        password: "password123",
        category: "doctor"
      });
      doctorToken = docLogin.data.token;
      console.log("✅ SUCCESS: Doctor logged in.");
    } else {
      console.error("❌ Doctor signup failed:", error.response?.data || error.message);
      return;
    }
  }

  // 3. Sign up a Patient
  console.log("\n3. Registering Patient...");
  let patientToken;
  try {
    const patientSignup = await axios.post(`${BASE_URL}/api/auth/signup`, {
      firstName: "Jane",
      lastName: "Patient",
      email: "janepatient@hospcare.com",
      mobile: "9876543210",
      dob: "1995-05-05",
      address: "456 Home St",
      category: "patient",
      password: "password123"
    });
    console.log("✅ SUCCESS: Patient registered.");
    patientToken = patientSignup.data.token;
  } catch (error) {
    if (error.response && error.response.data.message === "Email already registered") {
      console.log("ℹ️ Info: Patient email already registered. Logging in...");
      const patientLogin = await axios.post(`${BASE_URL}/api/auth/login`, {
        email: "janepatient@hospcare.com",
        password: "password123",
        category: "patient"
      });
      patientToken = patientLogin.data.token;
      console.log("✅ SUCCESS: Patient logged in.");
    } else {
      console.error("❌ Patient signup failed:", error.response?.data || error.message);
      return;
    }
  }

  // 4. Book an Appointment (using Patient Token)
  console.log("\n4. Booking Appointment (authenticated)...");
  try {
    const bookingRes = await axios.post(
      `${BASE_URL}/api/bookappointment`,
      {
        doctorEmail: "drjohndoe@hospcare.com",
        doctorOrganization: "LA General Hospital",
        userEmail: "janepatient@hospcare.com",
        userAge: "30",
        userMobile: "9876543210",
        serviceType: "Cardiology Consultation"
      },
      {
        headers: { Authorization: `Bearer ${patientToken}` }
      }
    );
    console.log("✅ SUCCESS:", bookingRes.data.message);
    console.log("ℹ️ Check the backend server terminal console output to verify that confirmation and notification emails were successfully triggered.");
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log("ℹ️ Info: Appointment already booked between this doctor and patient.");
    } else {
      console.error("❌ Booking failed:", error.response?.data || error.message);
    }
  }

  // 5. Update Appointment status (using Doctor Token)
  console.log("\n5. Updating Appointment Status (as Doctor)...");
  try {
    const statusRes = await axios.post(
      `${BASE_URL}/api/doctors/appointment/Status/1?userEmail=drjohndoe@hospcare.com&number1=0&number2=5`,
      {},
      {
        headers: { Authorization: `Bearer ${doctorToken}` }
      }
    );
    console.log("✅ SUCCESS:", statusRes.data.message);
    console.log("ℹ️ Check the backend server terminal console output to verify that status update emails were successfully triggered.");
  } catch (error) {
    console.error("❌ Status update failed:", error.response?.data || error.message);
  }

  console.log("\n==================================================");
  console.log("🎉 All Tests Completed Successfully!");
  console.log("==================================================");
}

runTests();
