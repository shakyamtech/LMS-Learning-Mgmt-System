import { logout } from "@/app/actions/auth";
import { decryptSession } from "@/lib/auth-utils";
import { db } from "@/lib/firebase";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./AdminDashboardClient";

export default async function AdminDashboard() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("session")?.value;
  
  if (!sessionToken) {
    redirect("/login");
  }

  const session = await decryptSession(sessionToken);
  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  // 1. Fetch all registered Teachers
  const teachersSnap = await db.collection("users").where("role", "==", "TEACHER").get();
  const teachers = teachersSnap.docs.map(doc => ({
    id: doc.id,
    name: (doc.data().name as string | undefined) || null,
    email: (doc.data().email as string | undefined) || null,
  }));

  // 2. Fetch all existing Courses
  const coursesSnap = await db.collection("courses").get();
  const courses = [];
  
  for (const doc of coursesSnap.docs) {
    const courseData = doc.data();
    
    // Fetch Teacher details
    let teacher = { name: "Unknown" as string | null, email: null as string | null };
    if (courseData.teacherId) {
      const teacherSnap = await db.collection("users").doc(courseData.teacherId).get();
      if (teacherSnap.exists) {
        teacher = {
          name: (teacherSnap.data()?.name as string | undefined) || null,
          email: (teacherSnap.data()?.email as string | undefined) || null,
        };
      }
    }
    
    // Fetch enrollments count
    const enrollsSnap = await db.collection("enrollments").where("courseId", "==", doc.id).get();
    
    courses.push({
      id: doc.id,
      code: courseData.code,
      title: courseData.title,
      description: courseData.description,
      teacherId: courseData.teacherId,
      teacher,
      enrollments: new Array(enrollsSnap.size).fill({ id: "dummy" }) // just for length
    });
  }
  
  // Sort courses by code asc
  courses.sort((a, b) => a.code.localeCompare(b.code));

  // 3. Fetch Platform statistics
  const totalUsersSnap = await db.collection("users").count().get();
  const totalUsers = totalUsersSnap.data().count;
  
  const totalCoursesSnap = await db.collection("courses").count().get();
  const totalCourses = totalCoursesSnap.data().count;

  // 4. Fetch all registered Users (Students, Teachers, Admins)
  const allUsersSnap = await db.collection("users").get();
  const allUsers = allUsersSnap.docs.map(doc => ({
    id: doc.id,
    name: (doc.data().name as string | undefined) || null,
    email: (doc.data().email as string | undefined) || null,
    role: (doc.data().role as string | undefined) || "STUDENT",
    approved: doc.data().approved !== false,
    createdAt: (doc.data().createdAt as string | undefined) || null,
    phone: (doc.data().phone as string | undefined) || null,
    address: (doc.data().address as string | undefined) || null,
    dob: (doc.data().dob as string | undefined) || null,
    faculty: (doc.data().faculty as string | undefined) || null,
    rollNo: (doc.data().rollNo as string | undefined) || null,
    admissionDate: (doc.data().admissionDate as string | undefined) || null,
    totalFee: typeof doc.data().totalFee === "number" ? doc.data().totalFee : null,
    paidFee: typeof doc.data().paidFee === "number" ? doc.data().paidFee : null,
  }));

  const students = allUsers.filter(u => u.role === "STUDENT");

  // 5. Fetch Financial Transactions for Accounting
  const txSnap = await db.collection("transactions").orderBy("date", "desc").get();
  const initialTransactions = txSnap.docs.map((doc) => ({
    id: doc.id,
    type: doc.data().type as "INCOME" | "EXPENSE" | "STUDENT_FEE",
    title: doc.data().title as string,
    amount: doc.data().amount as number,
    category: doc.data().category as string,
    paymentMethod: doc.data().paymentMethod as string,
    date: doc.data().date as string,
    studentId: doc.data().studentId as string | undefined,
    studentName: doc.data().studentName as string | undefined,
    notes: doc.data().notes as string | undefined,
    createdAt: doc.data().createdAt as string | undefined,
  }));

  // 6. Fetch Homepage CMS Config
  const homepageConfigSnap = await db.collection("config").doc("homepage").get();
  const homepageConfigData = homepageConfigSnap.exists ? homepageConfigSnap.data() : null;
  const cmsConfig = homepageConfigData && homepageConfigData.slides ? homepageConfigData.slides : null;

  return (
    <AdminDashboardClient
      teachers={teachers}
      courses={courses}
      students={students}
      allUsers={allUsers}
      initialTransactions={initialTransactions}
      cmsConfig={cmsConfig}
      totalUsers={totalUsers}
      totalCourses={totalCourses}
      session={{ email: session.email }}
      logout={logout}
    />
  );
}


