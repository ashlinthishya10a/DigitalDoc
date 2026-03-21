import { useRef, useState } from "react";

const BOX_SIZE = { width: 180, height: 80 };

const labels = {
  facultySignatureBox: "Faculty Signature",
  hodSignatureBox: "HOD Signature"
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const DocumentComposer = ({ previewUrl, previewType, boxes, onChange }) => {
  const previewRef = useRef(null);
  const [dragging, setDragging] = useState(null);

  const handleMove = (event) => {
    if (!dragging || !previewRef.current) return;

    const rect = previewRef.current.getBoundingClientRect();
    const clientX = event.touches?.[0]?.clientX ?? event.clientX;
    const clientY = event.touches?.[0]?.clientY ?? event.clientY;

    onChange({
      ...boxes,
      [dragging]: {
        ...boxes[dragging],
        x: clamp(clientX - rect.left - BOX_SIZE.width / 2, 0, rect.width - BOX_SIZE.width),
        y: clamp(clientY - rect.top - BOX_SIZE.height / 2, 0, rect.height - BOX_SIZE.height),
        previewWidth: rect.width,
        previewHeight: rect.height
      }
    });
  };

  return (
    <div className="composer-shell">
      <div className="composer-help">
        Drag the Faculty and HOD placeholders onto the exact signature positions in the preview.
      </div>
      <div
        className="document-preview"
        ref={previewRef}
        onMouseMove={handleMove}
        onMouseUp={() => setDragging(null)}
        onMouseLeave={() => setDragging(null)}
        onTouchMove={handleMove}
        onTouchEnd={() => setDragging(null)}
      >
        {previewUrl ? (
          <div className="document-media">
            {previewType === "pdf" ? (
              <iframe src={previewUrl} title="Uploaded document preview" className="preview-frame" />
            ) : previewType === "image" ? (
              <img src={previewUrl} alt="Uploaded document preview" className="preview-image" />
            ) : (
              <div className="document-text">Preview is not available for this file type, but you can still place the signature boxes.</div>
            )}
          </div>
        ) : (
          <div className="document-text">Choose a PDF or image file to preview it here and place the signature boxes.</div>
        )}
        {Object.entries(boxes).map(([key, value]) => (
          <button
            type="button"
            key={key}
            className="signature-box"
            style={{ left: value.x, top: value.y, width: value.width, height: value.height }}
            onMouseDown={() => setDragging(key)}
            onTouchStart={() => setDragging(key)}
          >
            {labels[key]}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DocumentComposer;
