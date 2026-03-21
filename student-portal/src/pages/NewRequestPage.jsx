import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import SignatureWorkspace from "../components/SignatureWorkspace";

const initialBoxes = {
  facultySignatureBox: { x: 60, y: 360, width: 180, height: 80, page: 1, previewWidth: 760, previewHeight: 520 },
  hodSignatureBox: { x: 320, y: 360, width: 180, height: 80, page: 1, previewWidth: 760, previewHeight: 520 }
};

const NewRequestPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    type: "leave_letter",
    title: "",
    document: null
  });
  const [boxes, setBoxes] = useState(initialBoxes);
  const [error, setError] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [previewType, setPreviewType] = useState("");

  const handleFileChange = (file) => {
    setForm({ ...form, document: file });
    if (!file) {
      setPreviewUrl("");
      setPreviewType("");
      return;
    }

    const fileUrl = URL.createObjectURL(file);
    setPreviewUrl(fileUrl);
    setPreviewType(file.type.includes("pdf") ? "pdf" : file.type.startsWith("image/") ? "image" : "other");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = new FormData();
      payload.append("type", form.type);
      payload.append("title", form.title);
      payload.append("facultySignatureBox", JSON.stringify(boxes.facultySignatureBox));
      payload.append("hodSignatureBox", JSON.stringify(boxes.hodSignatureBox));
      if (form.document) payload.append("document", form.document);
      await client.post("/student/requests", payload);
      navigate("/requests");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to submit request.");
    }
  };

  return (
    <form className="panel form-grid" onSubmit={handleSubmit}>
      <div className="section-heading">
        <div>
          <h2>Submit New Request</h2>
          <p>Upload a document or compose a letter, then place the approval signature boxes.</p>
        </div>
      </div>
      <div className="form-two-column">
        <div className="form-stack">
          <label>
            Request Type
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="leave_letter">Leave Letter</option>
              <option value="permission_letter">Permission Letter</option>
              <option value="department_letter">Department Letter</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>
            Title
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label>
            Upload Letter / Document
            <input type="file" accept=".pdf,image/*" onChange={(e) => handleFileChange(e.target.files?.[0] || null)} required />
          </label>
        </div>
        <SignatureWorkspace previewUrl={previewUrl} previewType={previewType} boxes={boxes} onChange={setBoxes} />
      </div>
      {error && <p className="error-text">{error}</p>}
      <button className="primary-btn">Submit for Approval</button>
    </form>
  );
};

export default NewRequestPage;
