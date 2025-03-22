import { storage } from "./storage";
import { InsertFeature, InsertComment } from "@shared/schema";

// We'll need a user ID for the creator of these features
// Assuming user ID 1 is the default admin user "Raj"
const DEFAULT_USER_ID = 1;

// Current date for reference
const NOW = new Date();

// Helper function to create a date in the future (days from now)
function futureDate(daysFromNow: number): Date {
  const date = new Date(NOW);
  date.setDate(date.getDate() + daysFromNow);
  return date;
}

// Helper function to create a date in the past (days ago)
function pastDate(daysAgo: number): Date {
  const date = new Date(NOW);
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// Sample AI SDR feature requests
const aiSdrFeatures: InsertFeature[] = [
  {
    title: "AI-Powered Lead Qualification",
    description: "Implement AI algorithms to automatically qualify leads based on fit, intent, and engagement data. Should integrate with existing CRM data.",
    createdById: DEFAULT_USER_ID,
    impactScore: 90,
    effortScore: 70,
    totalScore: 0, // Will be calculated
    status: "planning",
    customerType: "enterprise",
    customerCount: 15,
    category: "ai-feature",
    tags: ["ai", "lead-qualification", "automation"]
  },
  {
    title: "Multi-Channel Outreach Automation",
    description: "Create a system to automatically execute personalized outreach across email, LinkedIn, phone, and SMS based on prospect preferences and engagement patterns.",
    createdById: DEFAULT_USER_ID,
    impactScore: 85,
    effortScore: 65,
    totalScore: 0,
    status: "research",
    customerType: "enterprise",
    customerCount: 12,
    category: "communication",
    tags: ["multi-channel", "personalization", "automation"]
  },
  {
    title: "Sentiment Analysis for Prospect Responses",
    description: "Use NLP to analyze prospect responses and determine sentiment, interest level, and objections to inform follow-up strategy.",
    createdById: DEFAULT_USER_ID,
    impactScore: 75,
    effortScore: 45,
    totalScore: 0,
    status: "pending",
    customerType: "mid-market",
    customerCount: 8,
    category: "ai-feature",
    tags: ["nlp", "sentiment-analysis", "response-handling"]
  },
  {
    title: "AI Meeting Scheduler with Contextual Awareness",
    description: "Develop an AI assistant that can automatically schedule meetings by analyzing calendar availability, communication history, and conversation context.",
    createdById: DEFAULT_USER_ID,
    impactScore: 80,
    effortScore: 40,
    totalScore: 0,
    status: "development",
    customerType: "all",
    customerCount: 25,
    category: "productivity",
    tags: ["meeting-scheduler", "calendar-integration", "ai-assistant"]
  },
  {
    title: "Automated Competitive Intelligence",
    description: "Create a system that monitors prospect engagement with competitors and automatically provides relevant competitive intelligence to SDRs.",
    createdById: DEFAULT_USER_ID,
    impactScore: 70,
    effortScore: 80,
    totalScore: 0,
    status: "research",
    customerType: "enterprise",
    customerCount: 7,
    category: "market-intelligence",
    tags: ["competitive-intel", "market-monitoring", "sales-enablement"]
  },
  {
    title: "Personalized Outreach Content Generator",
    description: "AI tool that generates personalized outreach messages based on prospect data, company news, and historical engagement patterns.",
    createdById: DEFAULT_USER_ID,
    impactScore: 95,
    effortScore: 60,
    totalScore: 0,
    status: "planning",
    customerType: "all",
    customerCount: 30,
    category: "content",
    tags: ["content-generation", "personalization", "outreach"]
  },
  {
    title: "Predictive Lead Scoring",
    description: "Implement machine learning models to predict the likelihood of conversion for each lead based on historical data and current engagement.",
    createdById: DEFAULT_USER_ID,
    impactScore: 85,
    effortScore: 75,
    totalScore: 0,
    status: "pending",
    customerType: "enterprise",
    customerCount: 10,
    category: "ai-feature",
    tags: ["predictive-analytics", "lead-scoring", "ml"]
  },
  {
    title: "Voice Analytics for SDR Calls",
    description: "Implement real-time voice analysis tools for SDR calls to provide coaching on tone, pace, and effectiveness with auto-generated improvement recommendations.",
    createdById: DEFAULT_USER_ID,
    impactScore: 65,
    effortScore: 85,
    totalScore: 0,
    status: "backlog",
    customerType: "mid-market",
    customerCount: 5,
    category: "training",
    tags: ["voice-analytics", "coaching", "call-analysis"]
  },
  {
    title: "Account-Based Intelligence Dashboard",
    description: "Create a centralized dashboard that aggregates all available intelligence on target accounts including key contacts, recent news, and engagement history.",
    createdById: DEFAULT_USER_ID,
    impactScore: 75,
    effortScore: 55,
    totalScore: 0,
    status: "development",
    customerType: "enterprise",
    customerCount: 18,
    category: "dashboard",
    tags: ["abi", "account-intelligence", "dashboard"]
  },
  {
    title: "Automated Objection Handling Assistant",
    description: "AI tool that suggests appropriate responses to common objections in real-time during prospect conversations based on successful past interactions.",
    createdById: DEFAULT_USER_ID,
    impactScore: 80,
    effortScore: 50,
    totalScore: 0,
    status: "planning",
    customerType: "all",
    customerCount: 22,
    category: "sales-enablement",
    tags: ["objection-handling", "real-time-assistance", "conversation-intelligence"]
  }
];

// Sample comments for features
const sampleComments: InsertComment[] = [
  {
    featureId: 1, // Will be updated with actual feature IDs
    userId: DEFAULT_USER_ID,
    content: "This could significantly increase our conversion rates. Enterprise customers particularly mentioned this in the last advisory board."
  },
  {
    featureId: 1,
    userId: DEFAULT_USER_ID,
    content: "We should integrate this with our existing lead scoring system to avoid creating a parallel workflow."
  },
  {
    featureId: 2,
    userId: DEFAULT_USER_ID,
    content: "Multi-channel orchestration will be a key differentiator. Let's prioritize this for Q2."
  },
  {
    featureId: 6,
    userId: DEFAULT_USER_ID,
    content: "The content generation capability should leverage our existing messaging library to maintain brand consistency."
  },
  {
    featureId: 7,
    userId: DEFAULT_USER_ID,
    content: "We'll need to coordinate with the data science team for this. Initial models show promising accuracy."
  }
];

// Main function to seed the database
export async function seedAiSdrFeatures() {
  console.log("Starting to seed AI SDR features...");
  
  const createdFeatures = [];
  
  // Create all features
  for (const feature of aiSdrFeatures) {
    try {
      const createdFeature = await storage.createFeature(feature);
      console.log(`Created feature: ${createdFeature.title}`);
      createdFeatures.push(createdFeature);
    } catch (error) {
      console.error(`Failed to create feature "${feature.title}":`, error);
    }
  }
  
  // Add comments with correct feature IDs
  if (createdFeatures.length > 0) {
    for (let i = 0; i < sampleComments.length; i++) {
      const comment = sampleComments[i];
      // Adjust featureId to use actual created feature IDs
      const featureId = Math.min(comment.featureId, createdFeatures.length);
      
      try {
        const createdComment = await storage.createComment({
          ...comment,
          featureId: createdFeatures[featureId - 1].id
        });
        console.log(`Created comment for feature ID: ${createdComment.featureId}`);
      } catch (error) {
        console.error(`Failed to create comment:`, error);
      }
    }
  }
  
  console.log("Completed seeding AI SDR features!");
  return createdFeatures;
}

// Export the seed function
export default seedAiSdrFeatures;