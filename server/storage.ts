import { 
  users, type User, type InsertUser, 
  features, type Feature, type InsertFeature,
  scoringCriteria, type ScoringCriteria, type InsertScoringCriteria,
  comments, type Comment, type InsertComment 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  }
  
  // Creates a default user for testing
  private async createDefaultUser() {
    const existingUser = await this.getUserByUsername("Raj");
    if (!existingUser) {
      // Hash the password 'Raj'
      const salt = "5a7d9c4b3e1f8a2d7c4b3e1f";
      const hashedPassword = "52193a0f40d2c1ee87ff9ea32f7c13d6c55ad29d55e05d8cea51c4a88b7bae9f11a3f80553cbc82afc97d80c19b099bfb49b3fcc3c53ef0fd11c6e8cfba0bc71.5a7d9c4b3e1f8a2d7c4b3e1f";
      
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
}

export const storage = new MemStorage();
