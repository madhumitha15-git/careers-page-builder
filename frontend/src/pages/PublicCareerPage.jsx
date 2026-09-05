import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  MapPin,
  Search,
  Video,
} from "lucide-react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";

import api from "../api";

function PublicCareerPage() {
  const { companySlug } = useParams();
  const navigate = useNavigate();

  const isPreview =
    window.location.pathname.endsWith(
      "/preview"
    );

  const [data, setData] = useState(null);

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadCareerPage = async () => {
      try {
        setLoading(true);
        setError("");

        const endpoint = isPreview
          ? "/careers/my-page/preview"
          : `/public/${companySlug}`;

        const response = await api.get(
          endpoint
        );

        setData(response.data);

        const companyName =
          response.data.company?.name ||
          "Careers";

        const headline =
          response.data.career_page?.headline ||
          "Join our team";

        document.title = isPreview
          ? `Preview | ${companyName}`
          : `${headline} | ${companyName}`;

        const description =
          response.data.career_page?.description ||
          `Explore careers and open positions at ${companyName}.`;

        let metaDescription =
          document.querySelector(
            'meta[name="description"]'
          );

        if (!metaDescription) {
          metaDescription =
            document.createElement("meta");

          metaDescription.setAttribute(
            "name",
            "description"
          );

          document.head.appendChild(
            metaDescription
          );
        }

        metaDescription.setAttribute(
          "content",
          description.slice(0, 160)
        );

        if (!isPreview) {
          let canonical =
            document.querySelector(
              'link[rel="canonical"]'
            );

          if (!canonical) {
            canonical =
              document.createElement(
                "link"
              );

            canonical.setAttribute(
              "rel",
              "canonical"
            );

            document.head.appendChild(
              canonical
            );
          }

          canonical.setAttribute(
            "href",
            window.location.href
          );
        }
      } catch (err) {
        if (
          err.response?.status === 401
        ) {
          localStorage.removeItem(
            "access_token"
          );

          navigate("/login");
          return;
        }

        if (
          err.response?.status === 404
        ) {
          setError(
            isPreview
              ? "Preview is unavailable. Make sure your career page exists."
              : "This careers page does not exist or has not been published yet."
          );
        } else {
          setError(
            "Unable to load this careers page."
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadCareerPage();
  }, [
    companySlug,
    isPreview,
    navigate,
  ]);

  const jobs = data?.jobs || [];

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.title
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesLocation =
        !location ||
        job.location
          .toLowerCase()
          .includes(location.toLowerCase());

      const matchesJobType =
        !jobType ||
        job.job_type
          .toLowerCase()
          .includes(jobType.toLowerCase());

      return (
        matchesSearch &&
        matchesLocation &&
        matchesJobType
      );
    });
  }, [
    jobs,
    search,
    location,
    jobType,
  ]);

  const locations = useMemo(() => {
    return [
      ...new Set(
        jobs
          .map((job) => job.location)
          .filter(Boolean)
      ),
    ];
  }, [jobs]);

  const jobTypes = useMemo(() => {
    return [
      ...new Set(
        jobs
          .map((job) => job.job_type)
          .filter(Boolean)
      ),
    ];
  }, [jobs]);

  /*
   * SEO structured data
   *
   * Public pages expose:
   * 1. Organization schema
   * 2. JobPosting schema for every open position
   *
   * Preview pages intentionally do not add
   * structured data because preview content
   * should not be treated as public content.
   */
  useEffect(() => {
    if (!data || isPreview) {
      return;
    }

    const company = data.company;
    const careerPage =
      data.career_page;

    const existingOrganizationScript =
      document.querySelector(
        "#career-page-structured-data"
      );

    if (existingOrganizationScript) {
      existingOrganizationScript.remove();
    }

    const organizationData = {
      "@context":
        "https://schema.org",
      "@type": "Organization",
      name: company.name,
      url: window.location.href,
      description:
        careerPage.description ||
        undefined,
    };

    if (company.logo_url) {
      organizationData.logo =
        company.logo_url;
    }

    const organizationScript =
      document.createElement(
        "script"
      );

    organizationScript.id =
      "career-page-structured-data";

    organizationScript.type =
      "application/ld+json";

    organizationScript.textContent =
      JSON.stringify(
        organizationData
      );

    document.head.appendChild(
      organizationScript
    );

    /*
     * JobPosting structured data
     */
    const existingJobScripts =
      document.querySelectorAll(
        ".job-posting-structured-data"
      );

    existingJobScripts.forEach(
      (script) => script.remove()
    );

    const jobPostingScripts =
      jobs.map((job) => {
        const jobData = {
          "@context":
            "https://schema.org",
          "@type": "JobPosting",

          title: job.title,

          description:
            job.description ||
            `${job.title} opportunity at ${company.name}.`,

          datePosted:
            job.created_at
              ? new Date(
                  job.created_at
                )
                  .toISOString()
                  .split("T")[0]
              : new Date()
                  .toISOString()
                  .split("T")[0],

          employmentType:
            job.job_type,

          hiringOrganization: {
            "@type":
              "Organization",
            name: company.name,
            sameAs:
              window.location.origin +
              `/careers/${companySlug}`,
          },

          jobLocation: {
            "@type":
              "Place",
            address: {
              "@type":
                "PostalAddress",
              addressLocality:
                job.location,
            },
          },

          url:
            window.location.origin +
            `/careers/${companySlug}#job-${job.id}`,
        };

        const script =
          document.createElement(
            "script"
          );

        script.className =
          "job-posting-structured-data";

        script.type =
          "application/ld+json";

        script.textContent =
          JSON.stringify(jobData);

        document.head.appendChild(
          script
        );

        return script;
      });

    return () => {
      organizationScript.remove();

      jobPostingScripts.forEach(
        (script) => script.remove()
      );
    };
  }, [
    data,
    jobs,
    companySlug,
    isPreview,
  ]);

  if (loading) {
    return (
      <main className="public-loading">
        <div>
          <div className="public-loading-spinner" />

          <p>
            {isPreview
              ? "Loading preview..."
              : "Loading careers page..."}
          </p>
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="public-error">
        <div className="public-error-card">
          <Building2 size={32} />

          <h1>
            {isPreview
              ? "Preview unavailable"
              : "Careers page unavailable"}
          </h1>

          <p>
            {error ||
              "We couldn't load this careers page."}
          </p>
        </div>
      </main>
    );
  }

  const {
    company,
    career_page,
    sections,
  } = data;

  return (
    <main
      className="public-careers-page"
      style={{
        "--public-primary":
          career_page.primary_color ||
          "#172033",

        "--public-secondary":
          career_page.secondary_color ||
          "#5267e8",
      }}
    >
      {isPreview && (
        <div className="preview-mode-bar">
          <button
            onClick={() =>
              navigate("/builder")
            }
            aria-label="Back to career builder"
          >
            <ArrowLeft size={16} />

            Back to builder
          </button>

          <span>
            Recruiter preview · Not public
          </span>
        </div>
      )}

      <section
        className="public-hero"
        style={{
          backgroundColor:
            career_page.primary_color ||
            "#172033",

          backgroundImage:
            career_page.banner_url
              ? `linear-gradient(
                  rgba(0, 0, 0, 0.48),
                  rgba(0, 0, 0, 0.48)
                ),
                url(${career_page.banner_url})`
              : "none",
        }}
      >
        <div className="public-hero-inner">
          <div className="public-company-brand">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={`${company.name} logo`}
                className="public-company-logo"
              />
            ) : (
              <div
                className="public-company-logo-placeholder"
                aria-hidden="true"
              >
                <Building2 size={25} />
              </div>
            )}

            <span>{company.name}</span>
          </div>

          <p className="public-hero-label">
            CAREERS
          </p>

          <h1>
            {career_page.headline ||
              "Build the future with us"}
          </h1>

          {career_page.description && (
            <p className="public-hero-description">
              {career_page.description}
            </p>
          )}
        </div>
      </section>

      <div className="public-content">
        <section className="public-story">
          <div className="public-section-label">
            OUR STORY
          </div>

          <h2>
            We are building something meaningful.
          </h2>

          <p>
            {career_page.description ||
              "Learn more about our company, our culture, and the people building the future with us."}
          </p>
        </section>

        {sections
          .filter(
            (section) =>
              section.is_visible
          )
          .map((section) => (
            <section
              className="public-content-section"
              key={section.id}
            >
              <div className="public-section-label">
                {section.section_type ===
                "custom"
                  ? "ABOUT US"
                  : section.section_type
                      .replace(
                        /_/g,
                        " "
                      )
                      .toUpperCase()}
              </div>

              <h2>
                {section.title ||
                  "Our company"}
              </h2>

              <p>
                {section.content ||
                  "Discover what makes our company a great place to work."}
              </p>
            </section>
          ))}

        {career_page.culture_video_url && (
          <section className="public-video-section">
            <div className="public-section-label">
              LIFE AT{" "}
              {company.name.toUpperCase()}
            </div>

            <h2>
              See what life is like here.
            </h2>

            <a
              href={
                career_page.culture_video_url
              }
              target="_blank"
              rel="noopener noreferrer"
              className="public-video-card"
            >
              <div className="public-video-icon">
                <Video size={24} />
              </div>

              <div>
                <strong>
                  Watch our culture video
                </strong>

                <span>
                  Discover our people, culture
                  and workplace.
                </span>
              </div>
            </a>
          </section>
        )}

        <section className="public-jobs-section">
          <div className="public-jobs-heading">
            <div>
              <div className="public-section-label">
                OPPORTUNITIES
              </div>

              <h2>
                Open positions
              </h2>

              <p>
                Find your next opportunity at{" "}
                {company.name}.
              </p>
            </div>

            <span className="public-job-count">
              {filteredJobs.length}{" "}
              {filteredJobs.length ===
              1
                ? "role"
                : "roles"}
            </span>
          </div>

          <div className="public-filters">
            <div className="public-search">
              <Search size={17} />

              <input
                type="search"
                placeholder="Search job title..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                aria-label="Search jobs by title"
              />
            </div>

            <select
              value={location}
              onChange={(event) =>
                setLocation(
                  event.target.value
                )
              }
              aria-label="Filter jobs by location"
            >
              <option value="">
                All locations
              </option>

              {locations.map(
                (item) => (
                  <option
                    value={item}
                    key={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <select
              value={jobType}
              onChange={(event) =>
                setJobType(
                  event.target.value
                )
              }
              aria-label="Filter jobs by type"
            >
              <option value="">
                All job types
              </option>

              {jobTypes.map(
                (item) => (
                  <option
                    value={item}
                    key={item}
                  >
                    {item}
                  </option>
                )
              )}
            </select>
          </div>

          {filteredJobs.length ===
          0 ? (
            <div className="public-empty-jobs">
              <BriefcaseBusiness
                size={28}
              />

              <h3>
                No positions found
              </h3>

              <p>
                Try changing your search or
                filters.
              </p>
            </div>
          ) : (
            <div className="public-job-list">
              {filteredJobs.map(
                (job) => (
                  <article
                    className="public-job-card"
                    id={`job-${job.id}`}
                    key={job.id}
                  >
                    <div className="public-job-icon">
                      <BriefcaseBusiness
                        size={19}
                      />
                    </div>

                    <div className="public-job-main">
                      <h3>
                        {job.title}
                      </h3>

                      <div className="public-job-meta">
                        <span>
                          <MapPin
                            size={14}
                          />

                          {job.location}
                        </span>

                        <span>
                          {job.job_type}
                        </span>

                        {job.department && (
                          <span>
                            {job.department}
                          </span>
                        )}
                      </div>

                      {job.description && (
                        <p>
                          {job.description}
                        </p>
                      )}
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
      </div>

      <footer className="public-footer">
        <span>
          {company.name}
        </span>

        <span>
          Careers
        </span>
      </footer>
    </main>
  );
}

export default PublicCareerPage;