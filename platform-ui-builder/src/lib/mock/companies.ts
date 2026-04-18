export interface MockCompany {
  id: string;
  name: string;
  tagline: string;
  industry: string;
  size: string;
  location: string;
  logoColor: string;
  initial: string;
  verified: boolean;
  followers: number;
  openRoles: number;
  about: string;
}

export const companies: MockCompany[] = [];

export function getCompanyById(id: string): MockCompany | undefined {
  return companies.find((c) => c.id === id);
}
