import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  ExternalLink,
  GripVertical,
  Image,
  Layers3,
  Link2,
  Loader2,
  Monitor,
  Palette,
  Plus,
  Save,
  Smartphone,
  Sparkles,
  Trash2,
  Video,
  Globe,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../api";

function CareerBuilder() {
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [careerPage, setCareerPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [jobs, setJobs] = useState([]);

  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#172033");
  const [secondaryColor, setSecondaryColor] = useState("#5267e8");

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [pageDirty, setPageDirty] = useState(false);

  const [previewMode, setPreviewMode] = useState("desktop");
  const [copied, setCopied] = useState(false);
  const [sectionSaving, setSectionSaving] = useState({});
  const [showSharePanel, setShowSharePanel] = useState(false);

  const publicUrl = company
    ? `${window.location.origin}/careers/${company.slug}`
    : "";

  const loadData = async () => {
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

    const page = careerResponse.data;

    setCompany(companyResponse.data);
    setCareerPage(page);
    setSections(sectionsResponse.data);
    setJobs(jobsResponse.data);

    setHeadline(page.headline || "");
    setDescription(page.description || "");
    setBannerUrl(page.banner_url || "");
    setVideoUrl(page.culture_video_url || "");
    setPrimaryColor(page.primary_color || "#172033");
    setSecondaryColor(page.secondary_color || "#5267e8");

    setPageDirty(false);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);

    loadData()
      .catch((error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
        } else {
          setMessage("Unable to load your career page.");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  const updateField = (setter) => (event) => {
    setter(event.target.value);
    setPageDirty(true);
    setMessage("");
  };

  const savePage = async () => {
    try {
      setSaving(true);
      setMessage("");

      await api.put("/careers/my-page", {
        headline,
        description,
        banner_url: bannerUrl || null,
        culture_video_url: videoUrl || null,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });

      setPageDirty(false);
      setMessage("Changes saved successfully.");

      await loadData();
    } catch {
      setMessage("Unable to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const publishPage = async () => {
    try {
      setPublishing(true);
      setMessage("");

      await api.put("/careers/my-page", {
        headline,
        description,
        banner_url: bannerUrl || null,
        culture_video_url: videoUrl || null,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      });

      const response = await api.post(
        "/careers/my-page/publish"
      );

      setCareerPage(response.data);
      setPageDirty(false);

      setMessage(
        response.data.is_published
          ? "Career page published successfully."
          : "Career page updated."
      );

      await loadData();
    } catch {
      setMessage("Unable to publish career page.");
    } finally {
      setPublishing(false);
    }
  };

  const openPreview = () => {
    if (!company) {
      return;
    }

    navigate(
      `/careers/${company.slug}/preview`
    );
  };

  const copyPublicLink = async () => {
    if (!publicUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setMessage("Unable to copy the public link.");
    }
  };

  const addSection = async () => {
    try {
      const nextOrder = sections.length + 1;

      const response = await api.post(
        "/careers/my-page/sections/",
        {
          section_type: "custom",
          title: "New section",
          content:
            "Tell candidates about your company.",
          display_order: nextOrder,
          is_visible: true,
        }
      );

      setSections((current) => [
        ...current,
        response.data,
      ]);

      setMessage("New section added.");
    } catch {
      setMessage("Unable to add section.");
    }
  };

  const updateSection = async (section) => {
    setSectionSaving((current) => ({
      ...current,
      [section.id]: true,
    }));

    try {
      const response = await api.put(
        `/careers/my-page/sections/${section.id}`,
        {
          section_type: section.section_type,
          title: section.title,
          content: section.content,
          display_order: section.display_order,
          is_visible: section.is_visible,
        }
      );

      setSections((current) =>
        current.map((item) =>
          item.id === section.id
            ? response.data
            : item
        )
      );
    } catch {
      setMessage("Unable to save this section.");
    } finally {
      setSectionSaving((current) => ({
        ...current,
        [section.id]: false,
      }));
    }
  };

  const updateLocalSection = (
    id,
    field,
    value
  ) => {
    setSections((current) =>
      current.map((section) =>
        section.id === id
          ? {
              ...section,
              [field]: value,
            }
          : section
      )
    );
  };

  const saveSectionField = (
    section,
    field,
    value
  ) => {
    const updated = {
      ...section,
      [field]: value,
    };

    updateLocalSection(
      section.id,
      field,
      value
    );

    updateSection(updated);
  };

  const deleteSection = async (id) => {
    try {
      await api.delete(
        `/careers/my-page/sections/${id}`
      );

      setSections((current) =>
        current.filter(
          (section) => section.id !== id
        )
      );

      setMessage("Section removed.");
    } catch {
      setMessage("Unable to remove section.");
    }
  };

  const moveSection = async (
    index,
    direction
  ) => {
    const newIndex = index + direction;

    if (
      newIndex < 0 ||
      newIndex >= sections.length
    ) {
      return;
    }

    const reordered = [...sections];

    [
      reordered[index],
      reordered[newIndex],
    ] = [
      reordered[newIndex],
      reordered[index],
    ];

    const ids = reordered.map(
      (section) => section.id
    );

    try {
      await api.put(
        "/careers/my-page/sections/reorder",
        ids
      );

      setSections(
        reordered.map((section, position) => ({
          ...section,
          display_order: position + 1,
        }))
      );
    } catch {
      setMessage("Unable to reorder sections.");
    }
  };

  const visibleSections = sections.filter(
    (section) => section.is_visible
  );

  const completion = useMemo(() => {
    const checks = [
      Boolean(headline.trim()),
      Boolean(description.trim()),
      Boolean(bannerUrl.trim()),
      sections.length > 0,
      jobs.length > 0,
    ];

    return Math.round(
      (checks.filter(Boolean).length /
        checks.length) *
        100
    );
  }, [
    headline,
    description,
    bannerUrl,
    sections,
    jobs,
  ]);

  if (loading || !careerPage || !company) {
    return (
      <div className="builder-loading">
        <div className="builder-loading-card">
          <div className="builder-loading-mark">
            <Sparkles size={20} />
          </div>

          <div>
            <strong>Preparing your builder</strong>
            <span>
              Loading your career page...
            </span>
          </div>

          <Loader2
            className="builder-loading-spinner"
            size={18}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="builder-page">
      {/* ================================
          TOP NAVIGATION
      ================================= */}

      <header className="builder-topbar">
        <div className="builder-topbar-inner">
          <div className="builder-brand">
            <button
              className="builder-back"
              onClick={() =>
                navigate("/dashboard")
              }
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={17} />
            </button>

            <div className="builder-brand-divider" />

            <div className="builder-brand-info">
              <span>CAREERS</span>
              <strong>{company.name}</strong>
            </div>
          </div>

          <div className="builder-top-actions">
            <div className="builder-save-state">
              {pageDirty ? (
                <>
                  <span className="builder-unsaved-dot" />
                  Unsaved changes
                </>
              ) : (
                <>
                  <CheckCircle2 size={15} />
                  All changes saved
                </>
              )}
            </div>

            <span
              className={
                "builder-publish-pill " +
                (careerPage.is_published
                  ? "is-published"
                  : "is-draft")
              }
            >
              <span />
              {careerPage.is_published
                ? "Published"
                : "Draft"}
            </span>

            <button
              className="builder-top-button"
              onClick={openPreview}
            >
              <Eye size={16} />
              Preview
            </button>

            {careerPage.is_published && (
              <button
                className="builder-top-button"
                onClick={() =>
                  setShowSharePanel(
                    (current) => !current
                  )
                }
              >
                <Link2 size={16} />
                Share
              </button>
            )}

            <button
              className="builder-publish-button"
              onClick={publishPage}
              disabled={
                publishing || saving
              }
            >
              <Globe size={16} />

              {publishing
                ? "Publishing..."
                : careerPage.is_published
                ? "Republish"
                : "Publish"}
            </button>

            <button
              className="builder-save-button"
              onClick={savePage}
              disabled={
                saving || publishing
              }
            >
              {saving ? (
                <Loader2
                  size={16}
                  className="button-spinner"
                />
              ) : (
                <Save size={16} />
              )}

              {saving
                ? "Saving..."
                : "Save changes"}
            </button>
          </div>
        </div>
      </header>

      {/* ================================
          SHARE PANEL
      ================================= */}

      {showSharePanel && (
        <div className="builder-share-panel">
          <div className="builder-share-inner">
            <div>
              <span>PUBLIC CAREERS PAGE</span>
              <strong>
                Share your careers page
              </strong>
              <p>
                Anyone with this link can view
                your published page.
              </p>
            </div>

            <div className="builder-share-link">
              <Link2 size={16} />

              <span>{publicUrl}</span>

              <button
                onClick={copyPublicLink}
                aria-label="Copy public careers link"
              >
                {copied ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>

            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="builder-open-link"
            >
              Open page
              <ExternalLink size={14} />
            </a>

            <button
              className="builder-share-close"
              onClick={() =>
                setShowSharePanel(false)
              }
              aria-label="Close share panel"
            >
              <X size={17} />
            </button>
          </div>
        </div>
      )}

      {/* ================================
          WORKSPACE
      ================================= */}

      <div className="builder-workspace">
        {/* ================================
            EDITOR SIDEBAR
        ================================= */}

        <aside className="builder-sidebar">
          <div className="builder-sidebar-scroll">
            <div className="builder-sidebar-intro">
              <div className="builder-sidebar-icon">
                <Sparkles size={18} />
              </div>

              <div>
                <span>PAGE BUILDER</span>
                <h1>
                  Make your story stand out.
                </h1>
              </div>
            </div>

            {/* Completion */}

            <div className="builder-completion-card">
              <div className="builder-completion-top">
                <div>
                  <span>PAGE READINESS</span>
                  <strong>{completion}%</strong>
                </div>

                <div className="builder-completion-ring">
                  {completion}
                </div>
              </div>

              <div className="builder-progress">
                <span
                  style={{
                    width: `${completion}%`,
                    backgroundColor:
                      secondaryColor,
                  }}
                />
              </div>

              <p>
                {completion === 100
                  ? "Your page has everything it needs."
                  : "Complete the essentials for a stronger candidate experience."}
              </p>
            </div>

            {/* Navigation */}

            <nav className="builder-section-nav">
              <a
                href="#introduction"
                className="active"
              >
                <span>01</span>
                Introduction
              </a>

              <a href="#brand">
                <span>02</span>
                Brand & media
              </a>

              <a href="#sections">
                <span>03</span>
                Page sections
              </a>

              <a href="#jobs">
                <span>04</span>
                Open roles
              </a>
            </nav>

            {/* Quick facts */}

            <div className="builder-sidebar-facts">
              <div>
                <span>OPEN ROLES</span>
                <strong>
                  {
                    jobs.filter(
                      (job) => job.is_open
                    ).length
                  }
                </strong>
              </div>

              <div>
                <span>SECTIONS</span>
                <strong>
                  {sections.length}
                </strong>
              </div>

              <div>
                <span>STATUS</span>
                <strong>
                  {careerPage.is_published
                    ? "Live"
                    : "Draft"}
                </strong>
              </div>
            </div>
          </div>
        </aside>

        {/* ================================
            MAIN EDITOR
        ================================= */}

        <main className="builder-editor">
          <div className="builder-editor-inner">
            {/* Introduction */}

            <section
              className="builder-panel"
              id="introduction"
            >
              <div className="builder-panel-header">
                <div className="builder-panel-number">
                  01
                </div>

                <div>
                  <span>
                    FIRST IMPRESSION
                  </span>
                  <h2>
                    Tell candidates who you
                    are.
                  </h2>
                  <p>
                    Your headline and company
                    story are the first things
                    candidates will see.
                  </p>
                </div>
              </div>

              <div className="builder-form">
                <div className="builder-field">
                  <div className="builder-field-label">
                    <label htmlFor="headline">
                      Page headline
                    </label>

                    <span>
                      {headline.length}/255
                    </span>
                  </div>

                  <input
                    id="headline"
                    className="builder-modern-input builder-headline-input"
                    value={headline}
                    maxLength={255}
                    onChange={updateField(
                      setHeadline
                    )}
                    placeholder="Build the future with us"
                  />

                  <small>
                    A concise statement that
                    captures why someone should
                    join.
                  </small>
                </div>

                <div className="builder-field">
                  <div className="builder-field-label">
                    <label htmlFor="description">
                      Company story
                    </label>

                    <span>
                      {description.length}
                    </span>
                  </div>

                  <textarea
                    id="description"
                    className="builder-modern-textarea"
                    value={description}
                    onChange={updateField(
                      setDescription
                    )}
                    placeholder="Tell candidates what your company builds, what you believe in, and why they should join..."
                    rows={7}
                  />

                  <small>
                    Keep it authentic. Candidates
                    want to understand the mission,
                    culture, and impact.
                  </small>
                </div>
              </div>
            </section>

            {/* Brand */}

            <section
              className="builder-panel"
              id="brand"
            >
              <div className="builder-panel-header">
                <div className="builder-panel-number">
                  02
                </div>

                <div>
                  <span>
                    VISUAL IDENTITY
                  </span>
                  <h2>
                    Make it unmistakably yours.
                  </h2>
                  <p>
                    Shape the page around your
                    brand through imagery, color,
                    and culture.
                  </p>
                </div>

                <Palette size={19} />
              </div>

              <div className="builder-form">
                <div className="builder-two-column">
                  <div className="builder-field">
                    <div className="builder-field-label">
                      <label htmlFor="banner">
                        <Image size={14} />
                        Banner image
                      </label>
                    </div>

                    <input
                      id="banner"
                      className="builder-modern-input"
                      value={bannerUrl}
                      onChange={updateField(
                        setBannerUrl
                      )}
                      placeholder="https://images.example.com/banner.jpg"
                    />

                    <small>
                      Use a wide, high-resolution
                      image for the hero.
                    </small>
                  </div>

                  <div className="builder-field">
                    <div className="builder-field-label">
                      <label htmlFor="video">
                        <Video size={14} />
                        Culture video
                      </label>
                    </div>

                    <input
                      id="video"
                      className="builder-modern-input"
                      value={videoUrl}
                      onChange={updateField(
                        setVideoUrl
                      )}
                      placeholder="https://youtube.com/..."
                    />

                    <small>
                      Optional. Introduce candidates
                      to your people and workplace.
                    </small>
                  </div>
                </div>

                <div className="builder-color-area">
                  <div>
                    <div className="builder-field-label">
                      <label>
                        <Palette size={14} />
                        Brand colors
                      </label>
                    </div>

                    <p>
                      These colors are used across
                      the public careers experience.
                    </p>
                  </div>

                  <div className="builder-color-controls">
                    <div className="builder-color-picker">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(event) => {
                          setPrimaryColor(
                            event.target.value
                          );
                          setPageDirty(true);
                        }}
                      />

                      <div>
                        <span>Primary</span>
                        <strong>
                          {primaryColor.toUpperCase()}
                        </strong>
                      </div>
                    </div>

                    <div className="builder-color-picker">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(event) => {
                          setSecondaryColor(
                            event.target.value
                          );
                          setPageDirty(true);
                        }}
                      />

                      <div>
                        <span>Accent</span>
                        <strong>
                          {secondaryColor.toUpperCase()}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Sections */}

            <section
              className="builder-panel"
              id="sections"
            >
              <div className="builder-panel-header">
                <div className="builder-panel-number">
                  03
                </div>

                <div>
                  <span>
                    CONTENT BLOCKS
                  </span>
                  <h2>
                    Build your candidate story.
                  </h2>
                  <p>
                    Add, edit, reorder, or hide
                    sections to shape your careers
                    page.
                  </p>
                </div>

                <button
                  className="builder-add-button"
                  onClick={addSection}
                >
                  <Plus size={16} />
                  Add section
                </button>
              </div>

              <div className="builder-section-list">
                {sections.length === 0 ? (
                  <div className="builder-empty-sections">
                    <div>
                      <Layers3 size={22} />
                    </div>

                    <strong>
                      Your page needs a story.
                    </strong>

                    <p>
                      Add your first content section
                      to tell candidates about life
                      at your company.
                    </p>

                    <button
                      onClick={addSection}
                    >
                      <Plus size={15} />
                      Add first section
                    </button>
                  </div>
                ) : (
                  sections.map(
                    (section, index) => (
                      <article
                        className={
                          "builder-section-card " +
                          (!section.is_visible
                            ? "is-hidden"
                            : "")
                        }
                        key={section.id}
                      >
                        <div className="builder-section-card-header">
                          <div className="builder-section-card-title">
                            <div className="builder-drag-handle">
                              <GripVertical
                                size={17}
                              />
                            </div>

                            <div className="builder-section-index">
                              {String(
                                index + 1
                              ).padStart(2, "0")}
                            </div>

                            <div>
                              <strong>
                                {section.title ||
                                  "Untitled section"}
                              </strong>

                              <span>
                                {section.is_visible
                                  ? "Visible to candidates"
                                  : "Hidden from candidates"}
                              </span>
                            </div>
                          </div>

                          <div className="builder-section-actions">
                            <button
                              onClick={() =>
                                moveSection(
                                  index,
                                  -1
                                )
                              }
                              disabled={
                                index === 0
                              }
                              aria-label="Move section up"
                            >
                              <ChevronUp
                                size={16}
                              />
                            </button>

                            <button
                              onClick={() =>
                                moveSection(
                                  index,
                                  1
                                )
                              }
                              disabled={
                                index ===
                                sections.length -
                                  1
                              }
                              aria-label="Move section down"
                            >
                              <ChevronDown
                                size={16}
                              />
                            </button>

                            <button
                              className="builder-delete-button"
                              onClick={() =>
                                deleteSection(
                                  section.id
                                )
                              }
                              aria-label="Delete section"
                            >
                              <Trash2
                                size={15}
                              />
                            </button>
                          </div>
                        </div>

                        <div className="builder-section-card-body">
                          <div className="builder-field">
                            <label>
                              Section title
                            </label>

                            <input
                              className="builder-modern-input"
                              value={
                                section.title ||
                                ""
                              }
                              onChange={(event) =>
                                updateLocalSection(
                                  section.id,
                                  "title",
                                  event.target
                                    .value
                                )
                              }
                              onBlur={() =>
                                saveSectionField(
                                  section,
                                  "title",
                                  section.title ||
                                    ""
                                )
                              }
                            />
                          </div>

                          <div className="builder-field">
                            <div className="builder-field-label">
                              <label>
                                Section content
                              </label>

                              {sectionSaving[
                                section.id
                              ] && (
                                <span className="builder-saving-indicator">
                                  <Loader2
                                    size={12}
                                  />
                                  Saving
                                </span>
                              )}
                            </div>

                            <textarea
                              className="builder-modern-textarea"
                              value={
                                section.content ||
                                ""
                              }
                              onChange={(event) =>
                                updateLocalSection(
                                  section.id,
                                  "content",
                                  event.target
                                    .value
                                )
                              }
                              onBlur={() =>
                                saveSectionField(
                                  section,
                                  "content",
                                  section.content ||
                                    ""
                                )
                              }
                              rows={5}
                            />
                          </div>

                          <label className="builder-visibility">
                            <input
                              type="checkbox"
                              checked={
                                section.is_visible
                              }
                              onChange={(
                                event
                              ) => {
                                saveSectionField(
                                  section,
                                  "is_visible",
                                  event.target
                                    .checked
                                );
                              }}
                            />

                            <span className="builder-custom-checkbox">
                              <Check size={12} />
                            </span>

                            <span>
                              <strong>
                                Show this section
                              </strong>

                              <small>
                                Visible on the public
                                careers page
                              </small>
                            </span>
                          </label>
                        </div>
                      </article>
                    )
                  )
                )}
              </div>
            </section>

            {/* Jobs */}

            <section
              className="builder-panel"
              id="jobs"
            >
              <div className="builder-panel-header">
                <div className="builder-panel-number">
                  04
                </div>

                <div>
                  <span>
                    OPEN POSITIONS
                  </span>
                  <h2>
                    Your opportunities are live
                    here.
                  </h2>
                  <p>
                    Jobs are managed separately and
                    automatically appear on your
                    careers page.
                  </p>
                </div>

                <div className="builder-job-summary">
                  <strong>
                    {
                      jobs.filter(
                        (job) => job.is_open
                      ).length
                    }
                  </strong>
                  <span>open roles</span>
                </div>
              </div>

              {jobs.filter(
                (job) => job.is_open
              ).length > 0 ? (
                <div className="builder-job-preview-list">
                  {jobs
                    .filter(
                      (job) => job.is_open
                    )
                    .slice(0, 5)
                    .map((job) => (
                      <div
                        className="builder-job-preview-item"
                        key={job.id}
                      >
                        <div className="builder-job-preview-icon">
                          <Layers3 size={16} />
                        </div>

                        <div>
                          <strong>
                            {job.title}
                          </strong>

                          <span>
                            {job.location} ·{" "}
                            {job.job_type}
                          </span>
                        </div>

                        <CheckCircle2
                          size={16}
                        />
                      </div>
                    ))}
                </div>
              ) : (
                <div className="builder-no-jobs">
                  <AlertCircle size={18} />

                  <div>
                    <strong>
                      No open roles yet
                    </strong>

                    <span>
                      Add jobs from your dashboard
                      and they'll appear here
                      automatically.
                    </span>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>

        {/* ================================
            LIVE PREVIEW
        ================================= */}

        <aside className="builder-preview-column">
          <div className="builder-preview-sticky">
            <div className="builder-preview-toolbar">
              <div>
                <span>LIVE CANVAS</span>
                <strong>
                  Candidate experience
                </strong>
              </div>

              <div className="builder-preview-device-switcher">
                <button
                  className={
                    previewMode === "desktop"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setPreviewMode("desktop")
                  }
                  aria-label="Desktop preview"
                >
                  <Monitor size={15} />
                </button>

                <button
                  className={
                    previewMode === "mobile"
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setPreviewMode("mobile")
                  }
                  aria-label="Mobile preview"
                >
                  <Smartphone size={15} />
                </button>
              </div>
            </div>

            <div
              className={
                "builder-preview-shell " +
                (previewMode === "mobile"
                  ? "mobile-preview"
                  : "")
              }
            >
              <div className="builder-preview-browser">
                <div className="builder-preview-browser-top">
                  <div className="builder-browser-dots">
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className="builder-browser-address">
                    {company.slug}.careers
                  </div>

                  <div />
                </div>

                <div className="builder-preview-page">
                  {/* Hero */}

                  <div
                    className="builder-live-hero"
                    style={{
                      backgroundColor:
                        primaryColor,
                      backgroundImage:
                        bannerUrl
                          ? `linear-gradient(rgba(0,0,0,.45),rgba(0,0,0,.45)),url(${bannerUrl})`
                          : "none",
                    }}
                  >
                    <div className="builder-live-brand">
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt=""
                        />
                      ) : (
                        <div>
                          {company.name
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <span>
                        {company.name}
                      </span>
                    </div>

                    <small>CAREERS</small>

                    <h3>
                      {headline ||
                        "Build the future with us"}
                    </h3>

                    <p>
                      {description ||
                        "Your company story will appear here."}
                    </p>
                  </div>

                  {/* Story */}

                  <div className="builder-live-content">
                    <div className="builder-live-intro">
                      <span>OUR STORY</span>

                      <h4>
                        We are building something
                        meaningful.
                      </h4>

                      <p>
                        {description ||
                          "Learn more about our company, culture, and the people building the future with us."}
                      </p>
                    </div>

                    {/* Sections */}

                    {visibleSections.map(
                      (section) => (
                        <div
                          className="builder-live-section"
                          key={section.id}
                        >
                          <span>
                            {section.section_type ===
                            "custom"
                              ? "ABOUT US"
                              : section.section_type
                                  .replace(
                                    /_/g,
                                    " "
                                  )
                                  .toUpperCase()}
                          </span>

                          <h4>
                            {section.title ||
                              "Our company"}
                          </h4>

                          <p>
                            {section.content ||
                              "Discover what makes our company a great place to work."}
                          </p>
                        </div>
                      )
                    )}

                    {/* Video */}

                    {videoUrl && (
                      <div className="builder-live-video">
                        <span>
                          LIFE AT{" "}
                          {company.name.toUpperCase()}
                        </span>

                        <h4>
                          See what life is like
                          here.
                        </h4>

                        <div>
                          <Video size={17} />

                          <span>
                            Watch our culture video
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Jobs */}

                    <div
                      className="builder-live-jobs"
                      style={{
                        borderTopColor:
                          secondaryColor,
                      }}
                    >
                      <div className="builder-live-jobs-heading">
                        <span>
                          OPPORTUNITIES
                        </span>

                        <strong>
                          Open positions
                        </strong>

                        <p>
                          Find your next opportunity
                          at {company.name}.
                        </p>
                      </div>

                      {jobs
                        .filter(
                          (job) => job.is_open
                        )
                        .slice(0, 3)
                        .map((job) => (
                          <div
                            className="builder-live-job"
                            key={job.id}
                          >
                            <div>
                              <strong>
                                {job.title}
                              </strong>

                              <span>
                                {job.location} ·{" "}
                                {job.job_type}
                              </span>
                            </div>

                            <ArrowLeft
                              size={14}
                              style={{
                                transform:
                                  "rotate(180deg)",
                              }}
                            />
                          </div>
                        ))}

                      {jobs.filter(
                        (job) => job.is_open
                      ).length > 3 && (
                        <small className="builder-live-more-jobs">
                          +
                          {jobs.filter(
                            (job) =>
                              job.is_open
                          ).length - 3}{" "}
                          more open roles
                        </small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="builder-preview-footer">
              <div>
                <CheckCircle2 size={15} />
                Preview updates as you edit
              </div>

              <button onClick={openPreview}>
                Full preview
                <ExternalLink size={13} />
              </button>
            </div>
          </div>
        </aside>
      </div>

      {/* ================================
          BOTTOM STATUS
      ================================= */}

      {message && (
        <div className="builder-toast">
          {message.includes("Unable") ? (
            <AlertCircle size={16} />
          ) : (
            <CheckCircle2 size={16} />
          )}

          <span>{message}</span>

          <button
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

export default CareerBuilder;