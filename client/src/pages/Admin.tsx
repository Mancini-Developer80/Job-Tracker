import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "./Admin.module.css";

const Admin: React.FC = () => {
  // State for editing users
  const [editId, setEditId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("User");

  // Start editing a user
  const startEdit = (user: {
    id: number;
    name: string;
    email: string;
    role: string;
  }) => {
    setEditId(user.id);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  // Save edited user
  const saveEdit = () => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editId
          ? { ...u, name: editName, email: editEmail, role: editRole }
          : u
      )
    );
    setEditId(null);
  };

  // Export filtered jobs to CSV
  const exportJobsToCSV = () => {
    const headers = ["User", "Company", "Position", "Status", "Date"];
    const rows = filteredJobs.map((job) => {
      const user = users.find((u) => u.id === job.userId);
      return [
        user ? user.name : "Unknown",
        job.company,
        job.position,
        job.status,
        job.date,
      ];
    });
    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "job_applications.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setEditId(null);
  };

  // Filters for job applications
  const [filterUser, setFilterUser] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock user data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Alice Smith",
      email: "alice@example.com",
      role: "Superuser",
    },
    { id: 2, name: "Bob Johnson", email: "bob@example.com", role: "Admin" },
    { id: 3, name: "Charlie Lee", email: "charlie@example.com", role: "User" },
  ]);

  // Mock job data (all users)
  const [jobs] = useState([
    {
      id: 1,
      userId: 1,
      company: "Google",
      position: "Frontend Developer",
      status: "Applied",
      date: "2024-05-01",
    },
    {
      id: 2,
      userId: 2,
      company: "Amazon",
      position: "Backend Developer",
      status: "Interview",
      date: "2024-05-03",
    },
    {
      id: 3,
      userId: 3,
      company: "Microsoft",
      position: "Fullstack Developer",
      status: "Offer",
      date: "2024-05-05",
    },
    {
      id: 4,
      userId: 1,
      company: "Meta",
      position: "UI Designer",
      status: "Rejected",
      date: "2024-05-07",
    },
  ]);

  // Filtered jobs based on search/filter criteria
  const filteredJobs = jobs.filter((job) => {
    const user = users.find((u) => u.id === job.userId);
    const matchesUser = !filterUser || (user && user.name === filterUser);
    const matchesStatus = !filterStatus || job.status === filterStatus;
    const matchesSearch =
      !searchTerm ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesUser && matchesStatus && matchesSearch;
  });

  // Analytics data: count jobs by status
  const statusCounts = ["Applied", "Interview", "Offer", "Rejected"].map(
    (status) => ({
      status,
      count: jobs.filter((job) => job.status === status).length,
    })
  );

  const cancelEdit = () => {
    setEditId(null);
  };

  const deleteUser = (id: number) => {
    setUsers((prev) => prev.filter((u) => u.id !== id));
  };

  return (
    <div className={styles.container}>
      <h2>Admin Dashboard</h2>
      <section className={styles.section}>
        <h3>User Management</h3>
        <table
          className={styles.table}
          style={{ width: "100%", marginBottom: "1.5rem" }}
        >
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) =>
              editId === user.id ? (
                <tr key={user.id}>
                  <td>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      style={{ width: "90%" }}
                    />
                  </td>
                  <td>
                    <input
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      style={{ width: "90%" }}
                    />
                  </td>
                  <td>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <button onClick={saveEdit} style={{ marginRight: 8 }}>
                      Save
                    </button>
                    <button onClick={cancelEdit}>Cancel</button>
                  </td>
                </tr>
              ) : (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>
                    <button
                      onClick={() => startEdit(user)}
                      style={{ marginRight: 8 }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        setUsers((prev) =>
                          prev.map((u) =>
                            u.id === user.id
                              ? {
                                  ...u,
                                  role: u.role === "Admin" ? "User" : "Admin",
                                }
                              : u
                          )
                        );
                      }}
                      style={{
                        marginRight: 8,
                        background:
                          user.role === "Admin" ? "#ffc107" : "#007bff",
                        color: "#fff",
                      }}
                    >
                      {user.role === "Admin"
                        ? "Demote to User"
                        : "Promote to Admin"}
                    </button>
                    <button
                      onClick={() => deleteUser(user.id)}
                      style={{ background: "#dc3545", color: "#fff" }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h3>All Job Applications</h3>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 16,
          }}
        >
          <input
            type="text"
            placeholder="Search company or position"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ minWidth: 180 }}
          />
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
          >
            <option value="">All Users</option>
            {users.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button onClick={exportJobsToCSV}>Export to CSV</button>
        </div>
        <table
          className={styles.table}
          style={{ width: "100%", marginBottom: "1.5rem" }}
        >
          <thead>
            <tr>
              <th>User</th>
              <th>Company</th>
              <th>Position</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => {
              const user = users.find((u) => u.id === job.userId);
              return (
                <tr key={job.id}>
                  <td>{user ? user.name : "Unknown"}</td>
                  <td>{job.company}</td>
                  <td>{job.position}</td>
                  <td>{job.status}</td>
                  <td>{job.date}</td>
                </tr>
              );
            })}
            {filteredJobs.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  No job applications found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h3>Analytics</h3>
        <div style={{ width: "100%", maxWidth: 600, margin: "0 auto" }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={statusCounts}
              margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
            >
              <XAxis dataKey="status" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="count"
                fill="#007bff"
                name="Job Count"
                label={{ position: "top" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className={styles.section}>
        <h3>Advanced Features</h3>
        {/* Advanced admin features will go here */}
        <p>Feature coming soon: Analytics, system settings, and more.</p>
      </section>
    </div>
  );
};

export default Admin;
