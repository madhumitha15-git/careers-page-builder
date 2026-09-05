
import { useEffect, useState } from "react";
import { ArrowLeft, Building2, Check, Save, Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

import api from "../api";

function Settings() {
  const navigate = useNavigate();

  const [company, setCompany] = useState(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadCompany();
  }, []);

  const loadCompany = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/companies/my-company");

      setCompany(response.data);
      setName(response.data.name || "");
      setSlug(response.data.slug || "");
      setLogoUrl(response.data.logo_url || "");
    } catch (err) {
      console.error("Failed to load company settings:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to load company settings."
      );
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Company name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await api.put("/companies/my-company", {
        name: name.trim(),
        logo_url: logoUrl.trim() || null,
      });

      setCompany(response.data);
      setName(response.data.name || "");
      setSlug(response.data.slug || "");
      setLogoUrl(response.data.logo_url || "");

      setMessage("Settings saved successfully.");

      setTimeout(() => {
        setMessage("");
      }, 3000);
    } catch (err) {
      console.error("Failed to save company settings:", err);
      setError(
        err.response?.data?.detail ||
          "Unable to save settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="settings-loading-spinner" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <header className="settings-topbar">
        <div className="settings-topbar-inner">
          <button
            className="settings-back-button"
            type="button"
            onClick={() => navigate("/dashboard")}
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="settings-topbar-title">
            <div className="settings-topbar-icon">
              <SettingsIcon size={18} />
            </div>

            <div>
              <h1>Settings</h1>
              <p>Manage your company profile</p>
            </div>
          </div>
        </div>
      </header>

      <main className="settings-content">
        <div className="settings-page-heading">
          <div>
            <span className="settings-eyebrow">WORKSPACE</span>
            <h2>Company settings</h2>
            <p>
              Update the company information displayed across your careers
              experience.
            </p>
          </div>
        </div>

        {error && (
          <div className="settings-alert settings-alert-error">
            {error}
          </div>
        )}

        {message && (
          <div className="settings-alert settings-alert-success">
            <Check size={17} />
            {message}
          </div>
        )}

        <div className="settings-layout">
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <Building2 size={19} />
              </div>

              <div>
                <h3>Company profile</h3>
                <p>
                  Basic information about your organization.
                </p>
              </div>
            </div>

            <form
              className="settings-form"
              onSubmit={saveSettings}
            >
              <div className="settings-field">
                <label htmlFor="company-name">
                  Company name
                </label>

                <input
                  id="company-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Acme Inc."
                  autoComplete="organization"
                />

                <span>
                  This name is used throughout your careers page.
                </span>
              </div>

              <div className="settings-field">
                <label htmlFor="company-slug">
                  Careers page slug
                </label>

                <input
                  id="company-slug"
                  type="text"
                  value={slug}
                  disabled
                />

                <span>
                  The slug is used to generate your public careers URL.
                </span>
              </div>

              <div className="settings-field">
                <label htmlFor="company-logo">
                  Logo URL
                </label>

                <input
                  id="company-logo"
                  type="url"
                  value={logoUrl}
                  onChange={(event) => setLogoUrl(event.target.value)}
                  placeholder="https://example.com/logo.png"
                />

                <span>
                  Use a publicly accessible image URL for your company logo.
                </span>
              </div>

              <div className="settings-form-footer">
                <button
                  className="settings-save-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="settings-button-spinner" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={17} />
                      Save changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>

          <aside className="settings-info-card">
            <div className="settings-info-header">
              <span className="settings-status-dot" />
              Workspace active
            </div>

            <div className="settings-info-divider" />

            <div className="settings-info-row">
              <span>Company</span>
              <strong>{company?.name || "—"}</strong>
            </div>

            <div className="settings-info-row">
              <span>Public slug</span>
              <strong>{company?.slug || "—"}</strong>
            </div>

            <button
              className="settings-careers-button"
              type="button"
              onClick={() => navigate("/builder")}
            >
              Back to Career Builder
            </button>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Settings;

