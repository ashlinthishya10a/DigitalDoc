const LABELS = {
  submitted: "Submitted",
  under_faculty_review: "Under Faculty Review",
  rejected_by_faculty: "Your Document Is Rejected",
  faculty_approved: "Faculty Approved",
  under_hod_review: "Under HOD Review",
  rejected_by_hod: "Your Document Is Rejected",
  cancelled_by_student: "Cancelled by Student",
  completed: "Completed / Signed"
};

const StatusBadge = ({ status }) => <span className={`status-badge ${status}`}>{LABELS[status] || status}</span>;

export default StatusBadge;
