import { Rnd } from "react-rnd";

const labels = {
  facultySignatureBox: "Faculty Sign",
  hodSignatureBox: "HOD Sign"
};

const SignatureWorkspace = ({ previewUrl, previewType, boxes, onChange }) => {
  const updateBox = (key, nextValue) => {
    onChange((current) => ({
      ...current,
      [key]: {
        ...current[key],
        ...nextValue
      }
    }));
  };

  return (
    <div className="workspace-shell">
      <div className="workspace-note">
        Place and resize the Faculty and HOD signature boxes exactly where you want the signatures stamped on the uploaded document.
      </div>
      <div className="workspace-stage" id="signature-workspace-stage">
        {previewUrl ? (
          <>
            {previewType === "pdf" ? (
              <iframe src={previewUrl} title="Student document preview" className="workspace-frame" />
            ) : previewType === "image" ? (
              <img src={previewUrl} alt="Student document preview" className="workspace-image" />
            ) : (
              <div className="workspace-placeholder">Preview is supported for PDF and image files.</div>
            )}
            {Object.entries(boxes).map(([key, box]) => (
              <Rnd
                key={key}
                bounds="parent"
                size={{ width: box.width, height: box.height }}
                position={{ x: box.x, y: box.y }}
                minWidth={120}
                minHeight={48}
                onDragStop={(_, data) =>
                  updateBox(key, {
                    x: data.x,
                    y: data.y,
                    previewWidth: document.getElementById("signature-workspace-stage")?.clientWidth || box.previewWidth,
                    previewHeight: document.getElementById("signature-workspace-stage")?.clientHeight || box.previewHeight
                  })
                }
                onResizeStop={(_, __, ref, ___, position) =>
                  updateBox(key, {
                    x: position.x,
                    y: position.y,
                    width: parseFloat(ref.style.width),
                    height: parseFloat(ref.style.height),
                    previewWidth: document.getElementById("signature-workspace-stage")?.clientWidth || box.previewWidth,
                    previewHeight: document.getElementById("signature-workspace-stage")?.clientHeight || box.previewHeight
                  })
                }
                className="workspace-rnd"
              >
                <div className="workspace-box">{labels[key]}</div>
              </Rnd>
            ))}
          </>
        ) : (
          <div className="workspace-placeholder">Upload a PDF or image file to open the signature workspace.</div>
        )}
      </div>
    </div>
  );
};

export default SignatureWorkspace;
