import React, { useState, useEffect, useMemo, useRef } from "react";
import Papa from "papaparse";
import NoteModal from "../components/NoteModal";
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
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Job = {
  _id: string;
  company: string;
  position: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  date: string;
  tags: string[];
  favorite?: boolean;
  notes?: string;
};

const STATUS_COLORS: Record<Job["status"], string> = {
  Applied: "#60a5fa",
  Interview: "#fbbf24",
  Offer: "#34d399",
  Rejected: "#f87171",
};

const Dashboard: React.FC = () => {
  // CSV Export
  const handleExportCSV = () => {
    if (!jobs.length) return;
    const csv = Papa.unparse(
      jobs.map(({ _id, ...job }) => ({
        ...job,
        tags: Array.isArray(job.tags) ? job.tags.join(", ") : job.tags,
      }))
    );
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `jobs_export_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Excel Export
  const handleExportExcel = () => {
    if (!jobs.length) return;
    const data = jobs.map(({ _id, ...job }) => ({
      ...job,
      tags: Array.isArray(job.tags) ? job.tags.join(", ") : job.tags,
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Jobs");
    XLSX.writeFile(
      workbook,
      `jobs_export_${new Date().toISOString().slice(0, 10)}.xlsx`
    );
  };

  // PDF Export
  const handleExportPDF = () => {
    if (!jobs.length) return;
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Job Tracker Export", 14, 16);
    const columns = [
      { header: "Company", dataKey: "company" },
      { header: "Position", dataKey: "position" },
      { header: "Status", dataKey: "status" },
      { header: "Date", dataKey: "date" },
      { header: "Tags", dataKey: "tags" },
      { header: "Favorite", dataKey: "favorite" },
      { header: "Notes", dataKey: "notes" },
    ];
    const rows = jobs.map(({ _id, tags, favorite, ...job }) => ({
      ...job,
      tags: Array.isArray(tags) ? tags.join(", ") : tags,
      favorite: favorite ? "★" : "",
    }));
    autoTable(doc, {
      startY: 22,
      head: [columns.map((col) => col.header)],
      body: rows.map((row) =>
        columns.map(
          (col) => (row as Record<string, unknown>)[col.dataKey] || ""
        )
      ),
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [37, 99, 235] },
      margin: { left: 8, right: 8 },
    });
    doc.save(`jobs_export_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  // CSV Import
  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const importedJobs = (results.data as any[]).map((row, idx) => ({
          _id:
            row._id && typeof row._id === "string" && row._id.trim() !== ""
              ? row._id
              : `imported-${Date.now()}-${idx}`,
          company: row.company || "",
          position: row.position || "",
          status: row.status || "Applied",
          date: row.date || new Date().toISOString().slice(0, 10),
          tags: row.tags
            ? row.tags
                .split(/,|;/)
                .map((t: string) => t.trim())
                .filter(Boolean)
            : [],
          notes: row.notes || "",
          favorite: row.favorite === "true" || row.favorite === true,
        }));
        // Optionally, send to backend here. For now, just add to state:
        setJobs((prev) => [...importedJobs, ...prev]);
      },
      error: (err) => {
        alert("Failed to import CSV: " + err.message);
      },
    });
    // Reset file input
    e.target.value = "";
  };
  // Excel Import
  const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      if (!data) return;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });
      const importedJobs = json.map((row, idx) => ({
        _id:
          row._id && typeof row._id === "string" && row._id.trim() !== ""
            ? row._id
            : `imported-excel-${Date.now()}-${idx}`,
        company: row.company || "",
        position: row.position || "",
        status: row.status || "Applied",
        date: row.date || new Date().toISOString().slice(0, 10),
        tags: row.tags
          ? String(row.tags)
              .split(/,|;/)
              .map((t: string) => t.trim())
              .filter(Boolean)
          : [],
        notes: row.notes || "",
        favorite: row.favorite === "true" || row.favorite === true,
      }));
      setJobs((prev) => [...importedJobs, ...prev]);
    };
    reader.readAsBinaryString(file);
    e.target.value = "";
  };

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
  const [noteModal, setNoteModal] = useState<{ open: boolean; note: string }>({
    open: false,
    note: "",
  });
  // Ref to track the latest job id for which the modal is opened
  const noteModalJobId = useRef<string | null>(null);

  // --- Custom Fields State ---
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [newCustomField, setNewCustomField] = useState("");

  // Add custom field
  const handleAddCustomField = () => {
    const name = newCustomField.trim();
    if (name && !customFields.includes(name)) {
      setCustomFields([...customFields, name]);
      setNewCustomField("");
    }
  };
  // Remove custom field
  const handleRemoveCustomField = (field: string) => {
    setCustomFields(customFields.filter((f) => f !== field));
    // Remove field from all jobs
    setJobs((prev) =>
      prev.map((job) => {
        // Remove the custom field, but keep the Job type
        const { [field]: _, ...rest } = job as any;
        return rest as Job;
      })
    );
  };

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
          notes: typeof form.notes === "string" ? form.notes : "",
        }),
      });
      if (!res.ok) throw new Error("Failed to save job");
      const data = await res.json();
      if (editJob) {
        setJobs((prev) => prev.map((j) => (j._id === data._id ? data : j)));
        // If the note modal is open for this job, update the modal content
        if (noteModal.open && noteModalJobId.current === data._id) {
          setNoteModal({ open: true, note: data.notes || "" });
        }
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 8,
          marginBottom: 24,
          background: "#f4f7fb",
          borderRadius: 10,
          padding: "18px 20px 14px 20px",
          boxShadow: "0 2px 8px rgba(30,64,175,0.06)",
        }}
      >
        <div
          style={{
            fontWeight: 600,
            color: "#2563eb",
            marginBottom: 4,
            fontSize: 17,
          }}
        >
          Import/Export Your Jobs
        </div>
        <div
          style={{
            color: "#333",
            fontSize: 14,
            marginBottom: 8,
            maxWidth: 600,
          }}
        >
          <ul style={{ margin: 0, paddingLeft: 18 }}>
            <li>
              Export your job list as a <b>CSV</b> or <b>Excel (.xlsx)</b> file
              for backup, sharing, or use in Excel/Sheets.
            </li>
            <li>
              <b>Export CSV</b>: Universal, simple text format. Best for quick
              data transfer or import into most tools.
            </li>
            <li>
              <b>Export Excel</b>: Preserves formatting, works best for advanced
              spreadsheet use, and is compatible with Microsoft Excel and Google
              Sheets.
            </li>
            <li>
              Import jobs from a <b>CSV</b> or <b>Excel (.xlsx, .xls)</b> file
              (e.g., from LinkedIn, Excel, or another tracker). Imported jobs
              are added to your dashboard but not saved to the backend.
            </li>
            <li>
              <b>Import Excel</b>: Accepts standard Excel files. The first sheet
              is used. Columns should match:{" "}
              <b>company, position, status, date, tags, notes, favorite</b>.
            </li>
            <li>
              CSV columns:{" "}
              <b>company, position, status, date, tags, notes, favorite</b>.
              Tags can be comma- or semicolon-separated.
            </li>
          </ul>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            onClick={handleExportCSV}
            className={styles.button}
            style={{ background: "#2563eb", color: "#fff", minWidth: 120 }}
          >
            Export CSV
          </button>
          <button
            onClick={handleExportExcel}
            className={styles.button}
            style={{ background: "#22c55e", color: "#fff", minWidth: 120 }}
          >
            Export Excel
          </button>
          <button
            onClick={handleExportPDF}
            className={styles.button}
            style={{ background: "#ef4444", color: "#fff", minWidth: 120 }}
          >
            Export PDF
          </button>
          <label
            className={styles.button}
            style={{
              background: "#fbbf24",
              color: "#222",
              cursor: "pointer",
              marginBottom: 0,
              minWidth: 120,
              textAlign: "center",
            }}
          >
            Import CSV
            <input
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              style={{ display: "none" }}
            />
          </label>
          <label
            className={styles.button}
            style={{
              background: "#a78bfa",
              color: "#222",
              cursor: "pointer",
              marginBottom: 0,
              minWidth: 120,
              textAlign: "center",
            }}
          >
            Import Excel
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleImportExcel}
              style={{ display: "none" }}
            />
          </label>
        </div>
      </div>
      <h2>Dashboard</h2>
      {error && (
        <div style={{ color: "#d32f2f", marginBottom: 12 }}>{error}</div>
      )}
      <div className={styles.section}>
        <div
          style={{
            marginBottom: 18,
            border: "1px solid #e5e7eb",
            borderRadius: 7,
            background: "#fff",
            padding: "10px 14px",
            boxShadow: "0 1px 4px rgba(30,64,175,0.03)",
            maxWidth: 600,
          }}
        >
          <div
            style={{
              fontWeight: 600,
              color: "#2563eb",
              marginBottom: 4,
              fontSize: 15,
            }}
          >
            Custom Fields
          </div>
          <div
            style={{
              color: "#444",
              fontSize: 13,
              marginBottom: 8,
            }}
          >
            Add extra fields to track information unique to your job search
            (e.g. <b>Salary</b>, <b>Recruiter</b>, <b>Interview Date</b>).
            Custom fields appear in the job form, table, and exports. Remove a
            field to delete it from all jobs.
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginBottom: 8,
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              value={newCustomField}
              onChange={(e) => setNewCustomField(e.target.value)}
              placeholder="Add custom field (e.g. Salary)"
              style={{
                padding: 5,
                borderRadius: 5,
                border: "1px solid #bbb",
                minWidth: 150,
                fontSize: 14,
                background: "#f9fafb",
              }}
            />
            <button
              onClick={handleAddCustomField}
              className={styles.button}
              style={{
                minWidth: 80,
                background: "#2563eb",
                color: "#fff",
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              Add
            </button>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {customFields.map((field) => (
              <span
                key={field}
                style={{
                  background: "#f3f4f6",
                  color: "#3730a3",
                  borderRadius: 5,
                  padding: "2px 10px",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 14,
                  border: "1px solid #e0e7ff",
                }}
              >
                {field}
                <button
                  onClick={() => handleRemoveCustomField(field)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#d32f2f",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 15,
                    marginLeft: 2,
                  }}
                  title="Remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <JobForm
          key={formKey}
          onSubmit={handleSubmit}
          initialData={
            editJob
              ? {
                  ...editJob,
                  tags: editJob.tags.join(", "),
                  notes: typeof editJob.notes === "string" ? editJob.notes : "",
                  favorite:
                    editJob.favorite !== undefined
                      ? String(editJob.favorite)
                      : "",
                  // Pass custom fields to form
                  ...Object.fromEntries(
                    customFields.map((f) => [f, (editJob as any)[f] || ""])
                  ),
                }
              : undefined
          }
          submitLabel={editJob ? "Update Job" : "Add Job"}
          onCancel={editJob ? () => setEditJob(null) : undefined}
          showCancel={!!editJob}
          customFields={customFields}
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
                <th className={styles.th}>Notes</th>
                {/* Custom fields headers */}
                {customFields.map((field) => (
                  <th className={styles.th} key={field}>
                    {field}
                  </th>
                ))}
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
                    <span
                      title={
                        typeof job.notes === "string" && job.notes.trim() !== ""
                          ? "Note present"
                          : "No note"
                      }
                      style={{ marginRight: 6, verticalAlign: "middle" }}
                    >
                      {typeof job.notes === "string" &&
                      job.notes.trim() !== "" ? (
                        <span style={{ color: "#2563eb", fontSize: 18 }}>
                          📝
                        </span>
                      ) : (
                        <span style={{ color: "#bbb", fontSize: 18 }}>—</span>
                      )}
                    </span>
                    <button
                      className={styles.actionBtn}
                      style={{
                        background: "#e8f0fe",
                        color: "#2563eb",
                        fontWeight: 600,
                        border: "1px solid #2563eb",
                        borderRadius: 6,
                        padding: "2px 10px",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setNoteModal({
                          open: true,
                          note:
                            typeof job.notes === "string"
                              ? job.notes
                              : job.notes === undefined
                              ? ""
                              : String(job.notes),
                        });
                        noteModalJobId.current = job._id;
                      }}
                      type="button"
                    >
                      View Note
                    </button>
                  </td>
                  {/* Custom fields values */}
                  {customFields.map((field) => (
                    <td className={styles.td} key={field}>
                      {(job as any)[field] || ""}
                    </td>
                  ))}
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
      {noteModal.open && (
        <NoteModal
          note={noteModal.note}
          onClose={() => setNoteModal({ open: false, note: "" })}
        />
      )}
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
