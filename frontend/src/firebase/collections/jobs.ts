import { db } from "../firebase.config.ts";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

// Firestore Collection: "jobs"
// Document ID: auto-generated

export interface JobDocument {
  title: string;                         // required
  company: string;                       // required
  location: string;                      // default: ''
  lat?: number;                          // optional – latitude of job location
  lng?: number;                          // optional – longitude of job location
  jobType: string;                       // default: 'Full-time'
  skillsRequired: string[];              // default: []
  accessibilityTags: string[];           // default: []
  description: string;                   // default: ''
  salaryRange: string;                   // default: ''
  isActive: boolean;                     // default: true
  jobStatus: "active" | "inactive";      // explicit admin-set status
  registrationStartDate?: string;        // ISO date YYYY-MM-DD
  registrationEndDate?: string;          // ISO date YYYY-MM-DD
  createdAt: any;                        // serverTimestamp()
}

// Add a job (Admin only — enforce via Firebase Security Rules)
export const addJob = async (jobData: Omit<JobDocument, "createdAt">) => {
  const jobsRef = collection(db, "jobs");
  await addDoc(jobsRef, { ...jobData, createdAt: serverTimestamp() });
};

// Get all active jobs (public read)
export const getActiveJobs = async () => {
  const jobsRef = collection(db, "jobs");
  const q = query(jobsRef, where("isActive", "==", true));
  const snap = await getDocs(q);
  return snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as JobDocument & { id: string }));
};

// ── PwD Seed Data ─────────────────────────────────────────────────────────────
// Pre-defined PwD-friendly job listings (seed into Firestore via seedPwdJobs())
export const pwdJobs: Omit<JobDocument, "createdAt">[] = [
  {
    title: "Software Developer",
    company: "Tata Consultancy Services",
    location: "Pune, Maharashtra, India",
    lat: 18.5204, lng: 73.8567,
    jobType: "Full-time",
    skillsRequired: ["Java", "Python", "Software Development"],
    accessibilityTags: ["PwD Friendly", "Accessible Workplace"],
    description: "TCS inclusive hiring program for persons with disabilities.",
    salaryRange: "4-10 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-01",
    registrationEndDate: "2026-05-31",
  },
  {
    title: "Software Engineer",
    company: "Infosys",
    location: "Bengaluru, Karnataka, India",
    lat: 12.9716, lng: 77.5946,
    jobType: "Full-time",
    skillsRequired: ["Java", "Cloud", "Programming"],
    accessibilityTags: ["PwD Hiring Program"],
    description: "Infosys inclusive workforce initiative for PwD.",
    salaryRange: "4-9 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-10",
    registrationEndDate: "2026-06-15",
  },
  {
    title: "IT Support Engineer",
    company: "Wipro",
    location: "Bengaluru, Karnataka, India",
    lat: 12.9352, lng: 77.6245,
    jobType: "Full-time",
    skillsRequired: ["Networking", "Technical Support"],
    accessibilityTags: ["Accessible Office"],
    description: "Wipro disability inclusion hiring program.",
    salaryRange: "3-8 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-01",
    registrationEndDate: "2026-04-30",
  },
  {
    title: "Software Developer",
    company: "HCLTech",
    location: "Noida, Uttar Pradesh, India",
    lat: 28.5355, lng: 77.3910,
    jobType: "Full-time",
    skillsRequired: ["Java", "C++", "Backend Development"],
    accessibilityTags: ["PwD Friendly"],
    description: "Inclusive hiring initiative for PwD candidates.",
    salaryRange: "4-9 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-05",
    registrationEndDate: "2026-05-15",
  },
  {
    title: "Technical Analyst",
    company: "Tech Mahindra",
    location: "Hyderabad, Telangana, India",
    lat: 17.3850, lng: 78.4867,
    jobType: "Full-time",
    skillsRequired: ["Technical Support", "Networking"],
    accessibilityTags: ["PwD Hiring"],
    description: "Tech Mahindra accessibility and inclusion program.",
    salaryRange: "3-7 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-01",
    registrationEndDate: "2026-06-30",
  },
  {
    // Closing soon — ends 2026-03-18 (3 days from 2026-03-15)
    title: "Software Engineer",
    company: "Cognizant",
    location: "Chennai, Tamil Nadu, India",
    lat: 13.0827, lng: 80.2707,
    jobType: "Full-time",
    skillsRequired: ["Java", "SQL", "Programming"],
    accessibilityTags: ["Inclusive Hiring"],
    description: "Cognizant diversity hiring program.",
    salaryRange: "4-10 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-02-01",
    registrationEndDate: "2026-03-18",
  },
  {
    title: "Cloud Engineer",
    company: "Accenture",
    location: "Mumbai, Maharashtra, India",
    lat: 19.0760, lng: 72.8777,
    jobType: "Full-time",
    skillsRequired: ["Cloud", "AWS", "DevOps"],
    accessibilityTags: ["PwD Friendly"],
    description: "Accenture disability inclusion hiring program.",
    salaryRange: "6-12 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-01",
    registrationEndDate: "2026-05-31",
  },
  {
    title: "Data Analyst",
    company: "Capgemini",
    location: "Kolkata, West Bengal, India",
    lat: 22.5726, lng: 88.3639,
    jobType: "Full-time",
    skillsRequired: ["SQL", "Excel", "Data Analysis"],
    accessibilityTags: ["Accessible Workplace"],
    description: "Capgemini inclusive hiring program.",
    salaryRange: "4-8 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-10",
    registrationEndDate: "2026-04-15",
  },
  {
    title: "Software Tester",
    company: "IBM India",
    location: "Bengaluru, Karnataka, India",
    lat: 12.9791, lng: 77.5913,
    jobType: "Full-time",
    skillsRequired: ["Testing", "Automation", "QA"],
    accessibilityTags: ["PwD Friendly"],
    description: "IBM inclusive workforce program.",
    salaryRange: "5-12 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-01",
    registrationEndDate: "2026-06-01",
  },
  {
    title: "AI Engineer",
    company: "Microsoft India",
    location: "Hyderabad, Telangana, India",
    lat: 17.4474, lng: 78.3762,
    jobType: "Full-time",
    skillsRequired: ["AI", "Machine Learning", "Python"],
    accessibilityTags: ["Accessible Workplace"],
    description: "Microsoft disability hiring program.",
    salaryRange: "10-20 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-01",
    registrationEndDate: "2026-05-31",
  },
  {
    // Closing soon — ends 2026-03-20 (5 days from 2026-03-15)
    title: "Software Developer",
    company: "Google India",
    location: "Bengaluru, Karnataka, India",
    lat: 12.9783, lng: 77.6408,
    jobType: "Full-time",
    skillsRequired: ["Algorithms", "Programming"],
    accessibilityTags: ["PwD Friendly"],
    description: "Google inclusive hiring initiative.",
    salaryRange: "15-35 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-02-15",
    registrationEndDate: "2026-03-20",
  },
  {
    title: "Cloud Support Associate",
    company: "Amazon",
    location: "Hyderabad, Telangana, India",
    lat: 17.4292, lng: 78.3421,
    jobType: "Full-time",
    skillsRequired: ["Cloud", "Linux", "Networking"],
    accessibilityTags: ["Accessible Workplace"],
    description: "Amazon inclusive hiring program.",
    salaryRange: "5-12 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-05",
    registrationEndDate: "2026-05-15",
  },
  {
    title: "Software Engineer",
    company: "Oracle",
    location: "Bengaluru, Karnataka, India",
    lat: 12.9592, lng: 77.6974,
    jobType: "Full-time",
    skillsRequired: ["Java", "Database"],
    accessibilityTags: ["PwD Friendly"],
    description: "Oracle diversity hiring initiative.",
    salaryRange: "6-14 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-10",
    registrationEndDate: "2026-06-15",
  },
  {
    title: "Software Engineer",
    company: "SAP",
    location: "Bengaluru, Karnataka, India",
    lat: 12.9716, lng: 77.5946,
    jobType: "Full-time",
    skillsRequired: ["SAP", "Programming"],
    accessibilityTags: ["Autism at Work Program"],
    description: "SAP Autism at Work hiring initiative.",
    salaryRange: "8-15 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-01",
    registrationEndDate: "2026-04-30",
  },
  {
    title: "Software Developer",
    company: "Dell Technologies",
    location: "Hyderabad, Telangana, India",
    lat: 17.4126, lng: 78.4071,
    jobType: "Full-time",
    skillsRequired: ["Programming", "Cloud"],
    accessibilityTags: ["PwD Friendly"],
    description: "Dell inclusive hiring program.",
    salaryRange: "6-12 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-01",
    registrationEndDate: "2026-05-31",
  },
  {
    title: "IT Analyst",
    company: "HP",
    location: "Bengaluru, Karnataka, India",
    lat: 12.9353, lng: 77.6141,
    jobType: "Full-time",
    skillsRequired: ["IT Support", "Networking"],
    accessibilityTags: ["Accessible Workplace"],
    description: "HP disability inclusion hiring.",
    salaryRange: "5-10 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-01",
    registrationEndDate: "2026-06-30",
  },
  {
    // Registration closed — ended 2026-02-28 (before 2026-03-15)
    title: "Customer Support Executive",
    company: "Concentrix",
    location: "Gurugram, Haryana, India",
    lat: 28.4595, lng: 77.0266,
    jobType: "Full-time",
    skillsRequired: ["Communication", "Customer Support"],
    accessibilityTags: ["PwD Friendly"],
    description: "BPO inclusive hiring initiative.",
    salaryRange: "2-5 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-01-01",
    registrationEndDate: "2026-02-28",
  },
  {
    // Closing soon — ends 2026-03-17 (2 days from 2026-03-15)
    title: "Customer Support Associate",
    company: "Teleperformance",
    location: "Mumbai, Maharashtra, India",
    lat: 19.0330, lng: 73.0297,
    jobType: "Full-time",
    skillsRequired: ["Customer Service", "Communication"],
    accessibilityTags: ["Accessible Workplace"],
    description: "Inclusive hiring program.",
    salaryRange: "2-5 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-02-15",
    registrationEndDate: "2026-03-17",
  },
  {
    title: "Technical Support",
    company: "Genpact",
    location: "Noida, Uttar Pradesh, India",
    lat: 28.5355, lng: 77.3910,
    jobType: "Full-time",
    skillsRequired: ["Technical Support"],
    accessibilityTags: ["PwD Hiring"],
    description: "Genpact inclusive hiring initiative.",
    salaryRange: "3-6 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-03-01",
    registrationEndDate: "2026-05-31",
  },
  {
    // Registration closed — ended 2026-02-15 (before 2026-03-15)
    title: "Business Analyst",
    company: "Deloitte",
    location: "Mumbai, Maharashtra, India",
    lat: 19.0760, lng: 72.8777,
    jobType: "Full-time",
    skillsRequired: ["Analytics", "Consulting"],
    accessibilityTags: ["PwD Friendly"],
    description: "Deloitte diversity and inclusion hiring.",
    salaryRange: "6-15 LPA",
    isActive: true,
    jobStatus: "active",
    registrationStartDate: "2026-01-10",
    registrationEndDate: "2026-02-15",
  },
];

// ── Seed Function ─────────────────────────────────────────────────────────────
// Run this ONCE to populate Firestore with PwD job listings
// e.g., call seedPwdJobs() from an admin page or a one-time script
export const seedPwdJobs = async () => {
  const jobsRef = collection(db, "jobs");
  const results = await Promise.allSettled(
    pwdJobs.map((job) =>
      addDoc(jobsRef, { ...job, createdAt: serverTimestamp() })
    )
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(`✅ Seeded ${succeeded} PwD jobs successfully.`);
  if (failed > 0) console.warn(`⚠️ ${failed} jobs failed to seed.`);
};