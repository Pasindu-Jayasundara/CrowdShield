export type Severity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type UserRole = 'public' | 'analyst' | 'admin';
export type VoteType = 'scam' | 'suspicious' | 'safe';
export type Platform = 'whatsapp' | 'sms' | 'email' | 'facebook' | 'instagram' | 'other';

export interface Report {
  id: string;
  content: string;
  platform: Platform;
  region?: string;
  scamType: string;
  severity: Severity;
  aiScore: number;
  aiReasoning: string;
  attackPatterns: string[];
  recommendations: string[];
  votesScam: number;
  votesSuspicious: number;
  votesSafe: number;
  totalVotes: number;
  createdAt: string;
  status: 'pending' | 'verified' | 'rejected' | 'removed';
  imageUrl?: string | null;
}


export interface Campaign {
  id: string;
  name: string;
  scamType: string;
  severity: Severity;
  reportCount: number;
  regionsAffected: string[];
  spreadVelocity: 'slow' | 'medium' | 'fast';
  trend: 'rising' | 'stable' | 'declining';
  hourlyRate: number;
  firstSeen: string;
  lastSeen: string;
}

export interface AIAnalysisResult {
  threatScore: number;
  severity: Severity;
  scamType: string;
  reasoning: string;
  attackPatterns: string[];
  recommendations: string[];
}

export interface AdminUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  subscriptionPlan: string;
  subscriptionStatus: string;
  reportsSubmitted: number;
  createdAt: string;
  isActive: boolean;
}

export interface SupportMessage {
  id: string;
  subject: string;
  message: string;
  userEmail: string;
  status: 'new' | 'replied' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  replies: { text: string; isAdmin: boolean; createdAt: string }[];
}

export interface Subscription {
  id: string;
  userEmail: string;
  plan: 'monthly' | 'annual';
  amount: number;
  status: 'active' | 'cancelled' | 'past_due' | 'expired';
  nextBilling: string;
}
