import { Server } from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import { storage } from './storage';
import { Transportation } from '@shared/schema';

type WebSocketMessage = {
  type: string;
  payload: any;
};

export function setupWebSocketServer(httpServer: Server) {
  // Create a WebSocket server instance
  const wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws'  // Make sure this is different from Vite's HMR WebSocket path
  });
  
  console.log('WebSocket server initialized');

  // Handle new WebSocket connections
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket client connected');
    
    // Send initial data to client
    sendInitialData(ws);
    
    // Handle incoming messages
    ws.on('message', async (message) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.toString());
        console.log('Received message:', data);
        
        switch (data.type) {
          case 'transportation_update':
            // Handle transportation updates (from mobile apps/transportation vehicles)
            if (data.payload.id && data.payload.location) {
              const updatedTransport = await storage.updateTransportationLocation(
                data.payload.id,
                data.payload.location
              );
              broadcastTransportationUpdate(wss, updatedTransport);
            }
            break;
            
          case 'subscribe_user_notifications':
            // Store user ID in WebSocket client for notifications
            (ws as any).userId = data.payload.userId;
            // Send existing notifications to the user
            if (data.payload.userId) {
              const notifications = await storage.getUserNotifications(data.payload.userId);
              sendMessage(ws, 'notifications_update', notifications);
            }
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    });
    
    // Handle client disconnection
    ws.on('close', () => {
      console.log('WebSocket client disconnected');
    });
  });
  
  // Start simulating transportation movement for demo purposes
  simulateTransportationMovement(wss);
  
  return wss;
}

function sendMessage(ws: WebSocket, type: string, payload: any) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
  }
}

function broadcastTransportationUpdate(wss: WebSocketServer, transportationData: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      sendMessage(client, 'transportation_update', transportationData);
    }
  });
}

async function sendInitialData(ws: WebSocket) {
  try {
    // Send initial transportation data
    const transportationData = await storage.getTransportation();
    sendMessage(ws, 'transportation_initial', transportationData);
    
    // Send initial events data
    const events = await storage.getEvents();
    sendMessage(ws, 'events_initial', events);
  } catch (error) {
    console.error('Error sending initial data:', error);
  }
}

async function simulateTransportationMovement(wss: WebSocketServer) {
  setInterval(async () => {
    try {
      const transports = await storage.getTransportation();
      
      for (const transport of transports) {
        // Only process transports with valid current location
        if (transport.currentLocation && 
           typeof transport.currentLocation.latitude === 'number' && 
           typeof transport.currentLocation.longitude === 'number') {
          // Create a small random movement
          const latChange = (Math.random() - 0.5) * 0.0005;
          const lngChange = (Math.random() - 0.5) * 0.0005;
          
          const newLocation = {
            latitude: transport.currentLocation.latitude + latChange,
            longitude: transport.currentLocation.longitude + lngChange
          };
          
          // Update the transport location
          const updatedTransport = await storage.updateTransportationLocation(transport.id, newLocation);
          
          // Broadcast the update to all connected clients
          broadcastTransportationUpdate(wss, updatedTransport);
        }
      }
    } catch (error) {
      console.error('Error simulating transportation movement:', error);
    }
  }, 5000); // Update every 5 seconds
}