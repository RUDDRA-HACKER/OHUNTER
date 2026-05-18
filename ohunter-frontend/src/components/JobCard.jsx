import { Link } from "react-router-dom";

export default function JobCard({ job }) {
  return (
    <article className="job-card card">
      <div className="card-head">
        <div>
          <span className="badge">{job.location || "Remote"}</span>
          {job.fresher && <span className="tag-fresher" style={{ marginLeft: 8 }}>Fresher</span>}
          <h3 style={{ marginTop: 12 }}>{job.title}</h3>
          <p>{job.company || job.companyName || "OHunter listing"}</p>
        </div>
        <span className="badge">{job.jobType || "Full Time"}</span>
      </div>

      <p style={{ marginTop: 12 }}>{job.description || "No description provided yet."}</p>

      <div className="card-foot" style={{ marginTop: 16 }}>
        <div className="stack" style={{ gap: 8 }}>
          {job.requiredSkills?.split(",")?.slice(0, 3)?.map((skill) => (
            <span className="badge" key={skill.trim()}>{skill.trim()}</span>
          ))}
        </div>
        <Link className="btn-outline" to={`/jobs/${job.id}`}>View</Link>
      </div>
    </article>
  );
}
