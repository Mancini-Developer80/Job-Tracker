import React, { useState, useEffect, useMemo } from "react";
import JobForm from "../components/JobForm";
import type { JobFormData } from "../components/JobForm";
import styles from "./Dashboard.module.css";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../context/AuthContext";

type Job = {
  _id: string;
  company: string;
  position: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  date: string;
  tags: string[];
};

const STATUS_COLORS: Record<Job["status"], string> = {
  Applied: "#60a5fa",
  Interview: "#fbbf24",
  Offer: "#34d399",
  Rejected: "#f87171",
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch jobs for the logged-in user
  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/jobs`, {
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch jobs");
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        setError("Could not load jobs");
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchJobs();
  }, [user]);

  // Add or update job
  const handleSubmit = async (form: JobFormData) => {
    setError("");
    try {
      const method = editJob ? "PUT" : "POST";
      const url = editJob
        ? `${import.meta.env.VITE_API_URL}/api/jobs/${editJob._id}`
        : `${import.meta.env.VITE_API_URL}/api/jobs`;
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            ? form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
        }),
      });
      if (!res.ok) throw new Error("Failed to save job");
      const data = await res.json();
      if (editJob) {
        setJobs((prev) => prev.map((j) => (j._id === data._id ? data : j)));
      } else {
        setJobs((prev) => [data, ...prev]);
      }
      setEditJob(null);
    } catch (err) {
      setError("Could not save job");
    }
  };

  // Delete job
  const handleDelete = async (id: string) => {
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/api/jobs/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      if (!res.ok) throw new Error("Failed to delete job");
      setJobs((prev) => prev.filter((j) => j._id !== id));
      setDeleteId(null);
    } catch (err) {
      setError("Could not delete job");
    }
  };

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesStatus = !filterStatus || job.status === filterStatus;
      const matchesSearch =
        !search ||
        job.company.toLowerCase().includes(search.toLowerCase()) ||
        job.position.toLowerCase().includes(search.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [jobs, filterStatus, search]);

  // Pie chart data
  const chartData = useMemo(() => {
    const counts: Record<Job["status"], number> = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    };
    jobs.forEach((job) => {
      counts[job.status]++;
    });
    return Object.entries(counts).map(([status, value]) => ({
      name: status,
      value,
    }));
  }, [jobs]);

  return (
    <div className={styles.dashboard}>
      <h2>Dashboard</h2>
      {error && (
        <div style={{ color: "#d32f2f", marginBottom: 12 }}>{error}</div>
      )}
      <div className={styles.section}>
        <JobForm
          onSubmit={handleSubmit}
          initialData={
            editJob
              ? {
                  ...editJob,
                  tags: editJob.tags.join(", "),
                }
              : undefined
          }
          submitLabel={editJob ? "Update Job" : "Add Job"}
          onCancel={editJob ? () => setEditJob(null) : undefined}
          showCancel={!!editJob}
        />
      </div>
      <div className={styles.section}>
        <div className={styles.filterBox}>
          <input
            type="text"
            placeholder="Search company or position"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
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
        </div>
        {loading ? (
          <div>Loading jobs...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>Company</th>
                <th className={styles.th}>Position</th>
                <th className={styles.th}>Status</th>
                <th className={styles.th}>Date</th>
                <th className={styles.th}>Tags</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredJobs.map((job) => (
                <tr key={job._id}>
                  <td className={styles.td}>{job.company}</td>
                  <td className={styles.td}>{job.position}</td>
                  <td className={styles.td}>
                    <span
                      style={{
                        background: STATUS_COLORS[job.status],
                        color: "#fff",
                        borderRadius: 8,
                        padding: "2px 10px",
                        fontWeight: 600,
                        fontSize: "0.98em",
                      }}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className={styles.td}>{job.date?.slice(0, 10)}</td>
                  <td className={styles.td}>
                    {job.tags && job.tags.length > 0 ? (
                      job.tags.map((tag, i) => (
                        <span key={i} className={styles.tag}>
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span style={{ color: "#888" }}>—</span>
                    )}
                  </td>
                  <td className={styles.td}>
                    <div className={styles.actions}>
                      <button
                        className={`${styles.actionBtn} ${styles.edit}`}
                        onClick={() => setEditJob(job)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.delete}`}
                        onClick={() => setDeleteId(job._id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredJobs.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center" }}>
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.chartTitle}>Job Status Distribution</div>
        <div className={styles.chartsGrid}>
          <div className={styles.charts}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) =>
                    typeof value === "number" && value > 0
                      ? `${name}: ${value}`
                      : ""
                  }
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={STATUS_COLORS[entry.name as Job["status"]]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Delete confirmation modal */}
      {deleteId && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>Delete Job?</h3>
            <p>Are you sure you want to delete this job?</p>
            <div className={styles.modalActions}>
              <button
                className="modalDeleteBtn"
                onClick={() => handleDelete(deleteId)}
              >
                Delete
              </button>
              <button
                className="modalCancelBtn"
                onClick={() => setDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
