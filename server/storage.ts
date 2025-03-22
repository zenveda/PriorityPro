import { 
  users, type User, type InsertUser, 
  features, type Feature, type InsertFeature,
  scoringCriteria, type ScoringCriteria, type InsertScoringCriteria,
  comments, type Comment, type InsertComment 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

// Added this function to hash passwords without circular dependency
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Feature operations
  getFeatures(): Promise<Feature[]>;
  getFeature(id: number): Promise<Feature | undefined>;
  createFeature(feature: InsertFeature): Promise<Feature>;
  updateFeature(id: number, feature: Partial<InsertFeature>): Promise<Feature | undefined>;
  deleteFeature(id: number): Promise<boolean>;
  
  // Scoring criteria operations
  getScoringCriteria(): Promise<ScoringCriteria[]>;
  createScoringCriteria(criteria: InsertScoringCriteria): Promise<ScoringCriteria>;
  updateScoringCriteria(id: number, criteria: Partial<InsertScoringCriteria>): Promise<ScoringCriteria | undefined>;
  
  // Comment operations
  getCommentsByFeature(featureId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  
  sessionStore: any; // Using any for session store to avoid type issues
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private features: Map<number, Feature>;
  private criterias: Map<number, ScoringCriteria>;
  private comments: Map<number, Comment>;
  private userIdCounter: number;
  private featureIdCounter: number;
  private criteriaIdCounter: number;
  private commentIdCounter: number;
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.features = new Map();
    this.criterias = new Map();
    this.comments = new Map();
    this.userIdCounter = 1;
    this.featureIdCounter = 1;
    this.criteriaIdCounter = 1;
    this.commentIdCounter = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // 24 hours
    });
    
    // Initialize default scoring criteria
    this.initDefaultScoringCriteria();
    
    // Create default user (for development purposes only)
    this.createDefaultUser();
    
    // Seed initial feature data for demonstration
    this.seedInitialData();
  }
  
  // Creates a default user for testing
  private async createDefaultUser() {
    const existingUser = await this.getUserByUsername("Raj");
    if (!existingUser) {
      // Hash the password 'Raj'
      const hashedPassword = await hashPassword("Raj");
      
      // Create the default user
      this.createUser({
        username: "Raj",
        password: hashedPassword,
        name: "Raj Kumar",
        role: "Admin"
      });
      
      console.log("Default user 'Raj' created with password 'Raj'");
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Feature operations
  async getFeatures(): Promise<Feature[]> {
    return Array.from(this.features.values());
  }

  async getFeature(id: number): Promise<Feature | undefined> {
    return this.features.get(id);
  }

  async createFeature(insertFeature: InsertFeature): Promise<Feature> {
    const id = this.featureIdCounter++;
    const now = new Date();
    const feature: Feature = { 
      ...insertFeature, 
      id, 
      createdAt: now, 
      updatedAt: now 
    };
    
    // Calculate total score based on impact and effort
    feature.totalScore = this.calculateTotalScore(feature);
    
    this.features.set(id, feature);
    return feature;
  }

  async updateFeature(id: number, updateData: Partial<InsertFeature>): Promise<Feature | undefined> {
    const feature = this.features.get(id);
    if (!feature) return undefined;

    const updatedFeature: Feature = { 
      ...feature, 
      ...updateData, 
      updatedAt: new Date() 
    };
    
    // Recalculate total score if impact or effort changed
    if (updateData.impactScore !== undefined || updateData.effortScore !== undefined) {
      updatedFeature.totalScore = this.calculateTotalScore(updatedFeature);
    }
    
    this.features.set(id, updatedFeature);
    return updatedFeature;
  }

  async deleteFeature(id: number): Promise<boolean> {
    return this.features.delete(id);
  }

  // Scoring criteria operations
  async getScoringCriteria(): Promise<ScoringCriteria[]> {
    return Array.from(this.criterias.values())
      .sort((a, b) => a.order - b.order);
  }

  async createScoringCriteria(insertCriteria: InsertScoringCriteria): Promise<ScoringCriteria> {
    const id = this.criteriaIdCounter++;
    const criteria: ScoringCriteria = { ...insertCriteria, id };
    this.criterias.set(id, criteria);
    return criteria;
  }

  async updateScoringCriteria(id: number, updateData: Partial<InsertScoringCriteria>): Promise<ScoringCriteria | undefined> {
    const criteria = this.criterias.get(id);
    if (!criteria) return undefined;

    const updatedCriteria: ScoringCriteria = { ...criteria, ...updateData };
    this.criterias.set(id, updatedCriteria);
    return updatedCriteria;
  }

  // Comment operations
  async getCommentsByFeature(featureId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.featureId === featureId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const now = new Date();
    const comment: Comment = { ...insertComment, id, createdAt: now };
    this.comments.set(id, comment);
    return comment;
  }

  // Helper methods
  private calculateTotalScore(feature: Feature): number {
    // Simple calculation for the total score based on impact and effort
    // Higher impact is better, lower effort is better
    return Math.floor((feature.impactScore * 0.7) + ((100 - feature.effortScore) * 0.3));
  }

  private initDefaultScoringCriteria() {
    const defaultCriteria = [
      {
        name: "Revenue Impact",
        description: "Potential revenue generation or retention",
        weight: 30,
        order: 1
      },
      {
        name: "Strategic Alignment",
        description: "Fit with company roadmap and goals",
        weight: 25,
        order: 2
      },
      {
        name: "Implementation Effort",
        description: "Development and deployment resources required",
        weight: 20,
        order: 3
      },
      {
        name: "Customer Demand",
        description: "Volume and tier of customer requests",
        weight: 15,
        order: 4
      },
      {
        name: "Technical Debt",
        description: "Impact on maintainability and architecture",
        weight: 10,
        order: 5
      }
    ];

    defaultCriteria.forEach(criteria => {
      this.createScoringCriteria(criteria);
    });
  }
  
  private async seedInitialData() {
    // Only seed if there are no features yet
    const features = await this.getFeatures();
    if (features.length > 0) {
      console.log("Features already exist, skipping initial data seed");
      return;
    }
    
    console.log("Seeding initial feature data...");
    
    // Sample AI SDR feature requests with B2B SaaS context
    const aiSdrFeatures = [
      {
        title: "AI-Powered Lead Qualification",
        description: "Implement AI algorithms to automatically qualify leads based on fit, intent, and engagement data. Should integrate with existing CRM data.",
        createdById: 1, // Default user ID
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
        createdById: 1,
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
        createdById: 1,
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
        createdById: 1,
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
        createdById: 1,
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
        createdById: 1,
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
        createdById: 1,
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
        createdById: 1,
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
        createdById: 1,
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
        createdById: 1,
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
    
    // Create all features
    const createdFeatures = [];
    for (const feature of aiSdrFeatures) {
      try {
        const createdFeature = await this.createFeature(feature);
        console.log(`Seeded feature: ${createdFeature.title}`);
        createdFeatures.push(createdFeature);
      } catch (error) {
        console.error(`Failed to seed feature "${feature.title}":`, error);
      }
    }
    
    // Add sample comments
    if (createdFeatures.length > 0) {
      const sampleComments = [
        {
          featureId: 1,
          userId: 1,
          content: "This could significantly increase our conversion rates. Enterprise customers particularly mentioned this in the last advisory board."
        },
        {
          featureId: 1,
          userId: 1,
          content: "We should integrate this with our existing lead scoring system to avoid creating a parallel workflow."
        },
        {
          featureId: 2,
          userId: 1,
          content: "Multi-channel orchestration will be a key differentiator. Let's prioritize this for Q2."
        },
        {
          featureId: 6,
          userId: 1,
          content: "The content generation capability should leverage our existing messaging library to maintain brand consistency."
        },
        {
          featureId: 7,
          userId: 1,
          content: "We'll need to coordinate with the data science team for this. Initial models show promising accuracy."
        }
      ];
      
      for (const comment of sampleComments) {
        try {
          await this.createComment({
            ...comment,
            featureId: createdFeatures[comment.featureId - 1].id
          });
          console.log(`Seeded comment for feature ID: ${comment.featureId}`);
        } catch (error) {
          console.error("Failed to seed comment:", error);
        }
      }
    }
    
    console.log(`Successfully seeded ${createdFeatures.length} AI SDR features!`);
  }
}

export const storage = new MemStorage();
