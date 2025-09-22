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
};

const JobForm: React.FC<JobFormProps> = ({
  initialData,
  onSubmit,
  submitLabel = "Add Job",
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
      >
        <option value="Applied">Applied</option>
        <option value="Interview">Interview</option>
        <option value="Offer">Offer</option>
        <option value="Rejected">Rejected</option>
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
      <button className={styles.button} type="submit">
        {submitLabel}
      </button>
    </form>
  );
};

export default JobForm;
