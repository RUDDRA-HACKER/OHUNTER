import { JOB_TYPE_OPTIONS } from "../utils/jobUtils";

export default function JobFormFields({ form, onChange, disabled = false }) {
  return (
    <div className="job-form-stack">
      <label className="field">
        <span>Job Title</span>
        <input
          className="input-field"
          type="text"
          value={form.title}
          onChange={(event) => onChange("title", event.target.value)}
          placeholder="Senior Frontend Engineer"
          required
          disabled={disabled}
        />
      </label>

      <label className="field">
        <span>Company Name</span>
        <input
          className="input-field"
          type="text"
          value={form.companyName}
          onChange={(event) => onChange("companyName", event.target.value)}
          placeholder="OHunter Labs"
          required
          disabled={disabled}
        />
      </label>

      <label className="field">
        <span>Location</span>
        <input
          className="input-field"
          type="text"
          value={form.location}
          onChange={(event) => onChange("location", event.target.value)}
          placeholder="Bengaluru / Remote"
          required
          disabled={disabled}
        />
      </label>

      <label className="field">
        <span>Job Type</span>
        <select
          className="input-field"
          value={form.jobType}
          onChange={(event) => onChange("jobType", event.target.value)}
          disabled={disabled}
        >
          {JOB_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <div className="salary-grid">
        <label className="field">
          <span>Salary Min</span>
          <input
            className="input-field"
            type="number"
            min="0"
            value={form.salaryMin}
            onChange={(event) => onChange("salaryMin", event.target.value)}
            placeholder="300000"
            disabled={disabled}
          />
        </label>

        <label className="field">
          <span>Salary Max</span>
          <input
            className="input-field"
            type="number"
            min="0"
            value={form.salaryMax}
            onChange={(event) => onChange("salaryMax", event.target.value)}
            placeholder="600000"
            disabled={disabled}
          />
        </label>
      </div>

      <label className="field">
        <span>Description</span>
        <textarea
          className="input-field"
          rows="5"
          value={form.description}
          onChange={(event) => onChange("description", event.target.value)}
          placeholder="Describe responsibilities, expectations, and what success looks like."
          disabled={disabled}
        />
      </label>

      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={form.fresherFriendly}
          onChange={(event) => onChange("fresherFriendly", event.target.checked)}
          disabled={disabled}
        />
        <span className="toggle-slider" aria-hidden="true" />
        <span>Fresher Friendly</span>
      </label>
    </div>
  );
}
