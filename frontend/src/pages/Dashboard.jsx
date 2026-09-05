
import { useEffect, useState } from "react";
import {
  BriefcaseBusiness,
  Edit3,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Plus,
  Settings,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../api";

function Dashboard() {
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [careerPage, setCareerPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobSaving, setJobSaving] = useState(false);
  const [jobError, setJobError] = useState("");

  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    location: "",
    job_type: "Full-time",
    department: "",
    is_open: true,
  });

  const loadDashboard = async () => {
    const [
      companyResponse,
      careerResponse,
      sectionsResponse,
      jobsResponse,
    ] = await Promise.all([
      api.get("/companies/my-company"),
      api.get("/careers/my-page"),
      api.get("/careers/my-page/sections"),
      api.get("/jobs/"),
    ]);

    setCompany(companyResponse.data);
    setCareerPage(careerResponse.data);
    setSections(sectionsResponse.data);
    setJobs(jobsResponse.data);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    loadDashboard()
      .catch((error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const openAddJobModal = () => {
    setEditingJob(null);

    setJobForm({
      title: "",
      description: "",
      location: "",
      job_type: "Full-time",
      department: "",
      is_open: true,
    });

    setJobError("");
    setShowJobModal(true);
  };

  const openEditJobModal = (job) => {
    setEditingJob(job);

    setJobForm({
      title: job.title || "",
      description: job.description || "",
      location: job.location || "",
      job_type: job.job_type || "Full-time",
      department: job.department || "",
      is_open: job.is_open,
    });

    setJobError("");
    setShowJobModal(true);
  };

  const closeJobModal = () => {
    if (jobSaving) {
      return;
    }

    setShowJobModal(false);
    setEditingJob(null);
    setJobError("");
  };

  const handleJobFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setJobForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleJobSubmit = async (event) => {
    event.preventDefault();

    setJobError("");

    if (!jobForm.title.trim() || !jobForm.location.trim()) {
      setJobError("Job title and location are required.");
      return;
    }

    try {
      setJobSaving(true);

      if (editingJob) {
        await api.put(`/jobs/${editingJob.id}`, {
          title: jobForm.title.trim(),
          description: jobForm.description.trim() || null,
          location: jobForm.location.trim(),
          job_type: jobForm.job_type,
          department: jobForm.department.trim() || null,
          is_open: jobForm.is_open,
        });
      } else {
        await api.post("/jobs/", {
          title: jobForm.title.trim(),
          description: jobForm.description.trim() || null,
          location: jobForm.location.trim(),
          job_type: jobForm.job_type,
          department: jobForm.department.trim() || null,
          is_open: jobForm.is_open,
        });
      }

      await loadDashboard();

      setShowJobModal(false);
      setEditingJob(null);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
        return;
      }

      setJobError(
        error.response?.data?.detail ||
          "Unable to save the job. Please try again."
      );
    } finally {
      setJobSaving(false);
    }
  };

  const handleDeleteJob = async (job) => {
    const confirmed = window.confirm(
      `Delete "${job.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/jobs/${job.id}`);

      setJobs((current) =>
        current.filter((item) => item.id !== job.id)
      );
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
      } else {
        window.alert("Unable to delete the job.");
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        Loading dashboard...
      </div>
    );
  }

  const publicUrl = company
    ? `/careers/${company.slug}`
    : "#";

  const visibleSections = sections.filter(
    (section) => section.is_visible
  );

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}

      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <BriefcaseBusiness size={20} />
          </div>

          <span>Careers Builder</span>
        </div>

        <nav className="sidebar-nav">
          <button
            className="sidebar-nav-item active"
            type="button"
            onClick={() => navigate("/dashboard")}
          >
            <LayoutDashboard size={18} />
            Overview
          </button>

          <button
            className="sidebar-nav-item"
            type="button"
            onClick={() => navigate("/builder")}
          >
            <FileText size={18} />
            Career Page
          </button>

          <button
            className="sidebar-nav-item"
            type="button"
            onClick={() =>
              document
                .getElementById("jobs-section")
                ?.scrollIntoView({
                  behavior: "smooth",
                })
            }
          >
            <BriefcaseBusiness size={18} />
            Jobs
          </button>

          {/* CANDIDATE VIEW */}

          <button
            className="sidebar-nav-item"
            type="button"
            onClick={() => {
              if (company?.slug) {
                navigate(`/careers/${company.slug}`);
              }
            }}
            disabled={!company?.slug}
            title="View the careers page as a candidate"
          >
            <Users size={18} />
            Candidate View
          </button>

          {/* SETTINGS */}

          <button
            className="sidebar-nav-item"
            type="button"
            onClick={() => navigate("/settings")}
            title="Manage company settings"
          >
            <Settings size={18} />
            Settings
          </button>
        </nav>

        <button
          className="sidebar-logout"
          type="button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Sign out
        </button>
      </aside>

      {/* MAIN */}

      <main className="dashboard-main">
        {/* HEADER */}

        <header className="dashboard-header">
          <div>
            <p className="dashboard-eyebrow">
              Recruiter workspace
            </p>

            <h1>Good to see you.</h1>

            <p className="dashboard-subtitle">
              Manage your careers experience
              and open roles.
            </p>
          </div>

          <div className="dashboard-company">
            <div className="company-avatar">
              {company?.name
                ?.charAt(0)
                .toUpperCase() || "C"}
            </div>

            <div>
              <strong>{company?.name}</strong>
              <span>Recruiter</span>
            </div>
          </div>
        </header>

        {/* STATS */}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FileText size={19} />
            </div>

            <div>
              <span>Career page</span>

              <strong>
                {careerPage?.is_published
                  ? "Published"
                  : "Draft"}
              </strong>
            </div>

            <span
              className={
                careerPage?.is_published
                  ? "status-dot published"
                  : "status-dot draft"
              }
            />
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <BriefcaseBusiness size={19} />
            </div>

            <div>
              <span>Open jobs</span>

              <strong>
                {
                  jobs.filter(
                    (job) => job.is_open
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">
              <LayoutDashboard size={19} />
            </div>

            <div>
              <span>Page sections</span>

              <strong>
                {visibleSections.length}
              </strong>
            </div>
          </div>
        </section>

        {/* CAREER + QUICK ACTIONS */}

        <section className="dashboard-grid">
          <div className="dashboard-card career-card">
            <div className="card-header">
              <div>
                <p className="card-label">
                  CAREER PAGE
                </p>

                <h2>
                  {careerPage?.headline ||
                    "Build your careers story"}
                </h2>
              </div>

              <span
                className={
                  careerPage?.is_published
                    ? "badge published-badge"
                    : "badge draft-badge"
                }
              >
                {careerPage?.is_published
                  ? "Published"
                  : "Draft"}
              </span>
            </div>

            <p className="card-description">
              {careerPage?.description ||
                "Create a compelling careers page that helps candidates understand your company and discover open roles."}
            </p>

            <div className="career-actions">
              <button
                className="primary-action"
                type="button"
                onClick={() => navigate("/builder")}
              >
                <FileText size={17} />
                Edit career page
              </button>

              <button
                className="secondary-action"
                type="button"
                onClick={() => navigate(publicUrl)}
              >
                <ExternalLink size={17} />
                Preview
              </button>
            </div>

            <div className="public-link">
              <span>Public careers page</span>

              <strong>
                /careers/{company?.slug}
              </strong>
            </div>
          </div>

          <div className="dashboard-card quick-card">
            <div className="card-header">
              <div>
                <p className="card-label">
                  QUICK ACTIONS
                </p>

                <h2>Keep building</h2>
              </div>
            </div>

            <button
              className="quick-action"
              type="button"
              onClick={() => navigate("/builder")}
            >
              <span className="quick-action-icon">
                <Plus size={17} />
              </span>

              <span>
                <strong>Add section</strong>

                <small>
                  Tell candidates more about
                  your company
                </small>
              </span>
            </button>

            <button
              className="quick-action"
              type="button"
              onClick={openAddJobModal}
            >
              <span className="quick-action-icon">
                <BriefcaseBusiness size={17} />
              </span>

              <span>
                <strong>Add job</strong>

                <small>
                  Publish a new opportunity
                </small>
              </span>
            </button>

            <button
              className="quick-action"
              type="button"
              onClick={() => navigate(publicUrl)}
            >
              <span className="quick-action-icon">
                <ExternalLink size={17} />
              </span>

              <span>
                <strong>
                  View public page
                </strong>

                <small>
                  See what candidates see
                </small>
              </span>
            </button>
          </div>
        </section>

        {/* JOB MANAGEMENT */}

        <section
          className="dashboard-card jobs-card"
          id="jobs-section"
        >
          <div className="card-header">
            <div>
              <p className="card-label">
                JOB MANAGEMENT
              </p>

              <h2>Jobs</h2>
            </div>

            <button
              className="secondary-action"
              type="button"
              onClick={openAddJobModal}
            >
              <Plus size={17} />
              Add job
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="empty-state">
              <BriefcaseBusiness size={24} />

              <strong>No jobs yet</strong>

              <span>
                Add your first position to
                start attracting candidates.
              </span>

              <button
                className="primary-action"
                type="button"
                onClick={openAddJobModal}
              >
                <Plus size={16} />
                Add your first job
              </button>
            </div>
          ) : (
            <div className="jobs-list">
              {jobs.map((job) => (
                <div
                  className="job-row"
                  key={job.id}
                >
                  <div className="job-main">
                    <div className="job-icon">
                      <BriefcaseBusiness size={17} />
                    </div>

                    <div>
                      <strong>{job.title}</strong>

                      <span>
                        {job.department ||
                          "General"}{" "}
                        · {job.location}
                      </span>
                    </div>
                  </div>

                  <div className="job-row-actions">
                    <span
                      className={
                        job.is_open
                          ? "job-status open"
                          : "job-status closed"
                      }
                    >
                      {job.is_open
                        ? "Open"
                        : "Closed"}
                    </span>

                    <span className="job-type">
                      {job.job_type}
                    </span>

                    <button
                      className="job-action-button"
                      type="button"
                      onClick={() =>
                        openEditJobModal(job)
                      }
                      aria-label={`Edit ${job.title}`}
                      title="Edit job"
                    >
                      <Edit3 size={15} />
                    </button>

                    <button
                      className="job-action-button delete-job-button"
                      type="button"
                      onClick={() =>
                        handleDeleteJob(job)
                      }
                      aria-label={`Delete ${job.title}`}
                      title="Delete job"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* JOB MODAL */}

      {showJobModal && (
        <div
          className="job-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeJobModal();
            }
          }}
        >
          <div
            className="job-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="job-modal-title"
          >
            <div className="job-modal-header">
              <div>
                <p className="card-label">
                  {editingJob
                    ? "EDIT POSITION"
                    : "NEW POSITION"}
                </p>

                <h2 id="job-modal-title">
                  {editingJob
                    ? "Edit job"
                    : "Add a new job"}
                </h2>
              </div>

              <button
                className="job-modal-close"
                type="button"
                onClick={closeJobModal}
                aria-label="Close"
                disabled={jobSaving}
              >
                <X size={18} />
              </button>
            </div>

            <form
              className="job-form"
              onSubmit={handleJobSubmit}
            >
              <div className="job-form-field">
                <label htmlFor="job-title">
                  Job title
                </label>

                <input
                  id="job-title"
                  name="title"
                  value={jobForm.title}
                  onChange={handleJobFormChange}
                  placeholder="AI/ML Engineer"
                  autoFocus
                />
              </div>

              <div className="job-form-grid">
                <div className="job-form-field">
                  <label htmlFor="job-location">
                    Location
                  </label>

                  <input
                    id="job-location"
                    name="location"
                    value={jobForm.location}
                    onChange={handleJobFormChange}
                    placeholder="Hyderabad"
                  />
                </div>

                <div className="job-form-field">
                  <label htmlFor="job-type">
                    Job type
                  </label>

                  <select
                    id="job-type"
                    name="job_type"
                    value={jobForm.job_type}
                    onChange={handleJobFormChange}
                  >
                    <option value="Full-time">
                      Full-time
                    </option>

                    <option value="Part-time">
                      Part-time
                    </option>

                    <option value="Internship">
                      Internship
                    </option>

                    <option value="Contract">
                      Contract
                    </option>
                  </select>
                </div>
              </div>

              <div className="job-form-field">
                <label htmlFor="job-department">
                  Department
                </label>

                <input
                  id="job-department"
                  name="department"
                  value={jobForm.department}
                  onChange={handleJobFormChange}
                  placeholder="Engineering"
                />
              </div>

              <div className="job-form-field">
                <label htmlFor="job-description">
                  Description
                </label>

                <textarea
                  id="job-description"
                  name="description"
                  value={jobForm.description}
                  onChange={handleJobFormChange}
                  placeholder="Describe the role and what the candidate will work on..."
                  rows={5}
                />
              </div>

              <label className="job-open-toggle">
                <input
                  type="checkbox"
                  name="is_open"
                  checked={jobForm.is_open}
                  onChange={handleJobFormChange}
                />

                <span>
                  <strong>
                    Open for applications
                  </strong>

                  <small>
                    Closed jobs won't appear on
                    the public careers page.
                  </small>
                </span>
              </label>

              {jobError && (
                <div
                  className="job-form-error"
                  role="alert"
                >
                  {jobError}
                </div>
              )}

              <div className="job-modal-actions">
                <button
                  type="button"
                  className="builder-secondary"
                  onClick={closeJobModal}
                  disabled={jobSaving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="builder-primary"
                  disabled={jobSaving}
                >
                  {jobSaving
                    ? "Saving..."
                    : editingJob
                    ? "Save changes"
                    : "Create job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;

