import React, { useState } from "react";
import styles from "./JobForm.module.css";

export type JobFormData = {
  company: string;
  position: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  date: string;
  tags: string;
};

type JobFormProps = {
  initialData?: JobFormData;
  onSubmit: (data: JobFormData) => void;
  submitLabel?: string;
  onCancel?: () => void;
  showCancel?: boolean;
};

const JobForm: React.FC<JobFormProps> = ({
  initialData,
  onSubmit,
  submitLabel = "Add Job",
  onCancel,
  showCancel = false,
}) => {
  const [form, setForm] = useState<JobFormData>(
    initialData || {
      company: "",
      position: "",
      status: "Applied",
      date: "",
      tags: "",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
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
        <div style={{ display: "flex", gap: 8 }}>
          <button className={styles.button} type="submit">
            {submitLabel}
          </button>
          {showCancel && onCancel && (
            <button
              type="button"
              className={styles.button}
              style={{ background: "#eee", color: "#333" }}
              onClick={onCancel}
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
