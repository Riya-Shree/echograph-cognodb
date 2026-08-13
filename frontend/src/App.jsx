import React, { useState, useEffect } from 'react';
import { Music, Users, PlayCircle, Disc3 } from 'lucide-react';

export default function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('u1');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch users on load
  useEffect(() => {
    fetch('/api/users')
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Failed to load users", err));
  }, []);

  // Fetch recommendations when selected user changes
  useEffect(() => {
    if (!selectedUser) return;
    
    setLoading(true);
    fetch(`/api/users/${selectedUser}/recommendations`)
      .then(res => res.json())
      .then(data => {
        setRecommendations(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load recommendations", err);
        setLoading(false);
      });
  }, [selectedUser]);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <header className="flex items-center gap-3 mb-10 border-b border-gray-800 pb-6">
          <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Music className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">EchoGraph</h1>
            <p className="text-gray-400 text-sm mt-1">Network-Driven Music Discovery</p>
          </div>
        </header>

        {/* User Selection */}
        <div className="bg-gray-900 rounded-2xl p-6 mb-8 border border-gray-800 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold">Select a User Profile</h2>
          </div>
          <select 
            value={selectedUser} 
            onChange={(e) => setSelectedUser(e.target.value)}
            className="w-full md:w-1/2 bg-gray-800 border border-gray-700 text-white text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-3 outline-none transition-all"
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>

        {/* Recommendations Section */}
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Disc3 className="w-6 h-6 text-indigo-500" />
            Recommended Tracks
          </h2>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4"></div>
              <p>Traversing the graph...</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && recommendations.length === 0 && (
            <div className="bg-gray-900/50 rounded-2xl p-12 text-center border border-gray-800 border-dashed">
              <Music className="w-12 h-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300">No new recommendations</h3>
              <p className="text-gray-500 mt-2">You've caught up with all the tracks your network is listening to.</p>
            </div>
          )}

          {/* Populated Data State */}
          {!loading && recommendations.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {recommendations.map((rec) => (
                <div key={rec.trackId} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-indigo-500/50 transition-colors group cursor-pointer shadow-lg hover:shadow-indigo-500/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">{rec.track}</h3>
                      <p className="text-gray-400 text-sm mt-1">{rec.artist}</p>
                    </div>
                    <PlayCircle className="w-8 h-8 text-gray-600 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <div className="mt-6 pt-4 border-t border-gray-800/50 flex items-center justify-between">
                    <span className="text-xs font-medium text-indigo-400 bg-indigo-400/10 px-2.5 py-1 rounded-full">
                      Network Match
                    </span>
                    <span className="text-xs text-gray-500">
                      Recommended by {rec.recommendedBy} {rec.recommendedBy === 1 ? 'friend' : 'friends'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}