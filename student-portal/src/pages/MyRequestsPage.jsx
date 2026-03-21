import { useEffect, useState } from "react";
import client from "../api/client";
import StatusBadge from "../components/StatusBadge";

const MyRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");
  const [downloadingId, setDownloadingId] = useState("");
  const [cancellingId, setCancellingId] = useState("");
  const [logsByRequest, setLogsByRequest] = useState({});
  const [openHistoryId, setOpenHistoryId] = useState("");

  useEffect(() => {
    client.get("/student/requests").then(({ data }) => setRequests(data));
  }, []);

  const filtered = requests.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));

  const downloadDocument = async (request) => {
    try {
      setDownloadingId(request._id);
      const response = await client.get(`/review/requests/${request._id}/download`, {
        responseType: "blob"
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const disposition = response.headers["content-disposition"] || "";
      const matched = disposition.match(/filename="(.+)"/);
      const link = document.createElement("a");
      link.href = url;
      link.download = matched?.[1] || `${request.title}_signed.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } finally {
      setDownloadingId("");
    }
  };

  const toggleHistory = async (requestId) => {
    if (openHistoryId === requestId) {
      setOpenHistoryId("");
      return;
    }

    if (!logsByRequest[requestId]) {
      const { data } = await client.get(`/student/requests/${requestId}/logs`);
      setLogsByRequest((current) => ({ ...current, [requestId]: data }));
    }

    setOpenHistoryId(requestId);
  };

  const cancelRequest = async (requestId) => {
    try {
      setCancellingId(requestId);
      await client.patch(`/student/requests/${requestId}/cancel`);
      const { data } = await client.get("/student/requests");
      setRequests(data);
    } finally {
      setCancellingId("");
    }
  };

  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <h2>My Requests</h2>
          <p>Track faculty review, HOD review, and final signed document download.</p>
        </div>
        <input placeholder="Search requests" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      <div className="request-table">
        {filtered.map((request) => (
          <div key={request._id} className="request-history-card">
            <article className="request-row">
              <div>
                <h3>{request.title}</h3>
                <p>{new Date(request.createdAt).toLocaleString()}</p>
                {(request.status === "rejected_by_faculty" || request.status === "rejected_by_hod") && (
                  <p className="rejection-note">
                    {request.status === "rejected_by_faculty"
                      ? `Faculty Remarks: ${request.facultyRemarks || "No remarks added."}`
                      : `HOD Remarks: ${request.hodRemarks || "No remarks added."}`}
                  </p>
                )}
              </div>
              <div>
                <p>{request.facultyId?.name}</p>
                <p>{request.hodId?.name}</p>
              </div>
              <StatusBadge status={request.status} />
              <div className="row-actions">
                <button type="button" className="ghost-btn" onClick={() => toggleHistory(request._id)}>
                  {openHistoryId === request._id ? "Hide History" : "View History"}
                </button>
                {request.status === "under_faculty_review" && (
                  <button type="button" className="ghost-btn" onClick={() => cancelRequest(request._id)}>
                    {cancellingId === request._id ? "Cancelling..." : "Cancel Request"}
                  </button>
                )}
                {request.status === "completed" && (
                  <button type="button" className="ghost-btn" onClick={() => downloadDocument(request)}>
                    {downloadingId === request._id ? "Preparing..." : "Download"}
                  </button>
                )}
              </div>
            </article>
            {openHistoryId === request._id && (
              <div className="history-panel">
                {(logsByRequest[request._id] || []).map((log) => (
                  <div className="history-item" key={log._id}>
                    <strong>{log.status.replaceAll("_", " ")}</strong>
                    <span>{new Date(log.timestamp || log.createdAt).toLocaleString()}</span>
                    <p>{log.remarks || "No remarks added."}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      {!filtered.length && <p className="empty-state">No matching requests found.</p>}
    </section>
  );
};

export default MyRequestsPage;
