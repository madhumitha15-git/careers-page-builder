
import { useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Lock,
  Mail,
  Tag,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api";

function Signup() {
  const navigate = useNavigate();

  const [companyName, setCompanyName] = useState("");
  const [companySlug, setCompanySlug] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      !companyName ||
      !companySlug ||
      !email ||
      !password
    ) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/register", {
        company_name: companyName,
        company_slug: companySlug.toLowerCase().trim(),
        email,
        password,
      });

      navigate("/login", {
        state: {
          message:
            "Account created successfully. Please sign in.",
        },
      });
    } catch (err) {
      if (err.response?.status === 400) {
        setError(
          err.response.data?.detail ||
            "Unable to create your account."
        );
      } else {
        setError(
          "Unable to connect to the server. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <div className="brand-icon">
            <BriefcaseBusiness size={22} />
          </div>

          <span>Careers Builder</span>
        </div>

        <div className="login-heading">
          <h1>Create your recruiter account</h1>

          <p>
            Set up your company and start building its
            careers page.
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >
          <div className="form-field">
            <label htmlFor="companyName">
              Company name
            </label>

            <div className="input-wrapper">
              <Building2 size={18} />

              <input
                id="companyName"
                type="text"
                placeholder="NovaTech"
                value={companyName}
                onChange={(event) =>
                  setCompanyName(event.target.value)
                }
                autoComplete="organization"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="companySlug">
              Company URL slug
            </label>

            <div className="input-wrapper">
              <Tag size={18} />

              <input
                id="companySlug"
                type="text"
                placeholder="novatech"
                value={companySlug}
                onChange={(event) =>
                  setCompanySlug(event.target.value)
                }
                autoComplete="off"
              />
            </div>

            <small>
              This will be used in your public careers URL.
            </small>
          </div>

          <div className="form-field">
            <label htmlFor="email">
              Work email
            </label>

            <div className="input-wrapper">
              <Mail size={18} />

              <input
                id="email"
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-field">
            <label htmlFor="password">
              Password
            </label>

            <div className="input-wrapper">
              <Lock size={18} />

              <input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                autoComplete="new-password"
              />
            </div>
          </div>

          {error && (
            <div
              className="login-error"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create account"}

            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="login-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </p>
      </section>
    </main>
  );
}

export default Signup;

