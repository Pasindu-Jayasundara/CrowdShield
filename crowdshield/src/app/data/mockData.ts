import type { AdminUser, Campaign, Report, Subscription, SupportMessage } from '../types';

export const mockReports: Report[] = [
  {
    id: '1',
    content: 'URGENT: Your bank account will be suspended. Click here to verify: bit.ly/secure-bnk',
    platform: 'sms',
    region: 'Colombo',
    scamType: 'Phishing',
    severity: 'CRITICAL',
    aiScore: 92,
    aiReasoning: 'Classic banking impersonation with urgency tactics and suspicious shortened URL.',
    attackPatterns: ['Urgency tactics', 'Suspicious links', 'Impersonation'],
    recommendations: ['Do not click the link', 'Contact your bank directly', 'Report to authorities'],
    votesScam: 47,
    votesSuspicious: 8,
    votesSafe: 2,
    totalVotes: 57,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    status: 'verified',
  },
  {
    id: '2',
    content: 'Congratulations! You won $50,000 in the Mega Lottery. Pay processing fee of $200 to claim.',
    platform: 'whatsapp',
    region: 'Kandy',
    scamType: 'Lottery Scam',
    severity: 'HIGH',
    aiScore: 78,
    aiReasoning: 'Too-good-to-be-true prize with upfront payment request — hallmark lottery fraud.',
    attackPatterns: ['Too-good-to-be-true', 'Payment requests'],
    recommendations: ['Never pay to claim prizes', 'Block the sender', 'Warn contacts'],
    votesScam: 34,
    votesSuspicious: 12,
    votesSafe: 1,
    totalVotes: 47,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    status: 'verified',
  },
  {
    id: '3',
    content: 'Hi, I am HR from TechCorp. Send your CV and pay $50 for background check to start immediately.',
    platform: 'email',
    region: 'Galle',
    scamType: 'Job Scam',
    severity: 'HIGH',
    aiScore: 71,
    aiReasoning: 'Fake job offer requiring upfront payment before employment verification.',
    attackPatterns: ['Payment requests', 'Impersonation'],
    recommendations: ['Verify company via official website', 'Never pay for job applications'],
    votesScam: 28,
    votesSuspicious: 15,
    votesSafe: 3,
    totalVotes: 46,
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    status: 'verified',
  },
  {
    id: '4',
    content: 'Your OTP is 847291. Share this code to verify your identity for the refund process.',
    platform: 'sms',
    region: 'Negombo',
    scamType: 'OTP Phishing',
    severity: 'CRITICAL',
    aiScore: 88,
    aiReasoning: 'Explicit request to share OTP codes — critical credential theft attempt.',
    attackPatterns: ['Credential requests', 'Urgency tactics'],
    recommendations: ['Never share OTP codes', 'Enable 2FA', 'Contact service provider'],
    votesScam: 52,
    votesSuspicious: 4,
    votesSafe: 0,
    totalVotes: 56,
    createdAt: new Date(Date.now() - 18000000).toISOString(),
    status: 'verified',
  },
  {
    id: '5',
    content: 'Limited crypto investment — 300% returns guaranteed in 30 days. DM for wallet address.',
    platform: 'instagram',
    region: 'Jaffna',
    scamType: 'Investment Scam',
    severity: 'MEDIUM',
    aiScore: 65,
    aiReasoning: 'Unrealistic investment returns with cryptocurrency payment request.',
    attackPatterns: ['Too-good-to-be-true', 'Payment requests'],
    recommendations: ['Research investment legitimacy', 'Avoid crypto transfers to strangers'],
    votesScam: 19,
    votesSuspicious: 22,
    votesSafe: 5,
    totalVotes: 46,
    createdAt: new Date(Date.now() - 28800000).toISOString(),
    status: 'pending',
  },
];

export const mockCampaigns: Campaign[] = [
  {
    id: 'c1',
    name: 'Phishing Wave in Colombo',
    scamType: 'Phishing',
    severity: 'CRITICAL',
    reportCount: 156,
    regionsAffected: ['Colombo', 'Negombo', 'Gampaha'],
    spreadVelocity: 'fast',
    trend: 'rising',
    hourlyRate: 24.5,
    firstSeen: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'c2',
    name: 'OTP Phishing in Western Province',
    scamType: 'OTP Phishing',
    severity: 'HIGH',
    reportCount: 89,
    regionsAffected: ['Colombo', 'Kalutara'],
    spreadVelocity: 'medium',
    trend: 'stable',
    hourlyRate: 12.3,
    firstSeen: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastSeen: new Date().toISOString(),
  },
  {
    id: 'c3',
    name: 'Job Scam Cluster — Nationwide',
    scamType: 'Job Scam',
    severity: 'MEDIUM',
    reportCount: 45,
    regionsAffected: ['Kandy', 'Galle', 'Jaffna'],
    spreadVelocity: 'slow',
    trend: 'declining',
    hourlyRate: 4.2,
    firstSeen: new Date(Date.now() - 86400000 * 10).toISOString(),
    lastSeen: new Date(Date.now() - 3600000).toISOString(),
  },
];

export const mockUsers: AdminUser[] = [
  { id: 'u1', email: 'analyst@example.com', username: 'threat_hunter', role: 'analyst', subscriptionPlan: 'monthly', subscriptionStatus: 'active', reportsSubmitted: 23, createdAt: '2024-01-15', isActive: true },
  { id: 'u2', email: 'user@mail.com', username: 'citizen_42', role: 'public', subscriptionPlan: 'free', subscriptionStatus: 'active', reportsSubmitted: 5, createdAt: '2024-03-20', isActive: true },
  { id: 'u3', email: 'pro@security.io', username: 'cyber_guard', role: 'analyst', subscriptionPlan: 'annual', subscriptionStatus: 'active', reportsSubmitted: 67, createdAt: '2023-11-08', isActive: true },
  { id: 'u4', email: 'inactive@test.com', username: 'old_user', role: 'public', subscriptionPlan: 'free', subscriptionStatus: 'expired', reportsSubmitted: 1, createdAt: '2023-06-01', isActive: false },
];

export const mockSubscriptions: Subscription[] = [
  { id: 's1', userEmail: 'analyst@example.com', plan: 'monthly', amount: 49, status: 'active', nextBilling: '2024-06-15' },
  { id: 's2', userEmail: 'pro@security.io', plan: 'annual', amount: 348, status: 'active', nextBilling: '2025-01-08' },
  { id: 's3', userEmail: 'late@pay.com', plan: 'monthly', amount: 49, status: 'past_due', nextBilling: '2024-05-10' },
  { id: 's4', userEmail: 'cancelled@user.com', plan: 'monthly', amount: 49, status: 'cancelled', nextBilling: '2024-05-01' },
];

export const mockMessages: SupportMessage[] = [
  {
    id: 'm1',
    subject: 'Cannot access geo map',
    message: 'I subscribed yesterday but the geo intelligence map shows a blank screen.',
    userEmail: 'analyst@example.com',
    status: 'new',
    priority: 'high',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    replies: [],
  },
  {
    id: 'm2',
    subject: 'Refund request for annual plan',
    message: 'I would like to request a refund for my annual subscription purchased last week.',
    userEmail: 'pro@security.io',
    status: 'replied',
    priority: 'medium',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    replies: [{ text: 'We have received your request and will process it within 5 business days.', isAdmin: true, createdAt: new Date(Date.now() - 43200000).toISOString() }],
  },
];

export const volumeChartData = [
  { date: 'Mon', reports: 42 },
  { date: 'Tue', reports: 58 },
  { date: 'Wed', reports: 71 },
  { date: 'Thu', reports: 65 },
  { date: 'Fri', reports: 89 },
  { date: 'Sat', reports: 54 },
  { date: 'Sun', reports: 47 },
];

export const scamTypeData = [
  { type: 'Phishing', count: 234 },
  { type: 'OTP Phishing', count: 156 },
  { type: 'Job Scam', count: 89 },
  { type: 'Lottery', count: 67 },
  { type: 'Investment', count: 45 },
];

export const regionData = [
  { region: 'Colombo', count: 312 },
  { region: 'Kandy', count: 98 },
  { region: 'Galle', count: 76 },
  { region: 'Jaffna', count: 54 },
  { region: 'Negombo', count: 89 },
];

export function severityFromScore(score: number): import('../types').Severity {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 40) return 'MEDIUM';
  return 'LOW';
}

export async function mockAIAnalysis(content: string): Promise<import('../types').AIAnalysisResult> {
  await new Promise((r) => setTimeout(r, 2000));
  const lower = content.toLowerCase();
  let score = 45;
  const patterns: string[] = [];
  if (lower.includes('urgent') || lower.includes('immediately')) patterns.push('Urgency tactics');
  if (lower.includes('http') || lower.includes('bit.ly')) patterns.push('Suspicious links');
  if (lower.includes('otp') || lower.includes('password')) patterns.push('Credential requests');
  if (lower.includes('pay') || lower.includes('$')) patterns.push('Payment requests');
  if (lower.includes('won') || lower.includes('prize')) patterns.push('Too-good-to-be-true');
  if (lower.includes('bank') || lower.includes('verify')) patterns.push('Impersonation');
  score = Math.min(95, 35 + patterns.length * 15 + Math.min(content.length / 10, 20));
  const severity = severityFromScore(score);
  return {
    threatScore: Math.round(score),
    severity,
    scamType: patterns.includes('Credential requests') ? 'OTP Phishing' : patterns.includes('Payment requests') ? 'Phishing' : 'Smishing',
    reasoning: `AI detected ${patterns.length} attack pattern(s) in this message. ${patterns.length >= 3 ? 'High confidence this is a coordinated scam attempt.' : 'Exercise caution and verify through official channels.'}`,
    attackPatterns: patterns.length ? patterns : ['Suspicious content'],
    recommendations: [
      'Do not click any links in the message',
      'Verify through official channels only',
      'Report to local authorities if money was lost',
      'Warn friends and family about this pattern',
    ],
  };
}
