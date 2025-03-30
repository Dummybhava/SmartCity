import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PageContainer from "@/components/layout/page-container";
import { Attraction } from "@shared/schema";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, Phone, Clock, Building, Coffee, Museum, Store, Info, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function AttractionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  const { data: attractions, isLoading } = useQuery<Attraction[]>({
    queryKey: ["/api/attractions"],
  });

  // Filter attractions based on search query and selected category
  const filteredAttractions = attractions?.filter((attraction) => {
    // Search filter
    const matchesSearch = searchQuery === "" || 
      attraction.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attraction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      attraction.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Category filter
    const matchesCategory = selectedCategory === null || 
      attraction.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Extract unique categories from attractions
  const categories = [...new Set(attractions?.map(attraction => attraction.category) || [])];

  return (
    <PageContainer title="Attractions">
      <div className="mb-6 bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search attractions..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex-shrink-0">
            <Tabs defaultValue="all" onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                {categories.map((category) => (
                  <TabsTrigger key={category} value={category}>
                    {category}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredAttractions && filteredAttractions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAttractions.map((attraction) => (
            <AttractionCard key={attraction.id} attraction={attraction} />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-white rounded-lg shadow">
          <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium">No attractions found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery ? 
              `No attractions match "${searchQuery}"${selectedCategory ? ` in category "${selectedCategory}"` : ''}` : 
              "No attractions available at this time."}
          </p>
        </div>
      )}
    </PageContainer>
  );
}

function AttractionCard({ attraction }: { attraction: Attraction }) {
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food & beverage':
        return <Coffee className="h-4 w-4" />;
      case 'museum':
        return <Museum className="h-4 w-4" />;
      case 'retailer':
        return <Store className="h-4 w-4" />;
      case 'education':
        return <Building className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {attraction.imageUrl && (
        <div className="h-48 w-full overflow-hidden">
          <img 
            src={attraction.imageUrl} 
            alt={attraction.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
        </div>
      )}
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{attraction.name}</CardTitle>
          <Badge className="ml-2 flex items-center gap-1">
            {getCategoryIcon(attraction.category)}
            <span>{attraction.category}</span>
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          {attraction.location}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {attraction.description}
        </p>
        
        {(attraction.openingHours || attraction.contactInfo) && (
          <div className="mt-4 space-y-2 text-sm">
            {attraction.openingHours && (
              <div className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span>{attraction.openingHours}</span>
              </div>
            )}
            
            {attraction.contactInfo && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                <span>{attraction.contactInfo}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button variant="outline" className="w-full">View Details</Button>
      </CardFooter>
    </Card>
  );
}
