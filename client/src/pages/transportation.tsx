import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "@/components/layout/page-container";
import { Transportation } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Clock, LocateFixed, Route, Car, Train, Bus, Truck, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

export default function TransportationPage() {
  const [transportationType, setTransportationType] = useState<string>("all");
  const [transportationData, setTransportationData] = useState<Transportation[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  
  const { data: initialTransportation, isLoading } = useQuery<Transportation[]>({
    queryKey: ["/api/transportation"],
  });

  useEffect(() => {
    if (initialTransportation) {
      setTransportationData(initialTransportation);
    }
  }, [initialTransportation]);

  // Set up WebSocket connection with reconnection logic
  useEffect(() => {
    let reconnectInterval: number | undefined;
    let ws: WebSocket | null = null;
    
    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      // Clear any existing socket
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.close();
      }
      
      try {
        ws = new WebSocket(wsUrl);
        socketRef.current = ws;
        
        ws.onopen = () => {
          console.log("WebSocket connection established");
          // Clear any reconnect interval if it exists
          if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = undefined;
          }
          
          // Subscribe to transportation updates
          if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ 
              type: "SUBSCRIBE_TRANSPORTATION"
            }));
          }
        };
        
        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === "TRANSPORTATION_UPDATE") {
              // Update the specific transportation item
              setTransportationData(prevData => 
                prevData.map(item => 
                  item.id === message.payload.id ? message.payload : item
                )
              );
            } else if (message.type === "INITIAL_TRANSPORTATION_DATA") {
              // Set initial data
              console.log("Received initial transportation data:", message.payload);
              setTransportationData(message.payload);
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };
        
        ws.onerror = (error) => {
          console.error("WebSocket error:", error);
          // Don't try to reconnect here, wait for onclose
        };
        
        ws.onclose = (event) => {
          console.log(`WebSocket closed with code: ${event.code}, reason: ${event.reason}`);
          
          // Only try to reconnect if we don't already have a reconnect interval
          if (!reconnectInterval) {
            console.log("Setting up reconnection...");
            reconnectInterval = window.setInterval(() => {
              console.log("Attempting to reconnect WebSocket...");
              connectWebSocket();
            }, 5000); // Try to reconnect every 5 seconds
          }
        };
      } catch (error) {
        console.error("Error creating WebSocket:", error);
      }
    };
    
    // Initial connection
    connectWebSocket();
    
    // Clean up WebSocket connection
    return () => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        try {
          socketRef.current.send(JSON.stringify({ 
            type: "UNSUBSCRIBE_TRANSPORTATION"
          }));
        } catch (error) {
          console.error("Error sending unsubscribe message:", error);
        }
        socketRef.current.close();
      }
      
      // Clear any reconnect interval
      if (reconnectInterval) {
        clearInterval(reconnectInterval);
      }
    };
  }, []);

  // Filter transportation based on type
  const filteredTransportation = transportationData?.filter((transport) => {
    return transportationType === "all" || transport.type === transportationType;
  });

  // Get icon based on transport type
  const getTransportIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'prt':
        return <Train className="h-5 w-5" />;
      case 'shuttle':
        return <Car className="h-5 w-5" />;
      case 'bus':
        return <Bus className="h-5 w-5" />;
      case 'courtesy car':
        return <Car className="h-5 w-5" />;
      default:
        return <Truck className="h-5 w-5" />;
    }
  };

  return (
    <PageContainer title="Transportation">
      <div className="mb-6 bg-white p-6 rounded-lg shadow">
        <Tabs 
          defaultValue="all" 
          value={transportationType}
          onValueChange={setTransportationType}
          className="w-full"
        >
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="PRT">PRT</TabsTrigger>
            <TabsTrigger value="Shuttle">Shuttles</TabsTrigger>
            <TabsTrigger value="Bus">Buses</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {Array(3).fill(0).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-1/4" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredTransportation && filteredTransportation.length > 0 ? (
        <div className="space-y-6">
          {filteredTransportation.map((transport) => (
            <TransportationCard 
              key={transport.id} 
              transport={transport} 
              icon={getTransportIcon(transport.type)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-white rounded-lg shadow">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No transportation found</h3>
          <p className="text-muted-foreground mt-2">
            {transportationType !== "all" 
              ? `No ${transportationType} transportation is currently available.` 
              : "No transportation is currently available."}
          </p>
        </div>
      )}
    </PageContainer>
  );
}

function TransportationCard({ 
  transport, 
  icon 
}: { 
  transport: Transportation; 
  icon: React.ReactNode;
}) {
  const statusColor = () => {
    if (!transport.status) return 'bg-gray-500';
    
    switch (transport.status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'delayed':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const estimatedArrival = transport.estimatedArrival 
    ? new Date(transport.estimatedArrival) 
    : null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-full">
              {icon}
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                {transport.name}
                <Badge className={statusColor()}>{transport.status || 'Unknown'}</Badge>
              </CardTitle>
              <CardDescription>{transport.type}</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <LocateFixed className="h-3.5 w-3.5" />
            Live Tracking
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {transport.route && (
          <div className="flex items-start gap-2">
            <Route className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Route</p>
              <p className="text-muted-foreground">{transport.route}</p>
            </div>
          </div>
        )}
        
        {transport.nextStop && (
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Next Stop</p>
              <p className="text-muted-foreground">{transport.nextStop}</p>
            </div>
          </div>
        )}
        
        {estimatedArrival && (
          <div className="flex items-start gap-2">
            <Clock className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Estimated Arrival</p>
              <p className="text-muted-foreground">{format(estimatedArrival, 'p')}</p>
            </div>
          </div>
        )}
        
        {transport.capacity && (
          <div className="flex justify-between items-center">
            <span className="text-sm">Capacity</span>
            <Badge variant="secondary">{transport.capacity} seats</Badge>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button variant="outline">View on Map</Button>
      </CardFooter>
    </Card>
  );
}
