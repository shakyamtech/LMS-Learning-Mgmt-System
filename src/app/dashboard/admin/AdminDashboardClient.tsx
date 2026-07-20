'use client';

import React, { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import CourseForm from "./CourseForm";
import { approveStudent, rejectStudent, updateUser, deleteUser } from "@/app/actions/auth";
import { saveHomepageConfig } from "@/app/actions/cms";
import { addTransaction, deleteTransaction } from "@/app/actions/accounting";

interface Teacher {
  id: string;
  name: string | null;
  email: string | null;
}

interface Enrollment {
  studentId: string;
  enrolledAt: string;
}

interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  teacherId: string;
  teacher?: {
    name: string | null;
    email: string | null;
  };
  enrollments?: Enrollment[];
}

interface Student {
  id: string;
  name: string | null;
  email: string | null;
  approved: boolean;
}

export interface PlatformUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  approved: boolean;
  createdAt?: string | null;
  phone?: string | null;
  address?: string | null;
  dob?: string | null;
  faculty?: string | null;
  rollNo?: string | null;
  admissionDate?: string | null;
  totalFee?: number | null;
  paidFee?: number | null;
}

export interface TransactionRecord {
  id: string;
  type: "INCOME" | "EXPENSE" | "STUDENT_FEE";
  title: string;
  amount: number;
  category: string;
  paymentMethod: string;
  date: string;
  studentId?: string;
  studentName?: string;
  notes?: string;
  createdAt?: string;
}

interface Session {
  email: string;
}

interface AdminDashboardClientProps {
  teachers: Teacher[];
  courses: Course[];
  students: Student[];
  allUsers?: PlatformUser[];
  initialTransactions?: TransactionRecord[];
  cmsConfig?: Array<{ title: string; subtitle: string; image: string }> | null;
  totalUsers: number;
  totalCourses: number;
  session: Session;
  logout: (formData: FormData) => void;
}

export default function AdminDashboardClient({
  teachers,
  courses,
  students,
  allUsers = [],
  initialTransactions = [],
  cmsConfig,
  totalUsers,
  totalCourses,
  session,
  logout
}: AdminDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "users" | "accounting" | "cms">("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [localStudents, setLocalStudents] = useState<Student[]>(students);
  const [localUsers, setLocalUsers] = useState<PlatformUser[]>(allUsers);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(initialTransactions);

  // User Management State
  const [userRoleFilter, setUserRoleFilter] = useState<"ALL" | "STUDENT" | "TEACHER" | "ADMIN">("ALL");
  const [editingUser, setEditingUser] = useState<PlatformUser | null>(null);
  const [viewingUser, setViewingUser] = useState<PlatformUser | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [userActionError, setUserActionError] = useState<string | null>(null);
  const [isUserPending, startUserTransition] = useTransition();

  // Accounting State
  const [txFilter, setTxFilter] = useState<"ALL" | "STUDENT_FEE" | "INCOME" | "EXPENSE">("ALL");
  const [dateRangeFilter, setDateRangeFilter] = useState<"ALL" | "TODAY" | "THIS_MONTH" | "CUSTOM">("ALL");
  const [selectedCustomDate, setSelectedCustomDate] = useState<string>("");
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [selectedFeeStudentId, setSelectedFeeStudentId] = useState("");
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [txActionError, setTxActionError] = useState<string | null>(null);
  const [isTxPending, startTxTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalUsers(allUsers);
  }, [allUsers]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTransactions(initialTransactions);
  }, [initialTransactions]);
  
  const defaultSlides = [
    {
      title: "Lagankhel IT \n Academy!",
      subtitle: "Experience an academic environment designed to foster critical thinking, global perspectives, and career readiness.",
      image: "/hero_slide_3.png",
    },
    {
      title: "Empowering \n Futures",
      subtitle: "Join a diverse community of learners and educators dedicated to excellence and innovation.",
      image: "/hero_slide_2.png",
    },
    {
      title: "Lead with \n Purpose",
      subtitle: "Discover your passion and develop the skills to make a lasting impact on the world.",
      image: "/hero_slide_1.png",
    }
  ];

  const [cmsSlides, setCmsSlides] = useState(cmsConfig || defaultSlides);
  const [cmsStatus, setCmsStatus] = useState<{ success?: boolean; error?: string } | null>(null);
  const [cmsSaving, setCmsSaving] = useState(false);
  const [activeSlideTab, setActiveSlideTab] = useState(0);

  const [notifications, setNotifications] = useState([
    { id: 1, title: "New student Mahesh Shakya registered", time: "2 minutes ago" },
    { id: 2, title: "Course CS-201 assigned to Teacher Ram", time: "1 hour ago" },
    { id: 3, title: "System Database backup successful", time: "4 hours ago" }
  ]);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const [isMounted, setIsMounted] = useState(false);

  // Sync prop changes if they occur
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalStudents(students);
  }, [students]);

  // Load dismissed notifications from localStorage on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    try {
      const dismissed = localStorage.getItem("dismissedNotifications");
      if (dismissed) {
        const dismissedIds = JSON.parse(dismissed) as number[];
        setNotifications(prev => prev.filter(n => !dismissedIds.includes(n.id)));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  // Close popovers on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
        setShowSettings(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDismissNotification = (id: number) => {
    const updated = notifications.filter(n => n.id !== id);
    setNotifications(updated);
    try {
      const dismissed = localStorage.getItem("dismissedNotifications");
      const dismissedIds = dismissed ? (JSON.parse(dismissed) as number[]) : [];
      if (!dismissedIds.includes(id)) {
        dismissedIds.push(id);
        localStorage.setItem("dismissedNotifications", JSON.stringify(dismissedIds));
      }
    } catch {
      // Ignore localStorage errors
    }
  };

  const handleClearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    setNotifications([]);
    try {
      const dismissed = localStorage.getItem("dismissedNotifications");
      const dismissedIds = dismissed ? (JSON.parse(dismissed) as number[]) : [];
      const combined = Array.from(new Set([...dismissedIds, ...allIds]));
      localStorage.setItem("dismissedNotifications", JSON.stringify(combined));
    } catch {
      // Ignore localStorage errors
    }
  };

  // Clear search query when tab changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchQuery("");
  }, [activeTab]);

  const handleApprove = (studentId: string) => {
    startUserTransition(async () => {
      await approveStudent(studentId);
      setLocalStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, approved: true } : s)));
      setLocalUsers((prev) => prev.map((u) => (u.id === studentId ? { ...u, approved: true } : u)));
    });
  };

  const handleReject = (studentId: string) => {
    if (!confirm("Are you sure you want to reject and remove this student registration?")) return;
    startUserTransition(async () => {
      await rejectStudent(studentId);
      setLocalStudents((prev) => prev.filter((s) => s.id !== studentId));
      setLocalUsers((prev) => prev.filter((u) => u.id !== studentId));
    });
  };

  const initials = session.email.substring(0, 2).toUpperCase();
  const displayName = session.email.split("@")[0];

  // Filter courses based on query
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;

    setUserActionError(null);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const approved = formData.get("approved") === "on";
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const dob = formData.get("dob") as string;
    const faculty = formData.get("faculty") as string;
    const rollNo = formData.get("rollNo") as string;
    const admissionDate = formData.get("admissionDate") as string;
    const totalFeeStr = formData.get("totalFee") as string;
    const paidFeeStr = formData.get("paidFee") as string;

    const totalFee = totalFeeStr !== "" ? parseFloat(totalFeeStr) : undefined;
    const paidFee = paidFeeStr !== "" ? parseFloat(paidFeeStr) : undefined;

    startUserTransition(async () => {
      const res = await updateUser(editingUser.id, {
        name,
        email,
        role,
        approved,
        phone,
        address,
        dob,
        faculty,
        rollNo,
        admissionDate,
        totalFee,
        paidFee
      });
      if (res?.error) {
        setUserActionError(res.error);
      } else {
        const updatedObj: PlatformUser = {
          ...editingUser,
          name,
          email,
          role: role.toUpperCase(),
          approved,
          phone,
          address,
          dob,
          faculty,
          rollNo,
          admissionDate,
          totalFee: totalFee !== undefined ? totalFee : editingUser.totalFee,
          paidFee: paidFee !== undefined ? paidFee : editingUser.paidFee
        };
        setLocalUsers(prev => prev.map(u => u.id === editingUser.id ? updatedObj : u));
        if (viewingUser?.id === editingUser.id) {
          setViewingUser(updatedObj);
        }
        setEditingUser(null);
      }
    });
  };

  const handleConfirmDeleteUser = async (userId: string) => {
    setUserActionError(null);
    startUserTransition(async () => {
      const res = await deleteUser(userId);
      if (res?.error) {
        setUserActionError(res.error);
      } else {
        setLocalUsers(prev => prev.filter(u => u.id !== userId));
        setDeletingUserId(null);
      }
    });
  };

  const filteredUsers = localUsers.filter(user => {
    const matchesSearch = (user.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (user.email || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = userRoleFilter === "ALL" || user.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const pendingUsersCount = localUsers.filter(u => !u.approved).length;
  const studentCount = localUsers.filter(u => u.role === "STUDENT").length;
  const teacherCount = localUsers.filter(u => u.role === "TEACHER").length;
  const adminCount = localUsers.filter(u => u.role === "ADMIN").length;

  const handleSaveCollectFee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTxActionError(null);
    const formData = new FormData(e.currentTarget);
    const studentId = formData.get("studentId") as string;
    const amountStr = formData.get("amount") as string;
    const feeType = formData.get("feeType") as string;
    const totalFeeStr = formData.get("totalFee") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const date = formData.get("date") as string;
    const notes = formData.get("notes") as string;

    const studentObj = localUsers.find(u => u.id === studentId);
    if (!studentId || !studentObj) {
      setTxActionError("Please select a valid student.");
      return;
    }

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      setTxActionError("Please enter a valid positive payment amount.");
      return;
    }

    const customTotalFee = totalFeeStr !== "" && !isNaN(parseFloat(totalFeeStr)) ? parseFloat(totalFeeStr) : undefined;
    const title = `Student Fee (${feeType || "Fee Payment"}): ${studentObj.name || studentObj.email}`;

    startTxTransition(async () => {
      const res = await addTransaction({
        type: "STUDENT_FEE",
        title,
        amount,
        category: `Student Fee (${feeType || "General"})`,
        paymentMethod,
        date: date || new Date().toISOString().split("T")[0],
        studentId,
        studentName: studentObj.name || studentObj.email || undefined,
        notes,
        setTotalFee: customTotalFee
      });

      if (res?.error) {
        setTxActionError(res.error);
      } else {
        const newRecord: TransactionRecord = {
          id: res.id || Date.now().toString(),
          type: "STUDENT_FEE",
          title,
          amount,
          category: `Student Fee (${feeType || "General"})`,
          paymentMethod,
          date: date || new Date().toISOString().split("T")[0],
          studentId,
          studentName: studentObj.name || studentObj.email || undefined,
          notes
        };

        setTransactions(prev => [newRecord, ...prev]);

        // Update student paidFee & totalFee in local users state
        setLocalUsers(prev => prev.map(u => {
          if (u.id === studentId) {
            const currentPaid = u.paidFee || 0;
            const updatedUser = {
              ...u,
              paidFee: currentPaid + amount,
              totalFee: customTotalFee !== undefined ? customTotalFee : u.totalFee
            };
            if (viewingUser?.id === studentId) {
              setViewingUser(updatedUser);
            }
            return updatedUser;
          }
          return u;
        }));

        setShowFeeModal(false);
        setSelectedFeeStudentId("");
      }
    });
  };

  const handleSaveGeneralIncome = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTxActionError(null);
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const amountStr = formData.get("amount") as string;
    const category = formData.get("category") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const date = formData.get("date") as string;
    const notes = formData.get("notes") as string;

    const amount = parseFloat(amountStr);
    if (!title || isNaN(amount) || amount <= 0) {
      setTxActionError("Please enter a valid title and positive income amount.");
      return;
    }

    startTxTransition(async () => {
      const res = await addTransaction({
        type: "INCOME",
        title,
        amount,
        category: category || "General Income",
        paymentMethod,
        date: date || new Date().toISOString().split("T")[0],
        notes
      });

      if (res?.error) {
        setTxActionError(res.error);
      } else {
        const newRecord: TransactionRecord = {
          id: res.id || Date.now().toString(),
          type: "INCOME",
          title,
          amount,
          category: category || "General Income",
          paymentMethod,
          date: date || new Date().toISOString().split("T")[0],
          notes
        };

        setTransactions(prev => [newRecord, ...prev]);
        setShowIncomeModal(false);
      }
    });
  };

  const handleSaveExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTxActionError(null);
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const amountStr = formData.get("amount") as string;
    const category = formData.get("category") as string;
    const paymentMethod = formData.get("paymentMethod") as string;
    const date = formData.get("date") as string;
    const notes = formData.get("notes") as string;

    const amount = parseFloat(amountStr);
    if (!title || isNaN(amount) || amount <= 0) {
      setTxActionError("Please enter a valid title and positive expense amount.");
      return;
    }

    startTxTransition(async () => {
      const res = await addTransaction({
        type: "EXPENSE",
        title,
        amount,
        category: category || "General Expense",
        paymentMethod,
        date: date || new Date().toISOString().split("T")[0],
        notes
      });

      if (res?.error) {
        setTxActionError(res.error);
      } else {
        const newRecord: TransactionRecord = {
          id: res.id || Date.now().toString(),
          type: "EXPENSE",
          title,
          amount,
          category: category || "General Expense",
          paymentMethod,
          date: date || new Date().toISOString().split("T")[0],
          notes
        };

        setTransactions(prev => [newRecord, ...prev]);
        setShowExpenseModal(false);
      }
    });
  };

  const handleDeleteTx = async (tx: TransactionRecord) => {
    if (!confirm(`Are you sure you want to delete transaction "${tx.title}" (Rs. ${tx.amount})?`)) return;
    setTxActionError(null);

    startTxTransition(async () => {
      const res = await deleteTransaction(tx.id);
      if (res?.error) {
        setTxActionError(res.error);
      } else {
        setTransactions(prev => prev.filter(t => t.id !== tx.id));
        if (tx.type === "STUDENT_FEE" && tx.studentId) {
          setLocalUsers(prev => prev.map(u => {
            if (u.id === tx.studentId) {
              const currentPaid = u.paidFee || 0;
              const updatedUser = { ...u, paidFee: Math.max(0, currentPaid - tx.amount) };
              if (viewingUser?.id === tx.studentId) {
                setViewingUser(updatedUser);
              }
              return updatedUser;
            }
            return u;
          }));
        }
      }
    });
  };

  // Financial Calculations
  const totalIncome = transactions
    .filter(t => t.type === "INCOME" || t.type === "STUDENT_FEE")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalExpense = transactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const totalStudentFeesCollected = transactions
    .filter(t => t.type === "STUDENT_FEE")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const netBalance = totalIncome - totalExpense;

  const todayStr = new Date().toISOString().split("T")[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const filteredTransactions = transactions.filter(t => {
    const matchesCategory = txFilter === "ALL" || t.type === txFilter;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.studentName && t.studentName.toLowerCase().includes(searchQuery.toLowerCase()));

    let matchesDate = true;
    if (dateRangeFilter === "TODAY") {
      matchesDate = t.date === todayStr;
    } else if (dateRangeFilter === "THIS_MONTH") {
      matchesDate = t.date.startsWith(currentMonthStr);
    } else if (dateRangeFilter === "CUSTOM" && selectedCustomDate) {
      matchesDate = t.date === selectedCustomDate;
    }

    return matchesCategory && matchesSearch && matchesDate;
  });

  const filteredPeriodIncome = filteredTransactions
    .filter(t => t.type === "INCOME" || t.type === "STUDENT_FEE")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const filteredPeriodExpense = filteredTransactions
    .filter(t => t.type === "EXPENSE")
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const filteredPeriodNet = filteredPeriodIncome - filteredPeriodExpense;

  const mockSettings = [
    { id: 1, label: "⚙️ System Configuration" },
    { id: 2, label: "🔑 Security & API Keys" },
    { id: 3, label: "📊 Data Export & Analytics" }
  ];

  return (
    <div className="admin-layout">
      {/* Sidebar Navigation */}
      <aside className="admin-sidebar">
        <Link href="/" className="admin-sidebar-brand">
          <img src="/logo.png" alt="Lagankhel IT Academy Logo" />
          <span className="admin-sidebar-brand-name">LITA Admin</span>
        </Link>

        <ul className="admin-sidebar-menu">
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("dashboard");
              }}
              className={`admin-sidebar-link ${activeTab === "dashboard" ? "active" : ""}`}
            >
              <span>📊</span> Dashboard
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("users");
              }}
              className={`admin-sidebar-link ${activeTab === "users" ? "active" : ""}`}
              style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <span>👥</span> Users Management
              </div>
              {pendingUsersCount > 0 && (
                <span style={{
                  backgroundColor: "#ef4444",
                  color: "#ffffff",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "0.15rem 0.55rem",
                  borderRadius: "9999px",
                  boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
                  lineHeight: "1"
                }}>
                  {pendingUsersCount}
                </span>
              )}
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("accounting");
              }}
              className={`admin-sidebar-link ${activeTab === "accounting" ? "active" : ""}`}
            >
              <span>💰</span> Accounting & Finance
            </a>
          </li>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setActiveTab("cms");
              }}
              className={`admin-sidebar-link ${activeTab === "cms" ? "active" : ""}`}
            >
              <span>⚙️</span> Manage Site (CMS)
            </a>
          </li>
        </ul>

        <div className="admin-sidebar-footer">
          <div className="admin-sidebar-profile">
            <div className="admin-sidebar-avatar">{initials}</div>
            <div className="admin-sidebar-profile-info">
              <span className="admin-sidebar-profile-name">{displayName}</span>
              <span className="admin-sidebar-profile-email">{session.email}</span>
            </div>
          </div>
          <form action={logout}>
            <button className="admin-sidebar-logout-btn" type="submit">
              🚪 Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main content workspace */}
      <div className="admin-main">
        {/* Top Navbar */}
        <header className="admin-navbar">
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{
              fontSize: "0.7rem",
              backgroundColor: "rgba(27, 94, 32, 0.08)",
              color: "var(--college-primary)",
              fontWeight: 700,
              padding: "0.15rem 0.5rem",
              borderRadius: "var(--radius-full)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              width: "fit-content",
              marginBottom: "0.25rem"
            }}>
              ⚡ Admin Control Panel
            </span>
            <h1 className="admin-navbar-title">
              {activeTab === "dashboard" ? "LMS Root Administrator" : "Registered Students"}
            </h1>
          </div>

          <div className="admin-navbar-right" style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
            {/* Search Input */}
            <div className="admin-navbar-search" style={{
              display: "flex",
              alignItems: "center",
              backgroundColor: "#f3f4f6",
              border: "1px solid #e5e7eb",
              borderRadius: "var(--radius-full)",
              padding: "0.4rem 1rem",
              width: "220px",
              gap: "0.5rem"
            }}>
              <input
                type="text"
                placeholder={activeTab === "dashboard" ? "Search courses..." : "Search students..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  width: "100%",
                  fontSize: "0.85rem",
                  color: "#374151"
                }}
              />
              <span style={{ fontSize: "0.9rem", color: "#9ca3af" }}>🔍</span>
            </div>

            {/* Notification Dropdown Container */}
            <div className="dropdown-container" ref={notificationsRef} style={{ position: "relative" }}>
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowSettings(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.35rem",
                  cursor: "pointer",
                  padding: "0.25rem",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Notifications"
              >
                🔔
              </button>
              {isMounted && notifications.length > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-2px",
                  right: "-2px",
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#ef4444",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none"
                }}>
                  {notifications.length}
                </span>
              )}

              {showNotifications && (
                <div className="dropdown-popover">
                  <div className="dropdown-popover-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>System Notifications</span>
                    {isMounted && notifications.length > 0 && (
                      <button
                        onClick={handleClearAllNotifications}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: 0
                        }}
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  {!isMounted || notifications.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "1.5rem 1rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
                      🎉 No new notifications!
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <div key={notif.id} className="dropdown-popover-item" style={{
                        display: "flex",
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem"
                      }}>
                        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                          <span className="dropdown-popover-item-title">{notif.title}</span>
                          <span className="dropdown-popover-item-time">🕒 {notif.time}</span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDismissNotification(notif.id);
                          }}
                          style={{
                            background: "#f3f4f6",
                            border: "none",
                            color: "#4b5563",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            lineHeight: 1,
                            transition: "all 0.2s ease",
                            flexShrink: 0
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#fee2e2";
                            e.currentTarget.style.color = "#ef4444";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                            e.currentTarget.style.color = "#4b5563";
                          }}
                          title="Dismiss"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Settings Dropdown Container */}
            <div className="dropdown-container" ref={settingsRef}>
              <button
                onClick={() => {
                  setShowSettings(!showSettings);
                  setShowNotifications(false);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.35rem",
                  cursor: "pointer",
                  padding: "0.25rem",
                  display: "flex",
                  alignItems: "center"
                }}
                title="Settings"
              >
                ⚙️
              </button>

              {showSettings && (
                <div className="dropdown-popover">
                  <div className="dropdown-popover-header">Quick System Settings</div>
                  {mockSettings.map((setting) => (
                    <div
                      key={setting.id}
                      className="dropdown-popover-item"
                      onClick={() => alert(`Redirecting to: ${setting.label}`)}
                    >
                      <span className="dropdown-popover-item-title">{setting.label}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Workspace Area */}
        <main className="admin-content bg-cream-pattern animate-fade-in" style={{ flexGrow: 1 }}>
          
          {activeTab === "dashboard" ? (
            /* ──── DASHBOARD TAB VIEW ──── */
            <>
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.25rem", color: "var(--college-primary)", margin: "0 0 0.5rem 0" }}>LMS System Administration</h2>
                <p className="text-muted">Monitor LMS performance, manage platform roles, audit security parameters, and toggle globally-shared resources.</p>
              </div>

              {/* Global System Stats (Original Cards) */}
              <div className="grid-cols-3" style={{ marginBottom: "2.5rem" }}>
                <div className="card" style={{ backgroundColor: "white" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>⚙️</div>
                  <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "var(--college-text)" }}>System Health</h3>
                  <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--success)" }}>99.98%</p>
                  <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>All core services active and optimal</p>
                </div>
                <div className="card" style={{ backgroundColor: "white", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>👥</div>
                    <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "var(--college-text)" }}>Platform Users</h3>
                    <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--college-primary)" }}>{totalUsers}</p>
                  </div>
                  <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: "0.75rem", backgroundColor: "rgba(212, 175, 55, 0.15)", color: "#92400e", padding: "0.2rem 0.55rem", borderRadius: "9999px", fontWeight: 700 }}>
                      🎓 {studentCount} {studentCount === 1 ? "Student" : "Students"}
                    </span>
                    <span style={{ fontSize: "0.75rem", backgroundColor: "rgba(79, 70, 229, 0.1)", color: "#4f46e5", padding: "0.2rem 0.55rem", borderRadius: "9999px", fontWeight: 700 }}>
                      👨‍🏫 {teacherCount} {teacherCount === 1 ? "Teacher" : "Teachers"}
                    </span>
                    <span style={{ fontSize: "0.75rem", backgroundColor: "rgba(27, 94, 32, 0.1)", color: "var(--college-primary)", padding: "0.2rem 0.55rem", borderRadius: "9999px", fontWeight: 700 }}>
                      ⚡ {adminCount} {adminCount === 1 ? "Admin" : "Admins"}
                    </span>
                  </div>
                </div>
                <div className="card" style={{ backgroundColor: "white" }}>
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📚</div>
                  <h3 style={{ margin: "0 0 0.25rem 0", fontSize: "1.1rem", color: "var(--college-text)" }}>Total Courses</h3>
                  <p className="text-h2" style={{ margin: "0.25rem 0", color: "var(--college-primary)" }}>{totalCourses}</p>
                  <p className="text-muted" style={{ margin: 0, fontSize: "0.85rem" }}>Active teaching courses</p>
                </div>
              </div>

              {/* System & Access Grid (Original Layout and Forms) */}
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
                {/* Active Courses Table */}
                <div className="card" style={{ height: "fit-content", backgroundColor: "white" }}>
                  <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--college-primary)", margin: "0 0 1.5rem 0" }}>
                    Active Platform Courses
                    {searchQuery && <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>({filteredCourses.length} found)</span>}
                  </h3>
                  
                  {filteredCourses.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "3rem 1rem", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
                      <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📖</div>
                      <h4 style={{ margin: 0, color: "var(--text-muted)" }}>
                        {searchQuery ? "No matching courses found" : "No Courses Available"}
                      </h4>
                      <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                        {searchQuery ? "Try altering your search keywords." : "Use the panel to the right to register a new course."}
                      </p>
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      {filteredCourses.map((course) => (
                        <div key={course.id} style={{
                          padding: "1.25rem",
                          border: "1px solid var(--border)",
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "var(--surface-hover)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center"
                        }}>
                          <div>
                            <span style={{ fontSize: "0.75rem", color: "var(--college-primary)", fontWeight: 700, backgroundColor: "rgba(27, 94, 32, 0.08)", padding: "0.15rem 0.5rem", borderRadius: "var(--radius-sm)" }}>
                              {course.code}
                            </span>
                            <h4 style={{ margin: "0.5rem 0 0.15rem 0", fontSize: "1rem", color: "var(--college-text)" }}>{course.title}</h4>
                            <p className="text-muted" style={{ margin: 0, fontSize: "0.8rem", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                              {course.description}
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                              👨‍🏫 {course.teacher?.name || course.teacher?.email?.split("@")[0]}
                            </span>
                            <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: "0.15rem" }}>
                              👥 {course.enrollments?.length || 0} Enrolled
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Course Creation Form */}
                <CourseForm teachers={teachers} />
              </div>
            </>
          ) : activeTab === "users" ? (
            /* ──── USERS MANAGEMENT TAB VIEW ──── */
            <>
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.25rem", color: "var(--college-primary)", margin: "0 0 0.5rem 0" }}>Platform User Management</h2>
                <p className="text-muted">Manage all registered accounts (Students, Instructors, Administrators), modify roles, and handle account access.</p>
              </div>

              {/* User Role Filter Bar */}
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
                {(["ALL", "STUDENT", "TEACHER", "ADMIN"] as const).map((roleKey) => (
                  <button
                    key={roleKey}
                    onClick={() => setUserRoleFilter(roleKey)}
                    style={{
                      padding: "0.5rem 1.25rem",
                      borderRadius: "var(--radius-md)",
                      border: userRoleFilter === roleKey ? "1px solid var(--college-primary)" : "1px solid var(--border)",
                      backgroundColor: userRoleFilter === roleKey ? "var(--college-primary)" : "white",
                      color: userRoleFilter === roleKey ? "white" : "var(--college-text)",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)"
                    }}
                  >
                    {roleKey === "ALL" ? `All Users (${localUsers.length})` : roleKey === "STUDENT" ? "Students" : roleKey === "TEACHER" ? "Teachers" : "Admins"}
                  </button>
                ))}
              </div>

              <div className="card" style={{ backgroundColor: "white", padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--college-primary)", margin: 0 }}>
                    Registered Platform Users
                    {searchQuery && <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>({filteredUsers.length} found)</span>}
                  </h3>
                </div>

                {filteredUsers.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "4rem 1rem", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>👤</div>
                    <h4 style={{ margin: 0, color: "var(--text-muted)" }}>
                      {searchQuery ? "No matching users found" : "No Users Registered"}
                    </h4>
                    <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                      {searchQuery ? "Check spelling or search terms." : "User records will appear here as users register."}
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--college-primary)" }}>
                          <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>User Info</th>
                          <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Role</th>
                          <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Status</th>
                          <th style={{ padding: "0.85rem 1rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => {
                          const initials = (user.name || user.email || "US").substring(0, 2).toUpperCase();
                          const roleBadgeStyle = user.role === "ADMIN"
                            ? { bg: "rgba(27, 94, 32, 0.1)", color: "var(--college-primary)", label: "⚡ Admin" }
                            : user.role === "TEACHER"
                            ? { bg: "rgba(79, 70, 229, 0.1)", color: "#4f46e5", label: "👨‍🏫 Teacher" }
                            : { bg: "rgba(212, 175, 55, 0.15)", color: "#92400e", label: "🎓 Student" };

                          return (
                            <tr key={user.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                              <td style={{ padding: "1rem" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                                  <div style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    backgroundColor: roleBadgeStyle.bg,
                                    color: roleBadgeStyle.color,
                                    fontWeight: 700,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.95rem"
                                  }}>
                                    {initials}
                                  </div>
                                  <div>
                                    <div style={{ fontWeight: 600, color: "var(--college-text)" }}>{user.name || "Unnamed User"}</div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{user.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: "1rem" }}>
                                <span style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  backgroundColor: roleBadgeStyle.bg,
                                  color: roleBadgeStyle.color,
                                  padding: "0.25rem 0.65rem",
                                  borderRadius: "var(--radius-full)"
                                }}>
                                  {roleBadgeStyle.label}
                                </span>
                              </td>
                              <td style={{ padding: "1rem" }}>
                                <span style={{
                                  fontSize: "0.75rem",
                                  fontWeight: 700,
                                  backgroundColor: user.approved ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
                                  color: user.approved ? "var(--success)" : "var(--warning)",
                                  padding: "0.25rem 0.65rem",
                                  borderRadius: "var(--radius-full)"
                                }}>
                                  {user.approved ? "✅ Approved" : "⏳ Pending"}
                                </span>
                              </td>
                              <td style={{ padding: "1rem", textAlign: "right" }}>
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.5rem" }}>
                                  {!user.approved && (
                                    <button
                                      onClick={() => handleApprove(user.id)}
                                      style={{
                                        padding: "0.4rem 0.85rem",
                                        borderRadius: "var(--radius-md)",
                                        border: "1px solid rgba(34, 197, 94, 0.4)",
                                        backgroundColor: "rgba(34, 197, 94, 0.1)",
                                        color: "var(--success)",
                                        fontSize: "0.8rem",
                                        fontWeight: 700,
                                        cursor: "pointer",
                                        transition: "all 0.2s"
                                      }}
                                    >
                                      ✅ Approve
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setViewingUser(user)}
                                    style={{
                                      padding: "0.4rem 0.85rem",
                                      borderRadius: "var(--radius-md)",
                                      border: "1px solid #d1d5db",
                                      backgroundColor: "#ffffff",
                                      color: "#374151",
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      transition: "all 0.2s"
                                    }}
                                  >
                                    👁️ Details
                                  </button>
                                  <button
                                    onClick={() => setEditingUser(user)}
                                    style={{
                                      padding: "0.4rem 0.85rem",
                                      borderRadius: "var(--radius-md)",
                                      border: "1px solid #d1d5db",
                                      backgroundColor: "#ffffff",
                                      color: "#374151",
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      transition: "all 0.2s"
                                    }}
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    onClick={() => setDeletingUserId(user.id)}
                                    style={{
                                      padding: "0.4rem 0.85rem",
                                      borderRadius: "var(--radius-md)",
                                      border: "1px solid rgba(239, 68, 68, 0.3)",
                                      backgroundColor: "rgba(239, 68, 68, 0.05)",
                                      color: "var(--error)",
                                      fontSize: "0.8rem",
                                      fontWeight: 600,
                                      cursor: "pointer",
                                      transition: "all 0.2s"
                                    }}
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : activeTab === "accounting" ? (
            /* ──── ACCOUNTING & FINANCE TAB VIEW ──── */
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.25rem", color: "var(--college-primary)", margin: "0 0 0.5rem 0" }}>Accounting & Financial Ledger</h2>
                  <p className="text-muted" style={{ margin: 0 }}>Track academy income, collect student fees, record operational expenses, and monitor net cash balance.</p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={() => {
                      setTxActionError(null);
                      setShowFeeModal(true);
                    }}
                    style={{
                      backgroundColor: "var(--college-primary)",
                      color: "#ffffff",
                      border: "none",
                      padding: "0.65rem 1.25rem",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      boxShadow: "0 2px 8px rgba(27, 94, 32, 0.2)"
                    }}
                  >
                    <span>➕</span> Collect Student Fee
                  </button>

                  <button
                    onClick={() => {
                      setTxActionError(null);
                      setShowIncomeModal(true);
                    }}
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#0284c7",
                      border: "1px solid rgba(2, 132, 199, 0.4)",
                      padding: "0.65rem 1.25rem",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <span>📈</span> Record General Income
                  </button>

                  <button
                    onClick={() => {
                      setTxActionError(null);
                      setShowExpenseModal(true);
                    }}
                    style={{
                      backgroundColor: "#ffffff",
                      color: "#ef4444",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      padding: "0.65rem 1.25rem",
                      borderRadius: "var(--radius-md)",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem"
                    }}
                  >
                    <span>📉</span> Record Expense
                  </button>
                </div>
              </div>

              {/* Financial Metric Overview Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "2rem" }}>
                {/* Total Income */}
                <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" }}>TOTAL INCOME</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--college-primary)", marginTop: "0.4rem" }}>
                    Rs. {totalIncome.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>All fee payments & general revenues</div>
                </div>

                {/* Student Fees Collected */}
                <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--success)", textTransform: "uppercase", letterSpacing: "0.5px" }}>STUDENT FEES COLLECTED</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--success)", marginTop: "0.4rem" }}>
                    Rs. {totalStudentFeesCollected.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>Direct student fee receipts</div>
                </div>

                {/* Total Expense */}
                <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.5px" }}>TOTAL EXPENSES</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "#ef4444", marginTop: "0.4rem" }}>
                    Rs. {totalExpense.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>Salaries, rent, utilities & supplies</div>
                </div>

                {/* Net Balance */}
                <div className="card" style={{ backgroundColor: "#ffffff", padding: "1.25rem" }}>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>NET CASH BALANCE</div>
                  <div style={{ fontSize: "1.6rem", fontWeight: 700, color: netBalance >= 0 ? "var(--college-primary)" : "#ef4444", marginTop: "0.4rem" }}>
                    Rs. {netBalance.toLocaleString()}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>Net liquid balance</div>
                </div>
              </div>

              {/* Category & Date Filter Controls */}
              <div style={{
                backgroundColor: "#ffffff",
                padding: "1.25rem",
                borderRadius: "var(--radius-md)",
                border: "1px solid #e5e7eb",
                marginBottom: "1.5rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem"
              }}>
                {/* Row 1: Category Tabs */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--college-primary)" }}>
                    🏷️ Category Filter:
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                    {(["ALL", "STUDENT_FEE", "INCOME", "EXPENSE"] as const).map((key) => (
                      <button
                        key={key}
                        onClick={() => setTxFilter(key)}
                        style={{
                          padding: "0.45rem 1rem",
                          borderRadius: "var(--radius-md)",
                          border: txFilter === key ? "1px solid var(--college-primary)" : "1px solid var(--border)",
                          backgroundColor: txFilter === key ? "var(--college-primary)" : "white",
                          color: txFilter === key ? "white" : "var(--college-text)",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          transition: "all var(--transition-fast)"
                        }}
                      >
                        {key === "ALL" ? `All Categories (${transactions.length})` : key === "STUDENT_FEE" ? "Student Fees" : key === "INCOME" ? "General Income" : "Expenses"}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: "1px dashed #e5e7eb" }} />

                {/* Row 2: Date & Calendar Toolbar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--college-primary)" }}>
                      📅 Date / Calendar Filter:
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <button
                      onClick={() => {
                        setDateRangeFilter("ALL");
                        setSelectedCustomDate("");
                      }}
                      style={{
                        padding: "0.45rem 0.9rem",
                        borderRadius: "var(--radius-md)",
                        border: dateRangeFilter === "ALL" ? "1px solid var(--college-primary)" : "1px solid var(--border)",
                        backgroundColor: dateRangeFilter === "ALL" ? "rgba(27, 94, 32, 0.1)" : "white",
                        color: dateRangeFilter === "ALL" ? "var(--college-primary)" : "#4b5563",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        cursor: "pointer"
                      }}
                    >
                      All Time
                    </button>

                    <button
                      onClick={() => {
                        setDateRangeFilter("TODAY");
                        setSelectedCustomDate(todayStr);
                      }}
                      style={{
                        padding: "0.45rem 0.9rem",
                        borderRadius: "var(--radius-md)",
                        border: dateRangeFilter === "TODAY" ? "1px solid var(--college-primary)" : "1px solid var(--border)",
                        backgroundColor: dateRangeFilter === "TODAY" ? "rgba(27, 94, 32, 0.1)" : "white",
                        color: dateRangeFilter === "TODAY" ? "var(--college-primary)" : "#4b5563",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        cursor: "pointer"
                      }}
                    >
                      📅 Today
                    </button>

                    <button
                      onClick={() => {
                        setDateRangeFilter("THIS_MONTH");
                        setSelectedCustomDate("");
                      }}
                      style={{
                        padding: "0.45rem 0.9rem",
                        borderRadius: "var(--radius-md)",
                        border: dateRangeFilter === "THIS_MONTH" ? "1px solid var(--college-primary)" : "1px solid var(--border)",
                        backgroundColor: dateRangeFilter === "THIS_MONTH" ? "rgba(27, 94, 32, 0.1)" : "white",
                        color: dateRangeFilter === "THIS_MONTH" ? "var(--college-primary)" : "#4b5563",
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        cursor: "pointer"
                      }}
                    >
                      🗓️ This Month
                    </button>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                      <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: 600 }}>Pick Date:</span>
                      <input
                        type="date"
                        value={dateRangeFilter === "TODAY" ? todayStr : selectedCustomDate}
                        onChange={(e) => {
                          if (e.target.value) {
                            setSelectedCustomDate(e.target.value);
                            setDateRangeFilter("CUSTOM");
                          } else {
                            setDateRangeFilter("ALL");
                          }
                        }}
                        style={{
                          padding: "0.35rem 0.65rem",
                          borderRadius: "var(--radius-md)",
                          border: "1px solid #d1d5db",
                          fontSize: "0.8rem",
                          backgroundColor: "#ffffff",
                          outline: "none"
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Filtered Date Period Banner */}
                {dateRangeFilter !== "ALL" && (
                  <div style={{
                    backgroundColor: "rgba(27, 94, 32, 0.06)",
                    border: "1px solid rgba(27, 94, 32, 0.2)",
                    borderRadius: "var(--radius-md)",
                    padding: "0.75rem 1rem",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "0.5rem"
                  }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--college-primary)" }}>
                      📆 Filtered Period ({dateRangeFilter === "TODAY" ? `Today: ${todayStr}` : dateRangeFilter === "THIS_MONTH" ? `This Month: ${currentMonthStr}` : `Date: ${selectedCustomDate}`}):
                      <span style={{ marginLeft: "0.5rem", fontWeight: 600, color: "#374151" }}>{filteredTransactions.length} Transactions</span>
                    </div>

                    <div style={{ display: "flex", gap: "1.25rem", fontSize: "0.85rem", fontWeight: 700 }}>
                      <span style={{ color: "var(--success)" }}>Income: +Rs. {filteredPeriodIncome.toLocaleString()}</span>
                      <span style={{ color: "#ef4444" }}>Expenses: -Rs. {filteredPeriodExpense.toLocaleString()}</span>
                      <span style={{ color: filteredPeriodNet >= 0 ? "var(--college-primary)" : "#ef4444" }}>
                        Net Flow: Rs. {filteredPeriodNet.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Transactions Ledger Table */}
              <div className="card" style={{ backgroundColor: "white", padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--college-primary)", margin: 0 }}>
                    Financial Audit Ledger
                    {searchQuery && <span style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>({filteredTransactions.length} found)</span>}
                  </h3>
                </div>

                {filteredTransactions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "4rem 1rem", border: "1px dashed var(--border)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📜</div>
                    <h4 style={{ margin: 0, color: "var(--text-muted)" }}>
                      {searchQuery ? "No matching transactions found" : "No Financial Transactions Logged"}
                    </h4>
                    <p className="text-muted" style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem" }}>
                      {searchQuery ? "Check spelling or search terms." : "Use 'Collect Student Fee' or 'Record Expense' to record entries."}
                    </p>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                      <thead>
                        <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--college-primary)" }}>
                          <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Date</th>
                          <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Description</th>
                          <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Type / Category</th>
                          <th style={{ padding: "0.85rem 1rem", fontWeight: 700 }}>Method</th>
                          <th style={{ padding: "0.85rem 1rem", fontWeight: 700, textAlign: "right" }}>Amount</th>
                          <th style={{ padding: "0.85rem 1rem", fontWeight: 700, textAlign: "right" }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTransactions.map((tx) => {
                          const isIncome = tx.type === "INCOME" || tx.type === "STUDENT_FEE";
                          const typeBadge = tx.type === "STUDENT_FEE"
                            ? { bg: "rgba(34, 197, 94, 0.1)", color: "#15803d", label: "🎓 Student Fee" }
                            : tx.type === "INCOME"
                            ? { bg: "rgba(14, 165, 233, 0.1)", color: "#0284c7", label: "📈 Income" }
                            : { bg: "rgba(239, 68, 68, 0.1)", color: "#b91c1c", label: "📉 Expense" };

                          return (
                            <tr key={tx.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                              <td style={{ padding: "1rem", whiteSpace: "nowrap", color: "#4b5563", fontSize: "0.85rem" }}>
                                {tx.date}
                              </td>
                              <td style={{ padding: "1rem" }}>
                                <div style={{ fontWeight: 600, color: "var(--college-text)" }}>{tx.title}</div>
                                {tx.notes && <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{tx.notes}</div>}
                              </td>
                              <td style={{ padding: "1rem" }}>
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem", alignItems: "flex-start" }}>
                                  <span style={{
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    backgroundColor: typeBadge.bg,
                                    color: typeBadge.color,
                                    padding: "0.15rem 0.55rem",
                                    borderRadius: "var(--radius-full)"
                                  }}>
                                    {typeBadge.label}
                                  </span>
                                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>{tx.category}</span>
                                </div>
                              </td>
                              <td style={{ padding: "1rem" }}>
                                <span style={{ fontSize: "0.8rem", backgroundColor: "#f3f4f6", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600, color: "#374151" }}>
                                  💳 {tx.paymentMethod}
                                </span>
                              </td>
                              <td style={{ padding: "1rem", textAlign: "right", fontWeight: 700, fontSize: "0.95rem", color: isIncome ? "var(--success)" : "#ef4444" }}>
                                {isIncome ? "+" : "-"} Rs. {(tx.amount || 0).toLocaleString()}
                              </td>
                              <td style={{ padding: "1rem", textAlign: "right" }}>
                                <button
                                  onClick={() => handleDeleteTx(tx)}
                                  disabled={isTxPending}
                                  style={{
                                    padding: "0.35rem 0.75rem",
                                    borderRadius: "var(--radius-md)",
                                    border: "1px solid rgba(239, 68, 68, 0.3)",
                                    backgroundColor: "rgba(239, 68, 68, 0.05)",
                                    color: "var(--error)",
                                    fontSize: "0.75rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                  }}
                                >
                                  🗑️ Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ──── CMS TAB VIEW ──── */
            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontFamily: "Playfair Display, serif", fontSize: "2.25rem", color: "var(--college-primary)", margin: "0 0 0.5rem 0" }}>Manage Site Settings (CMS)</h2>
                <p className="text-muted">Configure dynamic landing page aspects including Hero Section sliders and images.</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                
                {/* 1. HERO SLIDER SETTINGS PANEL */}
                <div className="card" style={{ backgroundColor: "white", padding: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                    <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--college-primary)", margin: 0 }}>
                      ✨ Homepage Hero Slider
                    </h3>
                    
                    {/* Compact Slide Tab Buttons */}
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      {[0, 1, 2].map((idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setActiveSlideTab(idx);
                            setCmsStatus(null);
                          }}
                          style={{
                            padding: "0.4rem 1rem",
                            borderRadius: "var(--radius-full)",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            border: activeSlideTab === idx ? "2px solid var(--college-primary)" : "1px solid #d1d5db",
                            backgroundColor: activeSlideTab === idx ? "var(--college-primary)" : "transparent",
                            color: activeSlideTab === idx ? "white" : "#4b5563"
                          }}
                        >
                          Slide {idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>

                  {cmsStatus?.success && (
                    <div style={{ padding: "1rem", backgroundColor: "#d1fae5", border: "1px solid #10b981", borderRadius: "var(--radius-md)", color: "#065f46", fontWeight: 600, marginBottom: "1.5rem" }}>
                      ✓ Homepage hero section configuration updated successfully!
                    </div>
                  )}

                  {cmsStatus?.error && (
                    <div style={{ padding: "1rem", backgroundColor: "#fee2e2", border: "1px solid #ef4444", borderRadius: "var(--radius-md)", color: "#991b1b", fontWeight: 600, marginBottom: "1.5rem" }}>
                      ⚠ {cmsStatus.error}
                    </div>
                  )}

                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setCmsSaving(true);
                    setCmsStatus(null);
                    const res = await saveHomepageConfig(cmsSlides);
                    setCmsSaving(false);
                    if (res?.success) {
                      setCmsStatus({ success: true });
                    } else {
                      setCmsStatus({ error: res?.error || "Failed to save settings." });
                    }
                  }}>
                    {/* Render active slide form fields */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "2rem" }}>
                      {/* Inputs Column */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                        <div>
                          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                            Title (Use \n for line breaks)
                          </label>
                          <input
                            type="text"
                            value={cmsSlides[activeSlideTab]?.title || ""}
                            onChange={(e) => {
                              const updated = [...cmsSlides];
                              updated[activeSlideTab] = { ...updated[activeSlideTab], title: e.target.value };
                              setCmsSlides(updated);
                            }}
                            required
                            style={{
                              width: "100%",
                              padding: "0.6rem 0.85rem",
                              borderRadius: "var(--radius-md)",
                              border: "1px solid #d1d5db",
                              outline: "none",
                              fontSize: "0.9rem"
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                            Subtitle
                          </label>
                          <textarea
                            value={cmsSlides[activeSlideTab]?.subtitle || ""}
                            onChange={(e) => {
                              const updated = [...cmsSlides];
                              updated[activeSlideTab] = { ...updated[activeSlideTab], subtitle: e.target.value };
                              setCmsSlides(updated);
                            }}
                            required
                            rows={3}
                            style={{
                              width: "100%",
                              padding: "0.6rem 0.85rem",
                              borderRadius: "var(--radius-md)",
                              border: "1px solid #d1d5db",
                              outline: "none",
                              fontSize: "0.9rem",
                              resize: "vertical",
                              fontFamily: "inherit"
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                            Image Path / URL
                          </label>
                          <div style={{ display: "flex", gap: "0.5rem" }}>
                            <input
                              type="text"
                              value={cmsSlides[activeSlideTab]?.image || ""}
                              onChange={(e) => {
                                const updated = [...cmsSlides];
                                updated[activeSlideTab] = { ...updated[activeSlideTab], image: e.target.value };
                                setCmsSlides(updated);
                              }}
                              required
                              placeholder="e.g., /hero_slide_1.png or upload a file"
                              style={{
                                flexGrow: 1,
                                padding: "0.6rem 0.85rem",
                                borderRadius: "var(--radius-md)",
                                border: "1px solid #d1d5db",
                                outline: "none",
                                fontSize: "0.9rem"
                              }}
                            />
                            <label style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              backgroundColor: "#f3f4f6",
                              border: "1px solid #d1d5db",
                              borderRadius: "var(--radius-md)",
                              padding: "0 1rem",
                              fontSize: "0.85rem",
                              fontWeight: 600,
                              cursor: "pointer",
                              color: "#374151",
                              transition: "all 0.2s ease",
                              whiteSpace: "nowrap"
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = "var(--college-primary-dark)";
                              e.currentTarget.style.color = "white";
                              e.currentTarget.style.borderColor = "var(--college-primary-dark)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = "#f3f4f6";
                              e.currentTarget.style.color = "#374151";
                              e.currentTarget.style.borderColor = "#d1d5db";
                            }}
                            >
                              📁 Upload File
                              <input
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;

                                  const uploadFormData = new FormData();
                                  uploadFormData.append("file", file);

                                  try {
                                    setCmsStatus(null);
                                    const response = await fetch("/api/upload", {
                                      method: "POST",
                                      body: uploadFormData
                                    });
                                    const data = await response.json();
                                    if (data.url) {
                                      const updated = [...cmsSlides];
                                      updated[activeSlideTab] = { ...updated[activeSlideTab], image: data.url };
                                      setCmsSlides(updated);
                                    } else {
                                      setCmsStatus({ error: data.error || "Failed to upload image." });
                                    }
                                  } catch (err) {
                                    console.error("Upload error:", err);
                                    setCmsStatus({ error: "Network error during upload." });
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Preview Column */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151" }}>
                          Slide Image Preview
                        </label>
                        <div style={{
                          flexGrow: 1,
                          border: "1px dashed #d1d5db",
                          borderRadius: "var(--radius-md)",
                          backgroundColor: "#f9fafb",
                          overflow: "hidden",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          minHeight: "220px",
                          position: "relative"
                        }}>
                          {cmsSlides[activeSlideTab]?.image ? (
                            <img
                              src={cmsSlides[activeSlideTab].image}
                              alt="Slide Preview"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                position: "absolute"
                              }}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : null}
                          <span style={{ fontSize: "0.8rem", color: "#9ca3af", zIndex: 1, pointerEvents: "none" }}>
                            Preview not available
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: "2rem", borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem", display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="submit"
                        disabled={cmsSaving}
                        style={{
                          backgroundColor: "var(--college-primary)",
                          color: "white",
                          border: "2px solid var(--college-primary)",
                          padding: "0.65rem 1.75rem",
                          borderRadius: "var(--radius-md)",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s ease"
                        }}
                        className="auth-logout-btn"
                      >
                        {cmsSaving ? "Saving Settings..." : "Save Homepage Config"}
                      </button>
                    </div>
                  </form>
                </div>

                {/* 2. FUTURE COMPONENT PLACEHOLDERS */}
                <div className="card" style={{ backgroundColor: "white", padding: "1.5rem 2rem", opacity: 0.85, borderLeft: "4px solid var(--college-accent)" }}>
                  <h4 style={{ margin: 0, color: "var(--college-primary)", fontFamily: "Playfair Display, serif", fontSize: "1.15rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>🏫 About Section Configuration</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--college-accent)", backgroundColor: "var(--college-primary-dark)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: "bold" }}>COMING SOON</span>
                  </h4>
                </div>

                <div className="card" style={{ backgroundColor: "white", padding: "1.5rem 2rem", opacity: 0.85, borderLeft: "4px solid var(--college-accent)" }}>
                  <h4 style={{ margin: 0, color: "var(--college-primary)", fontFamily: "Playfair Display, serif", fontSize: "1.15rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span>🔬 Why Choose Us Cards</span>
                    <span style={{ fontSize: "0.75rem", color: "var(--college-accent)", backgroundColor: "var(--college-primary-dark)", padding: "0.15rem 0.5rem", borderRadius: "4px", fontWeight: "bold" }}>COMING SOON</span>
                  </h4>
                </div>
                
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          colorScheme: "light"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            width: "100%",
            maxWidth: "580px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            border: "1px solid var(--border)"
          }}>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--college-primary)", margin: "0 0 1.25rem 0" }}>
              ✏️ Edit User & Academic Profile
            </h3>

            {userActionError && (
              <div style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "var(--error)",
                padding: "0.6rem 1rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1rem",
                fontSize: "0.85rem"
              }}>
                ⚠️ {userActionError}
              </div>
            )}

            <form onSubmit={handleSaveUser}>
              {/* Core Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={editingUser.name || ""}
                    required
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingUser.email || ""}
                    required
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Role Assignment
                  </label>
                  <select
                    name="role"
                    defaultValue={editingUser.role}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem",
                      backgroundColor: "white"
                    }}
                  >
                    <option value="STUDENT">🎓 Student</option>
                    <option value="TEACHER">👨‍🏫 Teacher</option>
                    <option value="ADMIN">⚡ Admin</option>
                  </select>
                </div>

                <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", paddingBottom: "0.25rem" }}>
                  <label htmlFor="approved" style={{ fontSize: "0.9rem", fontWeight: 700, color: "#374151", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <input
                      type="checkbox"
                      id="approved"
                      name="approved"
                      defaultChecked={editingUser.approved}
                      style={{ accentColor: "var(--college-primary)", cursor: "pointer", width: "18px", height: "18px" }}
                    />
                    Account Approved & Active
                  </label>
                  <span style={{ fontSize: "0.73rem", color: "#4b5563", marginTop: "0.3rem", lineHeight: "1.3" }}>
                    💡 <i>Unchecking this freezes/suspends the user&apos;s account and blocks dashboard access.</i>
                  </span>
                </div>
              </div>

              {/* Personal Info Grid */}
              <div style={{ marginTop: "1.25rem", borderTop: "1px solid #f3f4f6", paddingTop: "1rem" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--college-primary)", margin: "0 0 0.75rem 0" }}>
                  📞 Personal Details
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      placeholder="e.g. 9841234567"
                      defaultValue={editingUser.phone || ""}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.85rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid #d1d5db",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dob"
                      defaultValue={editingUser.dob || ""}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.85rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid #d1d5db",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                    Residential Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    placeholder="e.g. Lagankhel-05, Lalitpur"
                    defaultValue={editingUser.address || ""}
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      fontSize: "0.85rem"
                    }}
                  />
                </div>
              </div>

              {/* Academic Info Grid */}
              <div style={{ marginTop: "1.25rem", borderTop: "1px solid #f3f4f6", paddingTop: "1rem" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--college-primary)", margin: "0 0 0.75rem 0" }}>
                  🎓 Academic Record
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Faculty / Program
                    </label>
                    <input
                      type="text"
                      name="faculty"
                      placeholder="e.g. BCA, CSIT, BIM"
                      defaultValue={editingUser.faculty || ""}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid #d1d5db",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Roll Number
                    </label>
                    <input
                      type="text"
                      name="rollNo"
                      placeholder="e.g. LITA-2024-04"
                      defaultValue={editingUser.rollNo || ""}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid #d1d5db",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Admission Date
                    </label>
                    <input
                      type="date"
                      name="admissionDate"
                      defaultValue={editingUser.admissionDate || ""}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid #d1d5db",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Fee Management Grid */}
              <div style={{ marginTop: "1.25rem", borderTop: "1px solid #f3f4f6", paddingTop: "1rem", marginBottom: "1.5rem" }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--college-primary)", margin: "0 0 0.75rem 0" }}>
                  💳 Fee & Ledger Settings
                </h4>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Total Course Fee (Rs.)
                    </label>
                    <input
                      type="number"
                      name="totalFee"
                      placeholder="e.g. 150000"
                      defaultValue={editingUser.totalFee !== null && editingUser.totalFee !== undefined ? editingUser.totalFee : ""}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.85rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid #d1d5db",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#4b5563", marginBottom: "0.35rem" }}>
                      Paid Amount (Rs.)
                    </label>
                    <input
                      type="number"
                      name="paidFee"
                      placeholder="e.g. 50000"
                      defaultValue={editingUser.paidFee !== null && editingUser.paidFee !== undefined ? editingUser.paidFee : ""}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.85rem",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid #d1d5db",
                        fontSize: "0.85rem"
                      }}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    color: "#374151",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUserPending}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    backgroundColor: "var(--college-primary)",
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  {isUserPending ? "Saving..." : "Save Profile & Fees"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Viewing Student Profile & Fee Details Modal */}
      {viewingUser && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          colorScheme: "light"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            width: "100%",
            maxWidth: "620px",
            maxHeight: "90vh",
            overflowY: "auto",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            border: "1px solid var(--border)"
          }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem", marginBottom: "1.25rem", borderBottom: "1px solid #e5e7eb", paddingBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(27, 94, 32, 0.1)",
                  color: "var(--college-primary)",
                  fontWeight: 700,
                  fontSize: "1.3rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {(viewingUser.name || viewingUser.email || "US").substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ margin: "0 0 0.2rem 0", fontSize: "1.35rem", color: "var(--college-primary)", fontFamily: "Playfair Display, serif" }}>
                    {viewingUser.name || "Unnamed User"}
                  </h3>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{viewingUser.email}</div>
                </div>
              </div>

              <button
                onClick={() => setViewingUser(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  color: "#9ca3af",
                  cursor: "pointer"
                }}
              >
                ✕
              </button>
            </div>

            {/* Badges */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <span style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                backgroundColor: viewingUser.role === "ADMIN" ? "rgba(27, 94, 32, 0.1)" : viewingUser.role === "TEACHER" ? "rgba(79, 70, 229, 0.1)" : "rgba(212, 175, 55, 0.15)",
                color: viewingUser.role === "ADMIN" ? "var(--college-primary)" : viewingUser.role === "TEACHER" ? "#4f46e5" : "#92400e",
                padding: "0.25rem 0.65rem",
                borderRadius: "var(--radius-full)"
              }}>
                Role: {viewingUser.role}
              </span>

              <span style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                backgroundColor: viewingUser.approved ? "rgba(34, 197, 94, 0.1)" : "rgba(245, 158, 11, 0.1)",
                color: viewingUser.approved ? "var(--success)" : "var(--warning)",
                padding: "0.25rem 0.65rem",
                borderRadius: "var(--radius-full)"
              }}>
                {viewingUser.approved ? "✅ Approved Account" : "⏳ Pending Approval"}
              </span>
            </div>

            {/* Personal Details */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--college-primary)", margin: "0 0 0.75rem 0", borderBottom: "1px solid #f3f4f6", paddingBottom: "0.35rem" }}>
                📞 Personal Details
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Phone Number</span>
                  <strong style={{ color: "#1f2937" }}>{viewingUser.phone || "Not specified"}</strong>
                </div>
                <div>
                  <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Residential Address</span>
                  <strong style={{ color: "#1f2937" }}>{viewingUser.address || "Not specified"}</strong>
                </div>
                <div>
                  <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Date of Birth</span>
                  <strong style={{ color: "#1f2937" }}>{viewingUser.dob || "Not specified"}</strong>
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--college-primary)", margin: "0 0 0.75rem 0", borderBottom: "1px solid #f3f4f6", paddingBottom: "0.35rem" }}>
                🎓 Academic Profile
              </h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", fontSize: "0.85rem" }}>
                <div>
                  <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Faculty / Program</span>
                  <strong style={{ color: "#1f2937" }}>{viewingUser.faculty || "Not assigned"}</strong>
                </div>
                <div>
                  <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Roll Number</span>
                  <strong style={{ color: "#1f2937" }}>{viewingUser.rollNo || "Unassigned"}</strong>
                </div>
                <div>
                  <span style={{ color: "#6b7280", display: "block", fontSize: "0.75rem" }}>Admission Date</span>
                  <strong style={{ color: "#1f2937" }}>{viewingUser.admissionDate || "N/A"}</strong>
                </div>
              </div>
            </div>

            {/* Fee Ledger */}
            <div style={{
              backgroundColor: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: "var(--radius-md)",
              padding: "1.25rem",
              marginBottom: "1.5rem"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
                <h4 style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--college-primary)", margin: 0 }}>
                  💳 Financial Fee Ledger
                </h4>
                {(() => {
                  const total = viewingUser.totalFee || 0;
                  const paid = viewingUser.paidFee || 0;
                  const due = total - paid;
                  if (total === 0) return <span style={{ fontSize: "0.7rem", backgroundColor: "#e5e7eb", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>Fee Not Set</span>;
                  if (due <= 0) return <span style={{ fontSize: "0.7rem", backgroundColor: "rgba(34, 197, 94, 0.15)", color: "#15803d", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 700 }}>✅ Fully Paid</span>;
                  if (paid > 0) return <span style={{ fontSize: "0.7rem", backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#b45309", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 700 }}>⏳ Partial Paid</span>;
                  return <span style={{ fontSize: "0.7rem", backgroundColor: "rgba(239, 68, 68, 0.15)", color: "#b91c1c", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 700 }}>🔴 Unpaid</span>;
                })()}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem", textAlign: "center" }}>
                <div style={{ backgroundColor: "#ffffff", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: "0.7rem", color: "#6b7280", fontWeight: 600 }}>TOTAL COURSE FEE</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1f2937", marginTop: "0.2rem" }}>
                    Rs. {(viewingUser.totalFee || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ backgroundColor: "#ffffff", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--success)", fontWeight: 600 }}>PAID AMOUNT</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--success)", marginTop: "0.2rem" }}>
                    Rs. {(viewingUser.paidFee || 0).toLocaleString()}
                  </div>
                </div>

                <div style={{ backgroundColor: "#ffffff", padding: "0.75rem", borderRadius: "var(--radius-sm)", border: "1px solid #e5e7eb" }}>
                  <div style={{ fontSize: "0.7rem", color: "var(--error)", fontWeight: 600 }}>OUTSTANDING DUE</div>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--error)", marginTop: "0.2rem" }}>
                    Rs. {Math.max(0, (viewingUser.totalFee || 0) - (viewingUser.paidFee || 0)).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => {
                  setSelectedFeeStudentId(viewingUser.id);
                  setTxActionError(null);
                  setShowFeeModal(true);
                }}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  backgroundColor: "var(--college-primary)",
                  color: "#ffffff",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                💳 Collect Fee
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = viewingUser;
                  setViewingUser(null);
                  setEditingUser(target);
                }}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--college-primary)",
                  backgroundColor: "rgba(27, 94, 32, 0.05)",
                  color: "var(--college-primary)",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                ✏️ Edit Profile
              </button>
              <button
                type="button"
                onClick={() => setViewingUser(null)}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deletingUserId && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          colorScheme: "light"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            width: "100%",
            maxWidth: "420px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            border: "1px solid var(--border)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>⚠️</div>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.4rem", color: "var(--error)", margin: "0 0 0.5rem 0" }}>
              Delete User Account?
            </h3>
            <p className="text-muted" style={{ fontSize: "0.9rem", marginBottom: "1.5rem" }}>
              Are you sure you want to permanently delete this user account? This action cannot be undone.
            </p>

            {userActionError && (
              <div style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "var(--error)",
                padding: "0.6rem 1rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1rem",
                fontSize: "0.85rem"
              }}>
                ⚠️ {userActionError}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "center", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setDeletingUserId(null)}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: "1px solid #d1d5db",
                  backgroundColor: "#ffffff",
                  color: "#374151",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDeleteUser(deletingUserId)}
                disabled={isUserPending}
                style={{
                  padding: "0.6rem 1.25rem",
                  borderRadius: "var(--radius-md)",
                  border: "none",
                  backgroundColor: "var(--error)",
                  color: "#ffffff",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                {isUserPending ? "Deleting..." : "Yes, Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collect Student Fee Modal */}
      {showFeeModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          colorScheme: "light"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            width: "100%",
            maxWidth: "520px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            border: "1px solid var(--border)"
          }}>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "var(--college-primary)", margin: "0 0 1.25rem 0" }}>
              💳 Collect Student Fee Payment
            </h3>

            {txActionError && (
              <div style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "var(--error)",
                padding: "0.6rem 1rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1rem",
                fontSize: "0.85rem"
              }}>
                ⚠️ {txActionError}
              </div>
            )}

            <form onSubmit={handleSaveCollectFee}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                  Select Student
                </label>
                <select
                  name="studentId"
                  value={selectedFeeStudentId}
                  required
                  onChange={(e) => setSelectedFeeStudentId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #d1d5db",
                    outline: "none",
                    fontSize: "0.9rem",
                    backgroundColor: "white"
                  }}
                >
                  <option value="">-- Choose Student --</option>
                  {localUsers
                    .filter((u) => u.role === "STUDENT")
                    .map((s) => {
                      const total = s.totalFee || 0;
                      const paid = s.paidFee || 0;
                      const due = total - paid;
                      return (
                        <option key={s.id} value={s.id}>
                          🎓 {s.name || s.email} {s.faculty ? `(${s.faculty})` : ""} — Total: Rs. {total.toLocaleString()} | Due: Rs. {due.toLocaleString()}
                        </option>
                      );
                    })}
                </select>
              </div>

              {/* Student Financial Summary Box if student selected */}
              {(() => {
                const selStudent = localUsers.find(u => u.id === selectedFeeStudentId);
                if (!selStudent) return null;
                const total = selStudent.totalFee || 0;
                const paid = selStudent.paidFee || 0;
                const due = Math.max(0, total - paid);

                return (
                  <div style={{
                    backgroundColor: "#f9fafb",
                    border: "1px solid #e5e7eb",
                    borderRadius: "var(--radius-md)",
                    padding: "1rem",
                    marginBottom: "1.25rem"
                  }}>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--college-primary)", marginBottom: "0.65rem" }}>
                      📊 Financial Summary for {selStudent.name || selStudent.email}
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1fr", gap: "0.75rem" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "0.7rem", color: "#6b7280", fontWeight: 600, marginBottom: "0.2rem" }}>
                          TOTAL COURSE FEE (RS.)
                        </label>
                        <input
                          type="number"
                          name="totalFee"
                          key={`totalFee-${selStudent.id}-${total}`}
                          defaultValue={total > 0 ? total : ""}
                          placeholder="Set Total Fee"
                          min="0"
                          style={{
                            width: "100%",
                            padding: "0.4rem 0.6rem",
                            borderRadius: "var(--radius-sm)",
                            border: "1px solid #d1d5db",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            color: "#1f2937",
                            backgroundColor: "#ffffff"
                          }}
                        />
                      </div>

                      <div style={{ backgroundColor: "#ffffff", padding: "0.5rem 0.6rem", borderRadius: "var(--radius-sm)", border: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: "0.7rem", color: "var(--success)", fontWeight: 600 }}>ALREADY PAID</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--success)", marginTop: "0.2rem" }}>
                          Rs. {paid.toLocaleString()}
                        </div>
                      </div>

                      <div style={{ backgroundColor: "#ffffff", padding: "0.5rem 0.6rem", borderRadius: "var(--radius-sm)", border: "1px solid #e5e7eb" }}>
                        <div style={{ fontSize: "0.7rem", color: due > 0 ? "var(--error)" : "#15803d", fontWeight: 600 }}>REMAINING DUE</div>
                        <div style={{ fontSize: "0.95rem", fontWeight: 700, color: due > 0 ? "var(--error)" : "#15803d", marginTop: "0.2rem" }}>
                          Rs. {due.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Payment Title / Type
                  </label>
                  <select
                    name="feeType"
                    defaultValue="1st Installment"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem",
                      backgroundColor: "white"
                    }}
                  >
                    <option value="1st Installment">1st Installment</option>
                    <option value="2nd Installment">2nd Installment</option>
                    <option value="3rd Installment">3rd Installment</option>
                    <option value="Monthly Fee">Monthly Fee</option>
                    <option value="Admission Fee">Admission Fee</option>
                    <option value="Exam Fee">Exam Fee</option>
                    <option value="Partial Payment">Partial / Custom Payment</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Payment Amount Paying Today (Rs.)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="e.g. 20000"
                    required
                    min="1"
                    step="any"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      outline: "none",
                      fontSize: "0.9rem"
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    defaultValue="Cash"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem",
                      backgroundColor: "white"
                    }}
                  >
                    <option value="Cash">💵 Cash</option>
                    <option value="eSewa">📲 eSewa</option>
                    <option value="Khalti">📱 Khalti</option>
                    <option value="Bank Transfer">🏛️ Bank Transfer</option>
                    <option value="Cheque">📜 Cheque</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                  Payment Date
                </label>
                <input
                  type="date"
                  name="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  required
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #d1d5db",
                    outline: "none",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                  Receipt / Transaction Notes (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="e.g. Receipt #1042 - 1st Semester Installment"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #d1d5db",
                    outline: "none",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setShowFeeModal(false)}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    color: "#374151",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTxPending}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    backgroundColor: "var(--college-primary)",
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  {isTxPending ? "Recording Fee..." : "Save Fee Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record General Income Modal */}
      {showIncomeModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          colorScheme: "light"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            width: "100%",
            maxWidth: "520px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            border: "1px solid var(--border)"
          }}>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "#0284c7", margin: "0 0 1.25rem 0" }}>
              📈 Record General Revenue / Income
            </h3>

            {txActionError && (
              <div style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "var(--error)",
                padding: "0.6rem 1rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1rem",
                fontSize: "0.85rem"
              }}>
                ⚠️ {txActionError}
              </div>
            )}

            <form onSubmit={handleSaveGeneralIncome}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                  Income Title / Description
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Corporate IT Training Workshop Revenue"
                  required
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #d1d5db",
                    outline: "none",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Income Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="e.g. 45000"
                    required
                    min="1"
                    step="any"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Revenue Category
                  </label>
                  <select
                    name="category"
                    defaultValue="Training Revenue"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem",
                      backgroundColor: "white"
                    }}
                  >
                    <option value="Training Revenue">💻 Corporate / Workshop Training</option>
                    <option value="Sponsorship">🏅 Sponsorship / Grant</option>
                    <option value="Facility Rental">🏛️ Lab / Hall Rental</option>
                    <option value="Material Sales">📚 Books & Material Sales</option>
                    <option value="Consulting">💡 IT Consulting Services</option>
                    <option value="Other Revenue">📦 Other Income</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    defaultValue="Bank Transfer"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem",
                      backgroundColor: "white"
                    }}
                  >
                    <option value="Bank Transfer">🏛️ Bank Transfer</option>
                    <option value="eSewa">📲 eSewa</option>
                    <option value="Khalti">📱 Khalti</option>
                    <option value="Cash">💵 Cash</option>
                    <option value="Cheque">📜 Cheque</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Receipt Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem"
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                  Notes / Reference Voucher No. (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="e.g. Voucher #502 - Client Nabil Bank Seminar"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #d1d5db",
                    outline: "none",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setShowIncomeModal(false)}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    color: "#374151",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTxPending}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    backgroundColor: "#0284c7",
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  {isTxPending ? "Saving Income..." : "Save General Income"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          colorScheme: "light"
        }}>
          <div style={{
            backgroundColor: "#ffffff",
            borderRadius: "var(--radius-lg)",
            padding: "2rem",
            width: "100%",
            maxWidth: "520px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            border: "1px solid var(--border)"
          }}>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: "1.5rem", color: "#ef4444", margin: "0 0 1.25rem 0" }}>
              📉 Record Academy Expense
            </h3>

            {txActionError && (
              <div style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                color: "var(--error)",
                padding: "0.6rem 1rem",
                borderRadius: "var(--radius-md)",
                marginBottom: "1rem",
                fontSize: "0.85rem"
              }}>
                ⚠️ {txActionError}
              </div>
            )}

            <form onSubmit={handleSaveExpense}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                  Expense Title / Description
                </label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g. Teacher Salary Payment - Shravan"
                  required
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #d1d5db",
                    outline: "none",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Expense Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    placeholder="e.g. 35000"
                    required
                    min="1"
                    step="any"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem"
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Expense Category
                  </label>
                  <select
                    name="category"
                    defaultValue="Teacher Salary"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem",
                      backgroundColor: "white"
                    }}
                  >
                    <option value="Teacher Salary">👨‍🏫 Teacher Salary</option>
                    <option value="Rent">🏢 Building Rent</option>
                    <option value="Electricity & Water">⚡ Electricity & Water</option>
                    <option value="Internet & IT">🌐 Internet & IT</option>
                    <option value="Office Supplies">📝 Office Supplies</option>
                    <option value="Maintenance">🛠️ Maintenance</option>
                    <option value="Other">📦 Other Expense</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    defaultValue="Bank Transfer"
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem",
                      backgroundColor: "white"
                    }}
                  >
                    <option value="Bank Transfer">🏛️ Bank Transfer</option>
                    <option value="Cash">💵 Cash</option>
                    <option value="eSewa">📲 eSewa</option>
                    <option value="Khalti">📱 Khalti</option>
                    <option value="Cheque">📜 Cheque</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                    Expense Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                    style={{
                      width: "100%",
                      padding: "0.65rem 0.85rem",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid #d1d5db",
                      outline: "none",
                      fontSize: "0.9rem"
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, color: "#374151", marginBottom: "0.35rem" }}>
                  Notes / Bill Voucher No. (Optional)
                </label>
                <input
                  type="text"
                  name="notes"
                  placeholder="e.g. Voucher #789 - Electricity Bill July"
                  style={{
                    width: "100%",
                    padding: "0.65rem 0.85rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #d1d5db",
                    outline: "none",
                    fontSize: "0.9rem"
                  }}
                />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid #d1d5db",
                    backgroundColor: "#ffffff",
                    color: "#374151",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isTxPending}
                  style={{
                    padding: "0.6rem 1.25rem",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    backgroundColor: "#ef4444",
                    color: "#ffffff",
                    fontWeight: 600,
                    cursor: "pointer"
                  }}
                >
                  {isTxPending ? "Saving Expense..." : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
