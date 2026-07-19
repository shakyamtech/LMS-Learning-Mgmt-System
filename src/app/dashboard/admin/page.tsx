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
  let courses = [] as any[];
  
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

  // 4. Fetch all registered Students
  const studentsSnap = await db.collection("users").where("role", "==", "STUDENT").get();
  const students = studentsSnap.docs.map(doc => ({
    id: doc.id,
    name: (doc.data().name as string | undefined) || null,
    email: (doc.data().email as string | undefined) || null,
  }));

  return (
    <AdminDashboardClient
      teachers={teachers}
      courses={courses}
      students={students}
      totalUsers={totalUsers}
      totalCourses={totalCourses}
      session={{ email: session.email }}
      logout={logout}
    />
  );
}


