const staffPortalUrl = `${import.meta.env.VITE_STAFF_PORTAL_URL || "http://localhost:4200"}/login`;

const LandingPage = () => (
  <main className="landing-page">
    <div className="landing-shell">
      <section className="landing-hero-panel">
        <p className="eyebrow">Department Digital Workflow</p>
        <h1>Document Approval System</h1>
        <p className="landing-copy">
          Submit, review, approve, and track academic documents through one elegant departmental workflow built for students, faculty, HOD, and admin teams.
        </p>
        <div className="landing-pill-row">
          <span>Role-based access</span>
          <span>Signature workflow</span>
          <span>Live status tracking</span>
          <span>Professional portal design</span>
        </div>
      </section>

      <section className="landing-entry-grid">
        <a className="entry-card student-entry" href="/login">
          <div className="entry-card-top">
            <span className="entry-icon">ST</span>
            <span className="entry-chip">Student Portal</span>
          </div>
          <h2>Go to Student Login</h2>
          <p>Sign in with your enrolled roll number to upload letters, position signature areas, follow approvals, and download the final approved document.</p>
          <span className="entry-action">Open Student Access</span>
        </a>

        <a className="entry-card staff-entry" href={staffPortalUrl}>
          <div className="entry-card-top">
            <span className="entry-icon">AD</span>
            <span className="entry-chip">Admin / Faculty / HOD</span>
          </div>
          <h2>Go to Admin Login</h2>
          <p>Open the staff workspace for enrollments, advisor mapping, faculty review, HOD approval, signature setup, and department workflow control.</p>
          <span className="entry-action">Open Staff Portal</span>
        </a>
      </section>
    </div>
  </main>
);

export default LandingPage;
