import React, { useState, useEffect, useMemo } from "react";
import JobForm from "../components/JobForm";
import type { JobFormData } from "../components/JobForm";
import styles from "./Dashboard.module.css";
import { useAuth } from "../context/AuthContext";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from "recharts";

type Job = {
  _id: string;
  company: string;
  position: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  date: string;
  tags: string[];
  favorite?: boolean;
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
  const [formKey, setFormKey] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [showFavorites, setShowFavorites] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Bar chart: applications by company
  const companyBarData = React.useMemo<
    { company: string; count: number }[]
  >(() => {
    const companyMap: Record<string, number> = {};
    jobs.forEach((job) => {
      if (!job.company) return;
      companyMap[job.company] = (companyMap[job.company] || 0) + 1;
    });
    return Object.entries(companyMap)
      .sort((a, b) => b[1] - a[1]) // sort descending by count
      .map(([company, count]) => ({ company, count }));
  }, [jobs]);

  // Area chart: cumulative applications over time
  const cumulativeData = React.useMemo<
    { date: string; total: number }[]
  >(() => {
    const dateCounts: Record<string, number> = {};
    jobs.forEach((job) => {
      if (!job.date) return;
      const d = new Date(job.date);
      if (isNaN(d.getTime())) return;
      const key = d.toISOString().slice(0, 10);
      dateCounts[key] = (dateCounts[key] || 0) + 1;
    });
    let cumulative = 0;
    const result: { date: string; total: number }[] = [];
    Object.keys(dateCounts)
      .sort()
      .forEach((date) => {
        cumulative += dateCounts[date];
        result.push({ date, total: cumulative });
      });
    return result;
  }, [jobs]);

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
        setFormKey((k) => k + 1); // force JobForm to reset
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
      const matchesFavorite = !showFavorites || job.favorite;
      return matchesStatus && matchesSearch && matchesFavorite;
    });
  }, [jobs, filterStatus, search, showFavorites]);

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

  // Bar chart data: jobs per month
  const barData = useMemo(() => {
    const monthMap: Record<string, number> = {};
    jobs.forEach((job) => {
      if (!job.date) return;
      const d = new Date(job.date);
      if (isNaN(d.getTime())) return;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}`;
      monthMap[key] = (monthMap[key] || 0) + 1;
    });
    // Sort by month ascending
    return Object.entries(monthMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }, [jobs]);

  return (
    <div className={styles.dashboard}>
      <h2>Dashboard</h2>
      {error && (
        <div style={{ color: "#d32f2f", marginBottom: 12 }}>{error}</div>
      )}
      <div className={styles.section}>
        <JobForm
          key={formKey}
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
          <label
            style={{
              marginLeft: 16,
              display: "flex",
              alignItems: "center",
              gap: 4,
              fontSize: 15,
              color: "#333",
            }}
          >
            <input
              type="checkbox"
              checked={showFavorites}
              onChange={(e) => setShowFavorites(e.target.checked)}
              style={{ accentColor: "#fbbf24" }}
            />
            <span
              style={{
                color: showFavorites ? "#fbbf24" : "#888",
                fontWeight: 600,
                fontSize: 18,
              }}
            >
              ★
            </span>
            Show only Favorites
          </label>
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
                <th className={styles.th}>Favorite</th>
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
                    <button
                      title={job.favorite ? "Unstar" : "Star"}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: 22,
                        color: job.favorite ? "#fbbf24" : "#bbb",
                        verticalAlign: "middle",
                        outline: "none",
                        padding: 0,
                      }}
                      onClick={async () => {
                        // Optimistic UI update
                        setJobs((prev) =>
                          prev.map((j) =>
                            j._id === job._id
                              ? { ...j, favorite: !job.favorite }
                              : j
                          )
                        );
                        try {
                          // Only send favorite for partial update
                          const res = await fetch(
                            `${import.meta.env.VITE_API_URL}/api/jobs/${
                              job._id
                            }`,
                            {
                              method: "PUT",
                              headers: {
                                "Content-Type": "application/json",
                                Authorization: `Bearer ${user?.token}`,
                              },
                              body: JSON.stringify({ favorite: !job.favorite }),
                            }
                          );
                          if (!res.ok)
                            throw new Error("Failed to update favorite");
                          const updated = await res.json();
                          setJobs((prev) =>
                            prev.map((j) =>
                              j._id === updated._id ? updated : j
                            )
                          );
                        } catch (err) {
                          setError("Could not update favorite");
                          // Revert optimistic update on error
                          setJobs((prev) =>
                            prev.map((j) =>
                              j._id === job._id
                                ? { ...j, favorite: job.favorite }
                                : j
                            )
                          );
                        }
                      }}
                    >
                      {job.favorite ? "★" : "☆"}
                    </button>
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
                  <td colSpan={7} style={{ textAlign: "center" }}>
                    No jobs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className={styles.section}>
        <div className={styles.chartTitle}>Job Analytics</div>
        <div className={styles.chartsGrid}>
          <div
            className={styles.charts}
            style={{
              minWidth: 320,
              flex: 1,
              boxShadow: "0 2px 12px rgba(30,64,175,0.07)",
              borderRadius: 12,
              background: "#f4f7fb",
              padding: 16,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: 8,
                color: "#2563eb",
                textAlign: "center",
              }}
            >
              Status Distribution
            </div>
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
          <div
            className={styles.charts}
            style={{
              minWidth: 320,
              flex: 1,
              boxShadow: "0 2px 12px rgba(30,64,175,0.07)",
              borderRadius: 12,
              background: "#f4f7fb",
              padding: 16,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: 8,
                color: "#2563eb",
                textAlign: "center",
              }}
            >
              Applications per Month
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={barData}
                margin={{ top: 16, right: 16, left: 0, bottom: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#2563eb"
                  name="Applications"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div
            className={styles.charts}
            style={{
              minWidth: 320,
              flex: 1,
              boxShadow: "0 2px 12px rgba(30,64,175,0.07)",
              borderRadius: 12,
              background: "#f4f7fb",
              padding: 16,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: 8,
                color: "#2563eb",
                textAlign: "center",
              }}
            >
              Applications by Company
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={companyBarData}
                margin={{ top: 16, right: 16, left: 0, bottom: 16 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="company"
                  tick={{ fontSize: 12 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="count"
                  fill="#fbbf24"
                  name="Applications"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div
            className={styles.charts}
            style={{
              minWidth: 320,
              flex: 1,
              boxShadow: "0 2px 12px rgba(30,64,175,0.07)",
              borderRadius: 12,
              background: "#f4f7fb",
              padding: 16,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                marginBottom: 8,
                color: "#2563eb",
                textAlign: "center",
              }}
            >
              Cumulative Applications
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart
                data={cumulativeData}
                margin={{ top: 16, right: 16, left: 0, bottom: 16 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#34d399"
                  fillOpacity={1}
                  fill="url(#colorTotal)"
                  name="Cumulative"
                />
              </AreaChart>
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
                onClick={() => {
                  setDeleteId(null);
                  setSearch("");
                  setFilterStatus("");
                }}
              >
                Cancel & Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
