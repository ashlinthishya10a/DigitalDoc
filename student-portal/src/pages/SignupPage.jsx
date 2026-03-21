import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: "", name: "", classYear: "", batch: "N", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await signup(form);
      navigate("/portal");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to sign up.");
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <p className="eyebrow">Controlled Registration</p>
        <h1>Only pre-enrolled students can create an account.</h1>
        <p>Use your admin-enrolled roll number and set your password.</p>
        <div className="hero-badges">
          <span>Admin-approved access</span>
          <span>Batch-aware profiles</span>
          <span>Modern guided onboarding</span>
        </div>
      </section>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Student Sign Up</h2>
        <label>
          Enrolled Roll Number
          <input value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} required />
        </label>
        <label>
          Full Name
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>
          Class / Year
          <input value={form.classYear} onChange={(e) => setForm({ ...form, classYear: e.target.value })} required />
        </label>
        <label>
          Batch
          <select value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}>
            <option value="N">N</option>
            <option value="P">P</option>
            <option value="Q">Q</option>
          </select>
        </label>
        <label>
          Password
          <div className="password-wrap">
            <input
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button type="button" className="password-toggle" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
              <span aria-hidden="true">{showPassword ? "Hide" : "Show"}</span>
              <span className="password-eye" aria-hidden="true" />
            </button>
          </div>
        </label>
        {error && <p className="error-text">{error}</p>}
        <button className="primary-btn">Create Account</button>
        <p>
          Already have access? <Link to="/login">Go to login</Link>
        </p>
      </form>
    </div>
  );
};

export default SignupPage;
