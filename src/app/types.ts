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
  status: 'pending' | 'verified' | 'false_positive' | 'removed';
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
  confidence: number;
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

export interface Announcement {
  id: string;
  title: string;
  message: string;
  recipients: 'all' | 'analysts' | 'free_users';
  recipientCount: number;
  sentAt: string;
}

export interface NewsletterIssue {
  id: string;
  subject: string;
  content: string;
  sentAt: string;
  subscriberCount: number;
  openRate: number;
  clickRate: number;
}
