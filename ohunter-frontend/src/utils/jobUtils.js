export const JOB_TYPE_OPTIONS = [
  { value: "FULL_TIME", label: "Full-Time" },
  { value: "PART_TIME", label: "Part-Time" },
  { value: "REMOTE", label: "Remote" },
  { value: "INTERNSHIP", label: "Internship" },
];

const JOB_TYPE_LABELS = JOB_TYPE_OPTIONS.reduce((lookup, option) => {
  lookup[option.value] = option.label;
  return lookup;
}, {});

export function getCompanyName(job) {
  return job?.company?.name || job?.companyName || "Confidential company";
}

export function formatJobType(jobType) {
  if (!jobType) return "Not specified";
  return JOB_TYPE_LABELS[jobType] || jobType.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatCurrency(value) {
  if (value === null || value === undefined || value === "") return null;

  const amount = Number(value);
  if (Number.isNaN(amount)) return null;

  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

export function formatSalaryRange(job) {
  const min = job?.salaryMin ?? job?.minSalary;
  const max = job?.salaryMax ?? job?.maxSalary;
  const formattedMin = formatCurrency(min);
  const formattedMax = formatCurrency(max);

  if (!formattedMin && !formattedMax) {
    return "Salary not disclosed";
  }

  return `${formattedMin || "Open"} - ${formattedMax || "Open"}`;
}

export function isFresherFriendly(job) {
  return Boolean(
    job?.fresherFriendly ||
      job?.fresher ||
      job?.isFresher ||
      job?.minExperience === 0,
  );
}

export function formatPostedDays(createdAt) {
  if (!createdAt) return "Posted recently";

  const postedAt = new Date(createdAt);
  if (Number.isNaN(postedAt.getTime())) return "Posted recently";

  const differenceInDays = Math.max(
    0,
    Math.floor((Date.now() - postedAt.getTime()) / (1000 * 60 * 60 * 24)),
  );

  if (differenceInDays === 0) return "Posted today";
  if (differenceInDays === 1) return "Posted 1 day ago";
  return `Posted ${differenceInDays} days ago`;
}

export function getJobRequirements(job) {
  const requirements = [];

  if (job?.requiredSkills) {
    requirements.push(
      ...job.requiredSkills
        .split(/[,;\n]/)
        .map((item) => item.trim())
        .filter(Boolean),
    );
  }

  if (job?.qualification) {
    requirements.push(`Qualification: ${job.qualification}`);
  }

  if (job?.minExperience !== null && job?.minExperience !== undefined) {
    if (job?.maxExperience !== null && job?.maxExperience !== undefined && job.maxExperience !== job.minExperience) {
      requirements.push(`Experience: ${job.minExperience} to ${job.maxExperience} years`);
    } else if (job.minExperience === 0) {
      requirements.push("Open to freshers");
    } else {
      requirements.push(`Experience: ${job.minExperience}+ years`);
    }
  }

  if (job?.description && requirements.length === 0) {
    const fromDescription = job.description
      .split("\n")
      .map((line) => line.replace(/^[-*]\s*/, "").trim())
      .filter(Boolean)
      .slice(0, 4);

    requirements.push(...fromDescription);
  }

  if (requirements.length === 0) {
    requirements.push("Review the full description for detailed requirements.");
  }

  return [...new Set(requirements)];
}

export function formatDescription(description) {
  if (!description) {
    return ["No description has been added yet."];
  }

  return description
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export function normalizeJobForm(job = {}) {
  return {
    title: job.title || "",
    companyName: getCompanyName(job) === "Confidential company" ? "" : getCompanyName(job),
    location: job.location || "",
    jobType: job.jobType || "FULL_TIME",
    salaryMin: job.salaryMin ?? job.minSalary ?? "",
    salaryMax: job.salaryMax ?? job.maxSalary ?? "",
    description: job.description || "",
    fresherFriendly: isFresherFriendly(job),
  };
}

export function validateJobForm(form) {
  if (!form.title.trim()) return "Job title is required.";
  if (!form.companyName.trim()) return "Company name is required.";
  if (!form.location.trim()) return "Location is required.";
  if (!form.jobType.trim()) return "Job type is required.";

  const min = form.salaryMin === "" ? null : Number(form.salaryMin);
  const max = form.salaryMax === "" ? null : Number(form.salaryMax);

  if ((min !== null && Number.isNaN(min)) || (max !== null && Number.isNaN(max))) {
    return "Salary values must be valid numbers.";
  }

  if (min !== null && max !== null && min > max) {
    return "Salary min cannot be greater than salary max.";
  }

  return "";
}

export function toJobPayload(form, currentJob = null) {
  const min = form.salaryMin === "" ? null : Number(form.salaryMin);
  const max = form.salaryMax === "" ? null : Number(form.salaryMax);
  const companyName = form.companyName.trim();
  const payload = {
    title: form.title.trim(),
    location: form.location.trim(),
    jobType: form.jobType,
    description: form.description.trim(),
    minSalary: min,
    maxSalary: max,
    minExperience: form.fresherFriendly ? 0 : (currentJob?.minExperience ?? null),
    isActive: currentJob?.isActive ?? true,
  };

  payload.company = currentJob?.company?.id
    ? { ...currentJob.company, name: companyName }
    : { name: companyName };

  return payload;
}
