import { useState, useMemo } from "react";
import JobForm, { type JobFormData } from "../components/JobForm";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import styles from "./Dashboard.module.css";

type Job = {
  id: number;
  company: string;
  position: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  date: string;
  tags: string[];
};

const mockJobs: Job[] = [
  {
    id: 1,
    company: "Acme Corp",
    position: "Frontend Developer",
    status: "Applied",
    date: "2025-09-19",
    tags: ["react", "remote"],
  },
  {
    id: 2,
    company: "Beta Inc",
    position: "Backend Developer",
    status: "Interview",
    date: "2025-09-15",
    tags: ["node", "onsite"],
  },
  {
    id: 3,
    company: "Gamma LLC",
    position: "Fullstack Engineer",
    status: "Offer",
    date: "2025-09-10",
    tags: ["typescript", "remote"],
  },
  {
    id: 4,
    company: "Acme Corp",
    position: "QA Tester",
    status: "Rejected",
    date: "2025-09-05",
    tags: ["qa"],
  },
];

const Dashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);
  const [companyFilter, setCompanyFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tagsFilter, setTagsFilter] = useState("");

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const companyMatch =
        companyFilter === "" ||
        job.company.toLowerCase().includes(companyFilter.toLowerCase());
      const statusMatch = statusFilter === "" || job.status === statusFilter;
      const tagsMatch =
        tagsFilter === "" ||
        job.tags.some((tag) =>
          tag.toLowerCase().includes(tagsFilter.toLowerCase())
        );
      return companyMatch && statusMatch && tagsMatch;
    });
  }, [jobs, companyFilter, statusFilter, tagsFilter]);

  // Chart data: count jobs per week (mocked for now)
  const chartData = [
    { week: "2025-09-01", applications: 2 },
    { week: "2025-09-08", applications: 1 },
    { week: "2025-09-15", applications: 1 },
  ];

  // Pie chart data: success rate
  const offerCount = jobs.filter((j) => j.status === "Offer").length;
  const rejectedCount = jobs.filter((j) => j.status === "Rejected").length;
  const otherCount = jobs.length - offerCount - rejectedCount;
  const pieData = [
    { name: "Offers", value: offerCount },
    { name: "Rejected", value: rejectedCount },
    { name: "Other", value: otherCount },
  ];
  const pieColors = ["#28a745", "#dc3545", "#007bff"];

  const handleAddJob = (data: JobFormData) => {
    setJobs([
      ...jobs,
      {
        id: jobs.length + 1,
        company: data.company,
        position: data.position,
        status: data.status,
        date: data.date,
        tags: data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      },
    ]);
  };

  return (
    <div className={styles.container}>
      <h2>Dashboard</h2>
      {/* Add Job Form */}
      <JobForm onSubmit={handleAddJob} submitLabel="Add Job" />

      {/* Filters Section */}
      <section className={styles.section}>
        <h3>Filters</h3>
        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Company"
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">Status</option>
            <option value="Applied">Applied</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
          <input
            type="text"
            placeholder="Tags"
            value={tagsFilter}
            onChange={(e) => setTagsFilter(e.target.value)}
          />
        </div>
      </section>

      {/* Job List Section */}
      <section className={styles.section}>
        <h3>Job Applications</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>Company</th>
              <th className={styles.th}>Position</th>
              <th className={styles.th}>Status</th>
              <th className={styles.th}>Date</th>
              <th className={styles.th}>Tags</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td
                  className={styles.td}
                  colSpan={5}
                  style={{ textAlign: "center" }}
                >
                  No jobs found.
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job.id}>
                  <td className={styles.td}>{job.company}</td>
                  <td className={styles.td}>{job.position}</td>
                  <td className={styles.td}>{job.status}</td>
                  <td className={styles.td}>{job.date}</td>
                  <td className={styles.td}>{job.tags.join(", ")}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Charts Section */}
      <section className={styles.section}>
        <h3>Statistics</h3>
        <div className={styles.chartsGrid}>
          <div style={{ flex: 1, minWidth: 250 }}>
            <h4 className={styles.chartTitle}>Applications per Week</h4>
            <div className={styles.charts}>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 10, bottom: 30 }}
                >
                  <XAxis
                    dataKey="week"
                    label={{
                      value: "Week",
                      position: "insideBottom",
                      offset: -10,
                    }}
                  />
                  <YAxis
                    allowDecimals={false}
                    label={{
                      value: "Applications",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                    }}
                  />
                  <Tooltip />
                  <Legend verticalAlign="top" height={36} />
                  <Bar
                    dataKey="applications"
                    fill="#007bff"
                    name="Applications"
                    label={{ position: "top", fill: "#333", fontSize: 12 }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 250 }}>
            <h4 className={styles.chartTitle}>Success Rate</h4>
            <div className={styles.charts}>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label={({ name, percent }) =>
                      `${name}: ${((percent as number) * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((_entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={pieColors[idx % pieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value}`, name]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
