import React, { useState, useEffect } from "react";
import styles from "./JobForm.module.css";

export type JobFormData = {
  company: string;
  position: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  date: string;
  tags: string;
  notes?: string;
};

type JobFormProps = {
  initialData?: JobFormData & Record<string, string>;
  onSubmit: (data: JobFormData & Record<string, string>) => void;
  submitLabel?: string;
  onCancel?: () => void;
  showCancel?: boolean;
  customFields?: string[];
};

const JobForm: React.FC<JobFormProps> = ({
  initialData,
  onSubmit,
  submitLabel = "Add Job",
  onCancel,
  showCancel = false,
  customFields = [],
}) => {
  // Format date as YYYY-MM-DD if initialData is present and date is not already in that format
  function formatDate(date: string) {
    if (!date) return "";
    // If already in YYYY-MM-DD, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return date;
    // Try to parse and format
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  }

  const [form, setForm] = useState<JobFormData & Record<string, string>>(
    initialData
      ? {
          ...initialData,
          date: formatDate(initialData.date),
          notes: initialData.notes || "",
          // Ensure all custom fields are present
          ...Object.fromEntries(
            (customFields || []).map((f) => [f, initialData[f] || ""])
          ),
        }
      : {
          company: "",
          position: "",
          status: "Applied",
          date: "",
          tags: "",
          notes: "",
          ...Object.fromEntries((customFields || []).map((f) => [f, ""])),
        }
  );

  // Update form state when initialData or customFields change (for edit mode)
  useEffect(() => {
    if (initialData) {
      setForm({
        ...initialData,
        date: formatDate(initialData.date),
        notes: initialData.notes || "",
        ...Object.fromEntries(
          (customFields || []).map((f) => [f, initialData[f] || ""])
        ),
      });
    } else {
      setForm({
        company: "",
        position: "",
        status: "Applied",
        date: "",
        tags: "",
        notes: "",
        ...Object.fromEntries((customFields || []).map((fld) => [fld, ""])),
      });
    }
  }, [initialData, customFields]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Helper to clear form fields
  const clearForm = () => {
    setForm({
      company: "",
      position: "",
      status: "Applied",
      date: "",
      tags: "",
      notes: "",
      ...Object.fromEntries((customFields || []).map((f) => [f, ""])),
    });
  };

  return (
    <>
      <div className={styles.welcomeTitle}>Welcome to Your Job Tracker!</div>
      <div className={styles.infoBox}>
        <ul>
          <li>
            Use this dashboard to add, edit, and manage your job applications.
          </li>
          <li>
            Fill in all fields to add a new job. Use tags (comma separated) for
            skills, locations, or notes.
          </li>
          <li>
            <b>Status meanings:</b>
          </li>
          <ul>
            <li>
              <b>Applied</b>: You’ve submitted your application.
            </li>
            <li>
              <b>Interview</b>: You’ve been invited to interview.
            </li>
            <li>
              <b>Offer</b>: You’ve received a job offer.
            </li>
            <li>
              <b>Rejected</b>: The application was unsuccessful.
            </li>
          </ul>
          <li>Click “Edit” to update a job, or “Delete” to remove it.</li>
          <li>
            Use the filters and search to quickly find jobs by company,
            position, or status.
          </li>
        </ul>
      </div>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.input}
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
          required
        />
        <input
          className={styles.input}
          name="position"
          placeholder="Position"
          value={form.position}
          onChange={handleChange}
          required
        />
        <select
          className={styles.select}
          name="status"
          value={form.status}
          onChange={handleChange}
          required
          style={{ color: form.status ? "#222" : "#888", background: "#fff" }}
        >
          <option value="" disabled hidden>
            Select job status
          </option>
          <option value="Applied">📝 Applied</option>
          <option value="Interview">💬 Interview</option>
          <option value="Offer">💼 Offer</option>
          <option value="Rejected">🚫 Rejected</option>
        </select>
        <input
          className={styles.input}
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <input
          className={styles.input}
          name="tags"
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={handleChange}
        />
        <textarea
          className={styles.input}
          name="notes"
          placeholder="Notes or comments (optional)"
          value={form.notes}
          onChange={handleChange}
          rows={2}
          style={{ gridColumn: "1 / span 2", resize: "vertical" }}
        />
        {/* Render custom fields */}
        {customFields.map((field) => (
          <input
            key={field}
            className={styles.input}
            name={field}
            placeholder={field}
            value={form[field] || ""}
            onChange={handleChange}
            style={{ gridColumn: "1 / span 2" }}
          />
        ))}
        <div style={{ display: "flex", gap: 8 }}>
          <button className={styles.button} type="submit">
            {submitLabel}
          </button>
          <button
            type="button"
            className={styles.button}
            style={{
              background: "#f3f4f6",
              color: "#2563eb",
              border: "1px solid #2563eb",
            }}
            onClick={clearForm}
            title="Clear all fields"
          >
            Clear
          </button>
          {showCancel && onCancel && (
            <button
              type="button"
              className={styles.button}
              style={{ background: "#eee", color: "#333" }}
              onClick={() => {
                clearForm();
                onCancel();
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </>
  );
};

export default JobForm;
