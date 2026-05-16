import { mutation } from "./_generated/server";
import { hashPassword } from "./lib/password";

export const demoData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingReports = await ctx.db.query("reports").take(1);
    if (existingReports.length > 0) {
      return { seeded: false, message: "Database already has data" };
    }

    const now = Date.now();
    const reports = [
      {
        content:
          "URGENT: Your bank account will be suspended. Click here to verify: bit.ly/secure-bnk",
        platform: "sms" as const,
        region: "Colombo",
        scamType: "Phishing",
        severity: "CRITICAL" as const,
        aiScore: 92,
        aiReasoning:
          "Classic banking impersonation with urgency tactics and suspicious shortened URL.",
        attackPatterns: ["Urgency tactics", "Suspicious links", "Impersonation"],
        recommendations: [
          "Do not click the link",
          "Contact your bank directly",
          "Report to authorities",
        ],
        votesScam: 47,
        votesSuspicious: 8,
        votesSafe: 2,
        totalVotes: 57,
        createdAt: new Date(now - 3600000).toISOString(),
        status: "verified" as const,
      },
      {
        content:
          "Congratulations! You won $50,000 in the Mega Lottery. Pay processing fee of $200 to claim.",
        platform: "whatsapp" as const,
        region: "Kandy",
        scamType: "Lottery Scam",
        severity: "HIGH" as const,
        aiScore: 78,
        aiReasoning:
          "Too-good-to-be-true prize with upfront payment request — hallmark lottery fraud.",
        attackPatterns: ["Too-good-to-be-true", "Payment requests"],
        recommendations: [
          "Never pay to claim prizes",
          "Block the sender",
          "Warn contacts",
        ],
        votesScam: 34,
        votesSuspicious: 12,
        votesSafe: 1,
        totalVotes: 47,
        createdAt: new Date(now - 7200000).toISOString(),
        status: "verified" as const,
      },
      {
        content:
          "Hi, I am HR from TechCorp. Send your CV and pay $50 for background check to start immediately.",
        platform: "email" as const,
        region: "Galle",
        scamType: "Job Scam",
        severity: "HIGH" as const,
        aiScore: 71,
        aiReasoning:
          "Fake job offer requiring upfront payment before employment verification.",
        attackPatterns: ["Payment requests", "Impersonation"],
        recommendations: [
          "Verify company via official website",
          "Never pay for job applications",
        ],
        votesScam: 28,
        votesSuspicious: 15,
        votesSafe: 3,
        totalVotes: 46,
        createdAt: new Date(now - 14400000).toISOString(),
        status: "verified" as const,
      },
      {
        content:
          "Your OTP is 847291. Share this code to verify your identity for the refund process.",
        platform: "sms" as const,
        region: "Negombo",
        scamType: "OTP Phishing",
        severity: "CRITICAL" as const,
        aiScore: 88,
        aiReasoning:
          "Explicit request to share OTP codes — critical credential theft attempt.",
        attackPatterns: ["Credential requests", "Urgency tactics"],
        recommendations: [
          "Never share OTP codes",
          "Enable 2FA",
          "Contact service provider",
        ],
        votesScam: 52,
        votesSuspicious: 4,
        votesSafe: 0,
        totalVotes: 56,
        createdAt: new Date(now - 18000000).toISOString(),
        status: "verified" as const,
      },
      {
        content:
          "Limited crypto investment — 300% returns guaranteed in 30 days. DM for wallet address.",
        platform: "instagram" as const,
        region: "Jaffna",
        scamType: "Investment Scam",
        severity: "MEDIUM" as const,
        aiScore: 65,
        aiReasoning:
          "Unrealistic investment returns with cryptocurrency payment request.",
        attackPatterns: ["Too-good-to-be-true", "Payment requests"],
        recommendations: [
          "Research investment legitimacy",
          "Avoid crypto transfers to strangers",
        ],
        votesScam: 19,
        votesSuspicious: 22,
        votesSafe: 5,
        totalVotes: 46,
        createdAt: new Date(now - 28800000).toISOString(),
        status: "pending" as const,
      },
    ];

    for (const report of reports) {
      await ctx.db.insert("reports", report);
    }

    const campaigns = [
      {
        name: "Phishing Wave in Colombo",
        scamType: "Phishing",
        severity: "CRITICAL" as const,
        reportCount: 156,
        regionsAffected: ["Colombo", "Negombo", "Gampaha"],
        spreadVelocity: "fast" as const,
        trend: "rising" as const,
        hourlyRate: 24.5,
        firstSeen: new Date(now - 86400000 * 2).toISOString(),
        lastSeen: new Date(now).toISOString(),
      },
      {
        name: "OTP Phishing in Western Province",
        scamType: "OTP Phishing",
        severity: "HIGH" as const,
        reportCount: 89,
        regionsAffected: ["Colombo", "Kalutara"],
        spreadVelocity: "medium" as const,
        trend: "stable" as const,
        hourlyRate: 12.3,
        firstSeen: new Date(now - 86400000 * 5).toISOString(),
        lastSeen: new Date(now).toISOString(),
      },
      {
        name: "Job Scam Cluster — Nationwide",
        scamType: "Job Scam",
        severity: "MEDIUM" as const,
        reportCount: 45,
        regionsAffected: ["Kandy", "Galle", "Jaffna"],
        spreadVelocity: "slow" as const,
        trend: "declining" as const,
        hourlyRate: 4.2,
        firstSeen: new Date(now - 86400000 * 10).toISOString(),
        lastSeen: new Date(now - 3600000).toISOString(),
      },
    ];

    for (const campaign of campaigns) {
      await ctx.db.insert("campaigns", campaign);
    }

    const analystHash = await hashPassword("analyst@example.com", "analyst123");
    const adminHash = await hashPassword("admin@crowdshield.com", "admin123");

    const users = [
      {
        email: "analyst@example.com",
        username: "threat_hunter",
        role: "analyst" as const,
        subscriptionPlan: "monthly",
        subscriptionStatus: "active",
        reportsSubmitted: 23,
        createdAt: "2024-01-15",
        isActive: true,
        passwordHash: analystHash,
      },
      {
        email: "admin@crowdshield.com",
        username: "admin",
        role: "admin" as const,
        subscriptionPlan: "annual",
        subscriptionStatus: "active",
        reportsSubmitted: 0,
        createdAt: "2024-01-15",
        isActive: true,
        passwordHash: adminHash,
      },
      {
        email: "user@mail.com",
        username: "citizen_42",
        role: "public" as const,
        subscriptionPlan: "free",
        subscriptionStatus: "active",
        reportsSubmitted: 5,
        createdAt: "2024-03-20",
        isActive: true,
      },
      {
        email: "pro@security.io",
        username: "cyber_guard",
        role: "analyst" as const,
        subscriptionPlan: "annual",
        subscriptionStatus: "active",
        reportsSubmitted: 67,
        createdAt: "2023-11-08",
        isActive: true,
        passwordHash: analystHash,
      },
      {
        email: "inactive@test.com",
        username: "old_user",
        role: "public" as const,
        subscriptionPlan: "free",
        subscriptionStatus: "expired",
        reportsSubmitted: 1,
        createdAt: "2023-06-01",
        isActive: false,
      },
    ];

    for (const user of users) {
      await ctx.db.insert("users", user);
    }

    const subscriptions = [
      {
        userEmail: "analyst@example.com",
        plan: "monthly" as const,
        amount: 49,
        status: "active" as const,
        nextBilling: "2024-06-15",
      },
      {
        userEmail: "pro@security.io",
        plan: "annual" as const,
        amount: 348,
        status: "active" as const,
        nextBilling: "2025-01-08",
      },
      {
        userEmail: "late@pay.com",
        plan: "monthly" as const,
        amount: 49,
        status: "past_due" as const,
        nextBilling: "2024-05-10",
      },
      {
        userEmail: "cancelled@user.com",
        plan: "monthly" as const,
        amount: 49,
        status: "cancelled" as const,
        nextBilling: "2024-05-01",
      },
    ];

    for (const sub of subscriptions) {
      await ctx.db.insert("subscriptions", sub);
    }

    await ctx.db.insert("supportMessages", {
      subject: "Cannot access geo map",
      message:
        "I subscribed yesterday but the geo intelligence map shows a blank screen.",
      userEmail: "analyst@example.com",
      status: "new",
      priority: "high",
      createdAt: new Date(now - 7200000).toISOString(),
      replies: [],
    });

    await ctx.db.insert("supportMessages", {
      subject: "Refund request for annual plan",
      message:
        "I would like to request a refund for my annual subscription purchased last week.",
      userEmail: "pro@security.io",
      status: "replied",
      priority: "medium",
      createdAt: new Date(now - 86400000).toISOString(),
      replies: [
        {
          text: "We have received your request and will process it within 5 business days.",
          isAdmin: true,
          createdAt: new Date(now - 43200000).toISOString(),
        },
      ],
    });

    return { seeded: true, message: "Demo data inserted" };
  },
});
