import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(form);
      navigate("/portal");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to log in.");
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <p className="eyebrow">University Workflow Suite</p>
        <h1>Track, submit, and download approved academic letters.</h1>
        <p>Students log in using roll number and only after admin enrollment.</p>
        <div className="hero-badges">
          <span>Live workflow tracking</span>
          <span>Secure sign-in</span>
          <span>Responsive student portal</span>
        </div>
      </section>
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Student Login</h2>
        <label>
          Roll Number
          <input value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} required />
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
        <button className="primary-btn">Login</button>
        <p>
          Not registered yet? <Link to="/signup">Sign up with your enrolled roll number</Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
