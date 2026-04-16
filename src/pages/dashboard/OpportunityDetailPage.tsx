import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Opportunity, Profile } from '../../types';
import { mockOpportunities, mockUsers, mockProfiles } from '../../services/mockData';
import { Card, CardHeader, CardContent, CardFooter } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { 
  ArrowLeftIcon, 
  MapPinIcon, 
  BriefcaseIcon, 
  CalendarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const OpportunityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [clubProfile, setClubProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching the specific opportunity
    const fetchData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const foundOpp = mockOpportunities.find(o => o.id === id);
      if (foundOpp) {
        setOpportunity(foundOpp);
        const profile = mockProfiles.find(p => p.userId === foundOpp.clubId);
        if (profile) setClubProfile(profile);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  const handleApply = () => {
    // This will later be connected to a Modal or a direct service call
    alert("Application process started! (Mock)");
  };

  const handleMessage = () => {
    // Premium check logic would go here
    if (user?.plan === 'free') {
      alert("Upgrade to Premium to message the club directly!");
    } else {
      alert("Redirecting to messages...");
      // navigate('/dashboard/messages/conv-id')
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
        <div className="h-8 w-32 bg-gray-800 rounded mb-8"></div>
        <div className="h-64 bg-gray-900 rounded-xl mb-6"></div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Opportunity not found</h2>
        <Button onClick={() => navigate('/dashboard/opportunities')}>Back to Marketplace</Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-white space-y-6">
      {/* Top Nav */}
      <div>
        <button 
          onClick={() => navigate('/dashboard/opportunities')}
          className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Marketplace
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white mb-2">{opportunity.title}</h1>
                <p className="text-blue-400 font-medium text-lg">{clubProfile?.name || 'Unknown Club'}</p>
              </div>
              <Badge variant={opportunity.status === 'open' ? 'success' : 'default'} className="w-fit">
                {opportunity.status.toUpperCase()}
              </Badge>
            </div>

            {/* Quick Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-y border-gray-800 mb-8">
              <div>
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center">
                  <MapPinIcon className="w-3.5 h-3.5 mr-1" /> Location
                </div>
                <div className="font-medium text-white">{opportunity.location}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center">
                  <BriefcaseIcon className="w-3.5 h-3.5 mr-1" /> Contract
                </div>
                <div className="font-medium text-white capitalize">{opportunity.contractType.replace('-', ' ')}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center">
                  <UserGroupIcon className="w-3.5 h-3.5 mr-1" /> Gender
                </div>
                <div className="font-medium text-white capitalize">{opportunity.gender}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1 flex items-center">
                  <CalendarIcon className="w-3.5 h-3.5 mr-1" /> Posted
                </div>
                <div className="font-medium text-white">{formatDate(opportunity.createdAt)}</div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-10">
              <h2 className="text-xl font-semibold mb-4 text-white">About the Opportunity</h2>
              <div className="text-gray-300 leading-relaxed space-y-4 whitespace-pre-wrap">
                {opportunity.description}
              </div>
            </div>

            {/* Requirements */}
            <div>
              <h2 className="text-xl font-semibold mb-4 text-white">Requirements & Profile Needed</h2>
              <ul className="space-y-3">
                {opportunity.requirements.map((req, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="text-blue-500 mr-3 mt-1">•</span>
                    <span className="text-gray-300">{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Action Card */}
          <Card className="border-blue-900/30 shadow-lg shadow-blue-900/10">
            <CardContent className="p-6">
              {user?.role === 'club' ? (
                <div className="text-center text-gray-400 p-4">
                  Clubs cannot apply to opportunities.
                </div>
              ) : (
                <div className="space-y-4">
                  <Button variant="primary" size="lg" fullWidth onClick={handleApply}>
                    Apply Now
                  </Button>
                  <Button variant="secondary" size="lg" fullWidth onClick={handleMessage}>
                    Message Club
                  </Button>
                  
                  {user?.plan === 'free' && (
                    <div className="mt-4 text-xs text-center text-gray-400 bg-gray-900/50 p-3 rounded-lg border border-gray-800">
                      <span className="text-yellow-500 font-bold mb-1 block">Premium Feature</span>
                      Messaging clubs directly requires a Premium subscription.
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Club Info Card */}
          <Card>
            <CardHeader>
              <h3 className="font-semibold text-white">About the Club</h3>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-xl font-bold text-gray-400 overflow-hidden">
                  {clubProfile?.name.charAt(0) || 'C'}
                </div>
                <div>
                  <div className="font-bold text-white text-base">{clubProfile?.name || 'Unknown Club'}</div>
                  <div className="text-blue-400">{mockUsers.find(u => u.uid === opportunity.clubId)?.email}</div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800">
                <p className="text-gray-400 mb-4">{clubProfile?.description}</p>
                <div className="grid grid-cols-2 gap-2 text-gray-300">
                  <div>
                    <span className="block text-gray-500 text-xs">Country</span>
                    {clubProfile?.country || 'Unknown'}
                  </div>
                  <div>
                    <span className="block text-gray-500 text-xs">Founded</span>
                    {clubProfile?.stats?.founded || 'N/A'}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" fullWidth>
                View Full Profile
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetailPage;
