import { useEffect, useState } from "react";
import client from "../api/client";
import StatusBadge from "../components/StatusBadge";

const DashboardPage = () => {
  const [data, setData] = useState({ counts: {}, requests: [] });

  useEffect(() => {
    client.get("/student/dashboard").then(({ data }) => setData(data));
  }, []);

  return (
    <section className="dashboard-grid">
      <div className="stats-row">
        {[
          ["Total Requests", data.counts.total || 0],
          ["Under Faculty Review", data.counts.under_faculty_review || 0],
          ["Under HOD Review", data.counts.under_hod_review || 0],
          ["Completed", data.counts.completed || 0]
        ].map(([label, value]) => (
          <article className="stat-card" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="panel">
        <div className="section-heading">
          <h2>Recent Requests</h2>
        </div>
        <div className="request-list">
          {data.requests.map((request) => (
            <article className="request-card" key={request._id}>
              <div>
                <h3>{request.title}</h3>
                <p>{request.type.replaceAll("_", " ")}</p>
              </div>
              <StatusBadge status={request.status} />
            </article>
          ))}
          {!data.requests.length && <p className="empty-state">No requests submitted yet.</p>}
        </div>
      </div>
    </section>
  );
};

export default DashboardPage;
