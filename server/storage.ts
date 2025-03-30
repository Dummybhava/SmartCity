import {
  users, type User, type InsertUser,
  events, type Event, type InsertEvent,
  attractions, type Attraction, type InsertAttraction,
  transportation, type Transportation, type InsertTransportation,
  feedback, type Feedback, type InsertFeedback,
  notifications, type Notification, type InsertNotification
} from "@shared/schema";
import { db, connectToMongo, connectToMySql, sitecoreService, pool } from "./db";
import { eq, and } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import createMemoryStore from "memorystore";

// Storage interface 
export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(id: number, preferences: any): Promise<User>;

  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Attractions
  getAttractions(): Promise<Attraction[]>;
  getAttraction(id: number): Promise<Attraction | undefined>;
  createAttraction(attraction: InsertAttraction): Promise<Attraction>;

  // Transportation
  getTransportation(): Promise<Transportation[]>;
  getTransportationById(id: number): Promise<Transportation | undefined>;
  createTransportation(transport: InsertTransportation): Promise<Transportation>;
  updateTransportationLocation(id: number, location: { latitude: number; longitude: number }): Promise<Transportation>;

  // Feedback
  getAllFeedback(): Promise<Feedback[]>;
  getUserFeedback(userId: number): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  
  // Notifications
  getUserNotifications(userId: number): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification>;

  // Session store
  sessionStore: any; // The type for session store
}

// PostgreSQL session store
const PostgresSessionStore = connectPg(session);
const MemoryStore = createMemoryStore(session);

// Database storage implementation that uses multiple databases as required
export class DatabaseStorage implements IStorage {
  sessionStore: any; // Using any for session store

  constructor() {
    // Use PostgreSQL for session store
    try {
      const pgPool = pool;
      this.sessionStore = new PostgresSessionStore({ 
        pool: pgPool,
        createTableIfMissing: true 
      });
      console.log("Using PostgreSQL for session store");
    } catch (error) {
      console.error("Failed to initialize PostgreSQL session store, falling back to memory store", error);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      });
    }
    
    // Initialize connections
    this.initConnections();
  }

  private async initConnections() {
    try {
      // Connect to MongoDB and MySQL
      await connectToMongo();
      await connectToMySql();
    } catch (error) {
      console.error("Error initializing database connections:", error);
    }
  }

  // User methods (using PostgreSQL with Drizzle ORM)
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }
  
  async updateUserPreferences(id: number, preferences: any): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        preferences: {
          ...preferences
        } 
      })
      .where(eq(users.id, id))
      .returning();
    return user;
  }
  
  // Events methods (using MySQL)
  async getEvents(): Promise<Event[]> {
    try {
      const mysqlPool = await connectToMySql();
      const [rows] = await mysqlPool.query('SELECT * FROM events ORDER BY start_date');
      return rows as Event[];
    } catch (error) {
      console.error("Error fetching events from MySQL:", error);
      // Fallback to PostgreSQL
      return db.select().from(events).orderBy(events.startDate);
    }
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    try {
      const mysqlPool = await connectToMySql();
      const [rows] = await mysqlPool.query('SELECT * FROM events WHERE id = ?', [id]);
      const eventRows = rows as Event[];
      return eventRows.length > 0 ? eventRows[0] : undefined;
    } catch (error) {
      console.error("Error fetching event from MySQL:", error);
      // Fallback to PostgreSQL
      const [event] = await db.select().from(events).where(eq(events.id, id));
      return event || undefined;
    }
  }
  
  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    // First, check for content in Sitecore if it's a managed event
    try {
      await sitecoreService.getContent(`/events/${insertEvent.title}`);
    } catch (error) {
      console.log("Event not found in Sitecore, continuing with database insert");
    }
    
    // Insert into MySQL
    try {
      const mysqlPool = await connectToMySql();
      const [result] = await mysqlPool.query(
        'INSERT INTO events (title, description, location, start_date, end_date, image_url) VALUES (?, ?, ?, ?, ?, ?)',
        [
          insertEvent.title,
          insertEvent.description,
          insertEvent.location,
          insertEvent.startDate,
          insertEvent.endDate,
          insertEvent.imageUrl || null
        ]
      );
      
      const id = (result as any).insertId;
      return {
        ...insertEvent,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        imageUrl: insertEvent.imageUrl || null
      };
    } catch (error) {
      console.error("Error creating event in MySQL:", error);
      // Fallback to PostgreSQL
      const [event] = await db
        .insert(events)
        .values(insertEvent)
        .returning();
      return event;
    }
  }
  
  // Attractions methods (using MongoDB)
  async getAttractions(): Promise<Attraction[]> {
    try {
      const mongodb = await connectToMongo();
      const attractions = await mongodb.collection('attractions').find({}).toArray();
      return attractions as Attraction[];
    } catch (error) {
      console.error("Error fetching attractions from MongoDB:", error);
      // Fallback to PostgreSQL
      return db.select().from(attractions);
    }
  }
  
  async getAttraction(id: number): Promise<Attraction | undefined> {
    try {
      const mongodb = await connectToMongo();
      const attraction = await mongodb.collection('attractions').findOne({ id });
      return attraction as Attraction || undefined;
    } catch (error) {
      console.error("Error fetching attraction from MongoDB:", error);
      // Fallback to PostgreSQL
      const [attraction] = await db.select().from(attractions).where(eq(attractions.id, id));
      return attraction || undefined;
    }
  }
  
  async createAttraction(insertAttraction: InsertAttraction): Promise<Attraction> {
    // Check for content in Sitecore
    try {
      await sitecoreService.getContent(`/attractions/${insertAttraction.name}`);
    } catch (error) {
      console.log("Attraction not found in Sitecore, continuing with database insert");
    }
    
    try {
      const mongodb = await connectToMongo();
      
      // Get the next ID
      const maxIdResult = await mongodb.collection('attractions')
        .find({})
        .sort({ id: -1 })
        .limit(1)
        .toArray();
      
      const nextId = maxIdResult.length > 0 ? maxIdResult[0].id + 1 : 1;
      
      const timestamp = new Date();
      const attraction: Attraction = {
        ...insertAttraction,
        id: nextId,
        createdAt: timestamp,
        updatedAt: timestamp,
        imageUrl: insertAttraction.imageUrl || null,
        contactInfo: insertAttraction.contactInfo || null,
        coordinates: insertAttraction.coordinates || null,
        openingHours: insertAttraction.openingHours || null
      };
      
      await mongodb.collection('attractions').insertOne(attraction);
      return attraction;
    } catch (error) {
      console.error("Error creating attraction in MongoDB:", error);
      // Fallback to PostgreSQL
      const [attraction] = await db
        .insert(attractions)
        .values(insertAttraction)
        .returning();
      return attraction;
    }
  }
  
  // Transportation methods (using PostgreSQL)
  async getTransportation(): Promise<Transportation[]> {
    return db.select().from(transportation);
  }
  
  async getTransportationById(id: number): Promise<Transportation | undefined> {
    const [transport] = await db.select().from(transportation).where(eq(transportation.id, id));
    return transport || undefined;
  }
  
  async createTransportation(insertTransportation: InsertTransportation): Promise<Transportation> {
    const [transport] = await db
      .insert(transportation)
      .values(insertTransportation)
      .returning();
    return transport;
  }
  
  async updateTransportationLocation(id: number, location: { latitude: number; longitude: number }): Promise<Transportation> {
    const [transport] = await db
      .update(transportation)
      .set({ 
        currentLocation: location,
        updatedAt: new Date()
      })
      .where(eq(transportation.id, id))
      .returning();
    return transport;
  }
  
  // Feedback methods (using PostgreSQL)
  async getAllFeedback(): Promise<Feedback[]> {
    return db.select().from(feedback).orderBy(feedback.createdAt);
  }
  
  async getUserFeedback(userId: number): Promise<Feedback[]> {
    return db
      .select()
      .from(feedback)
      .where(eq(feedback.userId, userId))
      .orderBy(feedback.createdAt);
  }
  
  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedbackItem] = await db
      .insert(feedback)
      .values(insertFeedback)
      .returning();
    return feedbackItem;
  }
  
  // Notification methods (using PostgreSQL)
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(notifications.createdAt);
  }
  
  async getNotification(id: number): Promise<Notification | undefined> {
    const [notification] = await db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return notification || undefined;
  }
  
  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }
  
  async markNotificationAsRead(id: number): Promise<Notification> {
    const [notification] = await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, id))
      .returning();
    return notification;
  }
}

// For backward compatibility, keep the MemStorage class, but use DatabaseStorage as the default
export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private eventsMap: Map<number, Event>;
  private attractionsMap: Map<number, Attraction>;
  private transportationMap: Map<number, Transportation>;
  private feedbackMap: Map<number, Feedback>;
  private notificationsMap: Map<number, Notification>;
  
  sessionStore: any; // Using any for session store
  
  private userId: number;
  private eventId: number;
  private attractionId: number;
  private transportationId: number;
  private feedbackId: number;
  private notificationId: number;

  constructor() {
    this.usersMap = new Map();
    this.eventsMap = new Map();
    this.attractionsMap = new Map();
    this.transportationMap = new Map();
    this.feedbackMap = new Map();
    this.notificationsMap = new Map();
    
    this.userId = 1;
    this.eventId = 1;
    this.attractionId = 1;
    this.transportationId = 1;
    this.feedbackId = 1;
    this.notificationId = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });
    
    // Add some initial data
    this.seedData();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const timestamp = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: timestamp,
      name: insertUser.name || null,
      role: insertUser.role || 'user',
      preferences: insertUser.preferences || null
    };
    this.usersMap.set(id, user);
    return user;
  }

  async updateUserPreferences(id: number, preferences: any): Promise<User> {
    const user = await this.getUser(id);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = {
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences
      }
    };
    
    this.usersMap.set(id, updatedUser);
    return updatedUser;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.eventsMap.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.eventsMap.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const timestamp = new Date();
    const event: Event = { 
      ...insertEvent, 
      id, 
      createdAt: timestamp,
      updatedAt: timestamp,
      imageUrl: insertEvent.imageUrl || null
    };
    this.eventsMap.set(id, event);
    return event;
  }

  // Attraction methods
  async getAttractions(): Promise<Attraction[]> {
    return Array.from(this.attractionsMap.values());
  }

  async getAttraction(id: number): Promise<Attraction | undefined> {
    return this.attractionsMap.get(id);
  }

  async createAttraction(insertAttraction: InsertAttraction): Promise<Attraction> {
    const id = this.attractionId++;
    const timestamp = new Date();
    const attraction: Attraction = { 
      ...insertAttraction, 
      id, 
      createdAt: timestamp,
      updatedAt: timestamp,
      imageUrl: insertAttraction.imageUrl || null,
      contactInfo: insertAttraction.contactInfo || null,
      coordinates: insertAttraction.coordinates || null,
      openingHours: insertAttraction.openingHours || null
    };
    this.attractionsMap.set(id, attraction);
    return attraction;
  }

  // Transportation methods
  async getTransportation(): Promise<Transportation[]> {
    return Array.from(this.transportationMap.values());
  }

  async getTransportationById(id: number): Promise<Transportation | undefined> {
    return this.transportationMap.get(id);
  }

  async createTransportation(insertTransportation: InsertTransportation): Promise<Transportation> {
    const id = this.transportationId++;
    const timestamp = new Date();
    const transportation: Transportation = { 
      ...insertTransportation, 
      id, 
      updatedAt: timestamp,
      status: insertTransportation.status || null,
      route: insertTransportation.route || null,
      currentLocation: insertTransportation.currentLocation || null,
      capacity: insertTransportation.capacity || null,
      nextStop: insertTransportation.nextStop || null,
      estimatedArrival: insertTransportation.estimatedArrival || null
    };
    this.transportationMap.set(id, transportation);
    return transportation;
  }

  async updateTransportationLocation(id: number, location: { latitude: number; longitude: number }): Promise<Transportation> {
    const transport = await this.getTransportationById(id);
    if (!transport) {
      throw new Error("Transportation not found");
    }
    
    const updatedTransport = {
      ...transport,
      currentLocation: location,
      updatedAt: new Date()
    };
    
    this.transportationMap.set(id, updatedTransport);
    return updatedTransport;
  }

  // Feedback methods
  async getAllFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedbackMap.values());
  }

  async getUserFeedback(userId: number): Promise<Feedback[]> {
    return Array.from(this.feedbackMap.values())
      .filter(feedback => feedback.userId === userId);
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = this.feedbackId++;
    const timestamp = new Date();
    const feedback: Feedback = { 
      ...insertFeedback, 
      id, 
      createdAt: timestamp,
      updatedAt: timestamp,
      status: insertFeedback.status || 'pending',
      response: insertFeedback.response || null
    };
    this.feedbackMap.set(id, feedback);
    return feedback;
  }

  // Notification methods
  async getUserNotifications(userId: number): Promise<Notification[]> {
    return Array.from(this.notificationsMap.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notificationsMap.get(id);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.notificationId++;
    const timestamp = new Date();
    const notification: Notification = { 
      ...insertNotification, 
      id, 
      createdAt: timestamp,
      read: insertNotification.read || false,
      relatedId: insertNotification.relatedId || null
    };
    this.notificationsMap.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = await this.getNotification(id);
    if (!notification) {
      throw new Error("Notification not found");
    }
    
    const updatedNotification = {
      ...notification,
      read: true
    };
    
    this.notificationsMap.set(id, updatedNotification);
    return updatedNotification;
  }

  // Seed data for development
  private seedData() {
    // Seed events
    const events: InsertEvent[] = [
      {
        title: "Smart City Tech Conference",
        description: "Join us for the annual Smart City Technology Conference showcasing the latest innovations.",
        location: "Innovation Hub",
        startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000), // 8 hours after start
        imageUrl: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
      },
      {
        title: "Sustainability Workshop",
        description: "Learn about sustainable practices and how to reduce your carbon footprint.",
        location: "Green Plaza",
        startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours after start
        imageUrl: "https://images.unsplash.com/photo-1516937941344-00b4e0337589?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
      },
      {
        title: "Community Cleanup Day",
        description: "Join fellow residents in cleaning up the city parks and public spaces.",
        location: "Central Park",
        startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours after start
        imageUrl: "https://images.unsplash.com/photo-1527525443983-6e60c75fff46?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
      },
      {
        title: "Smart City Farmers Market",
        description: "Shop fresh produce and artisanal goods from local vendors.",
        location: "City Square",
        startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000 + 6 * 60 * 60 * 1000), // 6 hours after start
        imageUrl: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60"
      }
    ];

    events.forEach(event => {
      this.createEvent(event);
    });

    // Seed attractions
    const attractions: InsertAttraction[] = [
      {
        name: "Innovation Hub",
        description: "A collaborative space for tech enthusiasts and entrepreneurs to develop smart city solutions.",
        category: "Education",
        location: "Downtown",
        coordinates: { latitude: 40.7128, longitude: -74.006 },
        imageUrl: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        contactInfo: "info@innovationhub.com",
        openingHours: "Mon-Fri: 9:00 AM - 6:00 PM"
      },
      {
        name: "Green Café",
        description: "Organic coffee and sustainable food options in a eco-friendly setting.",
        category: "Food & Beverage",
        location: "Eco District",
        coordinates: { latitude: 40.7139, longitude: -74.013 },
        imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        contactInfo: "hello@greencafe.com",
        openingHours: "Daily: 7:00 AM - 8:00 PM"
      },
      {
        name: "Tech Museum",
        description: "Interactive exhibits showcasing the evolution of technology and its impact on urban living.",
        category: "Museum",
        location: "Innovation District",
        coordinates: { latitude: 40.7119, longitude: -74.008 },
        imageUrl: "https://images.unsplash.com/photo-1553949333-0df95f4e74b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        contactInfo: "visit@techmuseum.org",
        openingHours: "Tue-Sun: 10:00 AM - 5:00 PM"
      },
      {
        name: "Smart Shopping Center",
        description: "A retail hub featuring the latest consumer technology and smart home products.",
        category: "Retailer",
        location: "Commercial District",
        coordinates: { latitude: 40.7150, longitude: -74.009 },
        imageUrl: "https://images.unsplash.com/photo-1581417478175-a9ef18f210c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60",
        contactInfo: "info@smartshopping.com",
        openingHours: "Daily: 10:00 AM - 9:00 PM"
      }
    ];

    attractions.forEach(attraction => {
      this.createAttraction(attraction);
    });

    // Seed transportation
    const transportations: InsertTransportation[] = [
      {
        type: "PRT",
        name: "Green Line",
        route: "Innovation Hub - City Center - Tech Park",
        currentLocation: { latitude: 40.7128, longitude: -74.006 },
        status: "active",
        capacity: 20,
        nextStop: "City Center",
        estimatedArrival: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes from now
      },
      {
        type: "Shuttle",
        name: "Courtesy Shuttle 1",
        route: "Airport - Hotel District - Downtown",
        currentLocation: { latitude: 40.7139, longitude: -74.013 },
        status: "active",
        capacity: 12,
        nextStop: "Hotel District",
        estimatedArrival: new Date(Date.now() + 8 * 60 * 1000) // 8 minutes from now
      },
      {
        type: "Bus",
        name: "Route 42",
        route: "Residential Area - Business District - Shopping Center",
        currentLocation: { latitude: 40.7119, longitude: -74.008 },
        status: "active",
        capacity: 40,
        nextStop: "Business District",
        estimatedArrival: new Date(Date.now() + 12 * 60 * 1000) // 12 minutes from now
      }
    ];

    transportations.forEach(transport => {
      this.createTransportation(transport);
    });
  }
}

// Use database storage instead of memory storage
export const storage = new DatabaseStorage();
