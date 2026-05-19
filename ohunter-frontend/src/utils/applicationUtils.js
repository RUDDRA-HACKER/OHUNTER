export function getApplicationStatusMeta(status) {
  switch (status) {
    case "REJECTED":
      return { label: "REJECTED", tone: "rejected", pending: false };
    case "WITHDRAWN":
      return { label: "WITHDRAWN", tone: "withdrawn", pending: false };
    case "SHORTLISTED":
    case "INTERVIEW_SCHEDULED":
    case "OFFERED":
    case "ACCEPTED":
      return { label: "ACCEPTED", tone: "accepted", pending: false };
    case "APPLIED":
    case "PENDING":
    default:
      return { label: "PENDING", tone: "pending", pending: true };
  }
}
