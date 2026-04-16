import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Opportunity } from '../../types';
import { mockOpportunities, mockUsers } from '../../services/mockData';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const OpportunitiesPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);        
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch delay
    const fetchOpps = async () => {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      setOpportunities(mockOpportunities);
      setIsLoading(false);
    };
    fetchOpps();
  }, []);

  const handleApply = (id: string) => {
    alert(`Applied to opportunity ${id}! We will mock this logic properly later.`);
  };

  const getClubName = (clubId: string) => {
    const club = mockUsers.find((u) => u.uid === clubId);
    return club ? club.displayName : 'Unknown Club';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Marketplace</h1>
          <p className="mt-2 text-gray-400">Discover the latest opportunities across the globe.</p>
        </div>
        {user?.role === 'club' && (
          <div className="mt-4 md:mt-0">
            <Button variant="primary">Create Opportunity</Button>
          </div>
        )}
      </div>

      {/* Filters (Mock) */}
      <div className="bg-gray-900 border border-gray-800 p-4 rounded-xl flex gap-4 overflow-x-auto">
        <Badge variant="primary" className="cursor-pointer px-4 py-2 text-sm">All Categories</Badge>
        <Badge variant="default" className="cursor-pointer hover:bg-gray-800 px-4 py-2 text-sm">Football</Badge>
        <Badge variant="default" className="cursor-pointer hover:bg-gray-800 px-4 py-2 text-sm">Basketball</Badge>
        <Badge variant="default" className="cursor-pointer hover:bg-gray-800 px-4 py-2 text-sm">Pro Contracts</Badge>
      </div>

      {/* Opportunity List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-64 rounded-xl bg-gray-900 border border-gray-800 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <Card key={opp.id} className="flex flex-col hover:border-gray-700 transition-colors">
              <CardHeader className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-white">{opp.title}</h3>
                  <p className="text-sm text-blue-400 font-medium mt-1">{getClubName(opp.clubId)}</p>
                </div>
                <Badge variant={opp.status === 'open' ? 'success' : 'default'} className="uppercase text-[10px]">
                  {opp.status}
                </Badge>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex gap-2 mb-4 text-xs font-medium text-gray-400">
                   <div className="flex items-center gap-1">
                     <span className="w-2 h-2 rounded-full bg-blue-500/50"></span>
                     {opp.sport}
                   </div>
                   <span>•</span>
                   <div className="flex items-center gap-1">
                     {opp.location}
                   </div>
                   <span>•</span>
                   <div className="capitalize">
                     {opp.contractType.replace('-', ' ')}
                   </div>
                </div>

                <p className="text-gray-300 text-sm line-clamp-3 mb-6">
                  {opp.description}
                </p>

                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Key Requirements</h4>
                  <ul className="flex flex-wrap gap-2">
                    {opp.requirements.slice(0, 3).map((req, idx) => (
                      <Badge key={idx} variant="default" className="text-[11px] bg-gray-800/50 border-gray-700/50">{req}</Badge>
                    ))}
                    {opp.requirements.length > 3 && (
                      <span className="text-xs text-gray-500 items-center flex">+{opp.requirements.length - 3} more</span>
                    )}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <div className="text-xs text-gray-500 font-medium">
                  Posted: {formatDate(opp.createdAt)}
                </div>
                <div className="flex gap-3">
                   <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/opportunities/${opp.id}`)}>
                     View Details
                   </Button>    
                   {user?.role !== 'club' && (
                     <Button variant="primary" size="sm" onClick={() => handleApply(opp.id)}>Quick Apply</Button>
                   )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunitiesPage;
