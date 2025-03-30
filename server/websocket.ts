import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";
import { storage } from "./storage";

// Define message types for WebSocket communication
type WebSocketMessage = {
  type: string;
  payload: any;
};

export function setupWebSocketServer(httpServer: Server) {
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws: WebSocket) => {
    console.log('WebSocket client connected');

    ws.on('message', async (message: string) => {
      try {
        const data: WebSocketMessage = JSON.parse(message);
        
        switch (data.type) {
          case 'SUBSCRIBE_TRANSPORTATION':
            // Subscribe client to transportation updates
            ws.on('transportationUpdate', (transportationData) => {
              sendMessage(ws, 'TRANSPORTATION_UPDATE', transportationData);
            });
            break;
            
          case 'UNSUBSCRIBE_TRANSPORTATION':
            // Unsubscribe client from transportation updates
            ws.removeAllListeners('transportationUpdate');
            break;
            
          case 'UPDATE_TRANSPORTATION_LOCATION':
            // Update transportation location (for drivers/admin)
            if (data.payload && data.payload.id && data.payload.location) {
              const updatedTransportation = await storage.updateTransportationLocation(
                data.payload.id, 
                data.payload.location
              );
              
              // Broadcast to all connected clients
              broadcastTransportationUpdate(wss, updatedTransportation);
            }
            break;
            
          case 'PING':
            sendMessage(ws, 'PONG', { timestamp: new Date() });
            break;
            
          default:
            console.log(`Unknown message type: ${data.type}`);
        }
      } catch (err) {
        console.error('Error processing WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      // Clean up listeners
      ws.removeAllListeners('transportationUpdate');
    });

    // Send initial data
    sendInitialData(ws);
  });

  // Set up scheduled updates for transportation
  setInterval(() => {
    simulateTransportationMovement(wss);
  }, 10000); // Every 10 seconds

  return wss;
}

// Helper functions

function sendMessage(ws: WebSocket, type: string, payload: any) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type, payload }));
  }
}

function broadcastTransportationUpdate(wss: WebSocketServer, transportationData: any) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Use the event emitter pattern to notify subscribers
      client.emit('transportationUpdate', transportationData);
    }
  });
}

async function sendInitialData(ws: WebSocket) {
  try {
    // Send transportation data
    const transportation = await storage.getTransportation();
    sendMessage(ws, 'INITIAL_TRANSPORTATION_DATA', transportation);
  } catch (err) {
    console.error('Error sending initial data:', err);
  }
}

async function simulateTransportationMovement(wss: WebSocketServer) {
  try {
    const transportation = await storage.getTransportation();
    
    // Update each transportation with a simulated movement
    for (const transport of transportation) {
      // Simple simulation - small random movement
      const currentLat = transport.currentLocation?.latitude || 0;
      const currentLng = transport.currentLocation?.longitude || 0;
      
      const newLocation = {
        latitude: currentLat + (Math.random() * 0.001 - 0.0005),
        longitude: currentLng + (Math.random() * 0.001 - 0.0005)
      };
      
      const updatedTransport = await storage.updateTransportationLocation(transport.id, newLocation);
      
      // Update estimated arrival time
      const newArrival = new Date();
      newArrival.setMinutes(newArrival.getMinutes() + Math.floor(Math.random() * 10) + 1);
      
      // Broadcast the update
      broadcastTransportationUpdate(wss, updatedTransport);
    }
  } catch (err) {
    console.error('Error simulating transportation movement:', err);
  }
}
