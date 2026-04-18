export interface VerificationRequest {
  id: string;
  name: string;
  email: string;
  submitted: string;
  type: "Face" | "ID" | "Company";
  status: "Pending" | "Approved" | "Rejected";
  riskScore: number;
}

export interface FraudAlert {
  id: string;
  user: string;
  reason: string;
  matchedWith: string;
  similarity: number;
  flaggedAt: string;
  severity: "low" | "medium" | "high";
}

export interface CompanyClaim {
  id: string;
  company: string;
  claimant: string;
  proof: string;
  submitted: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface EventReport {
  id: string;
  event: string;
  reporter: string;
  reason: string;
  reportedAt: string;
  status: "Open" | "Reviewed" | "Removed";
}

export const verificationRequests: VerificationRequest[] = [];

export const fraudAlerts: FraudAlert[] = [];

export const companyClaims: CompanyClaim[] = [];

export const eventReports: EventReport[] = [];

export const adminMetrics = {
  totalUsers: 28450,
  verifiedUsers: 19230,
  pendingReviews: 142,
  fraudAlerts: 7,
  weeklySignups: [120, 180, 210, 250, 300, 280, 360],
  weeklyVerifications: [80, 130, 160, 200, 240, 230, 310],
};
