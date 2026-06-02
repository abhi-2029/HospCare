import { im1, im2, im3,doct1,doct2,doct3 } from './assets/img';

const cards = [
  {
    icon: im1,
    service: "Maternity Service",
  },
  {
    icon: im2,
    service: "Pharmacy Support",
  },
  {
    icon: im3,
    service: "24x7 Facility",
  }
];

const doctors = [
  {
    image: doct2,
    name: "Dr. Priya Sharma",
    speciality: "Gynecologist",
    address: "City Hospital, New Delhi",
    intro: "With over 10 years of experience, Dr. Sharma specializes in women’s health and prenatal care.",
  },
  {
    image: doct1,
    name: "Dr. Raj Mehta",
    speciality: "Cardiologist",
    address: "HeartCare Clinic, Mumbai",
    intro: "An expert in heart-related conditions, Dr. Mehta is known for his patient-first approach.",
  },
  {
    image: doct3,
    name: "Dr. Vishal Verma",
    speciality: "Pediatrician",
    address: "Sunshine Hospital, Bangalore",
    intro: "Passionate about child care, Dr. Verma has been serving children’s health needs for 8+ years.",
  }
];
const bodyCheckupCategories = [
  "Blood Tests",
  "Urine Tests",
  "Liver Function Tests (LFT)",
  "Kidney Function Tests (KFT)",
  "Thyroid Function Tests",
  "Cardiac Tests",
  "Vitamin & Mineral Tests",
  "Infection & Immunity Tests",
  "Hormone Tests",
  "Imaging & Scans",
  "Other Health Checks"
];


export  {cards,doctors,bodyCheckupCategories};
