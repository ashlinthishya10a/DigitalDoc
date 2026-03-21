import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const StudentLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <Link to="/portal" className="brand">
            <span>DigitalFlow</span>
            <small>Student Portal</small>
          </Link>
          <nav className="nav-links">
            <NavLink to="/portal">Dashboard</NavLink>
            <NavLink to="/portal/requests/new">New Request</NavLink>
            <NavLink to="/portal/requests">My Requests</NavLink>
          </nav>
        </div>
        <div className="sidebar-user">
          <strong>{user?.name}</strong>
          <span>{user?.rollNo}</span>
          <button onClick={logout} className="ghost-btn">
            Logout
          </button>
        </div>
      </aside>
      <main className="content-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Department Workflow Automation</p>
            <h1>Document Approval System</h1>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
};

export default StudentLayout;
