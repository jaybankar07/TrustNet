export interface MockJob {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  location: string;
  remote: boolean;
  type: "Full-time" | "Part-time" | "Contract" | "Internship";
  salary: string;
  postedAt: string;
  tags: string[];
  description: string;
  requirements: string[];
  saved?: boolean;
  verifiedCompany?: boolean;
}

const logo = (text: string, color: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='80'><rect width='80' height='80' rx='16' fill='${color}'/><text x='50%' y='54%' font-family='Inter,Arial' font-size='34' font-weight='700' fill='white' text-anchor='middle' dominant-baseline='middle'>${text}</text></svg>`,
  )}`;

export const jobs: MockJob[] = [];

export function getJobById(id: string): MockJob | undefined {
  return jobs.find((j) => j.id === id);
}
