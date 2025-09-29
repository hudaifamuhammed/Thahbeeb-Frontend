import { useState, useEffect } from 'react';
import { apiGet } from '../../lib/api';
import { Trophy, Medal, Star, Users, Calendar } from 'lucide-react';

const Scoreboard = () => {
  const [scores, setScores] = useState([]);
  const [teams, setTeams] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('teams');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const categories = ['All', ...Array.from(new Set(items.map(i => i.category).filter(Boolean))).sort((a, b) => a.localeCompare(b)), 'Group'];

  useEffect(() => { fetchData(); }, [categoryFilter]);

  const fetchData = async () => {
    try {
      const [scoresList, teamsList, itemsList] = await Promise.all([
        apiGet(`/api/scores${categoryFilter !== 'All' ? `?category=${encodeURIComponent(categoryFilter)}` : ''}${categoryFilter !== 'All' ? '&' : '?'}published=true`),
        apiGet('/api/teams'),
        apiGet('/api/items')
      ]);
      setScores(scoresList || []);
      setTeams(teamsList || []);
      setItems(itemsList || []);
    } catch (e) {
      console.error('Scoreboard fetch error', e);
    } finally { setLoading(false); }
  };

  const calculateTeamTotals = () => {
    const totals = {};
    scores.forEach((s) => {
      // Calculate from positions instead of main teamId
      if (s.positions && s.positions.length > 0) {
        s.positions.forEach(position => {
          if (position.teamId) {
            const tid = position.teamId.toString();
            const team = teams.find((t) => (t._id || t.id) === tid);
            // Only include if team is found
            if (team) {
              if (!totals[tid]) totals[tid] = { teamId: tid, teamName: team.name, totalPoints: 0, scores: [] };
              totals[tid].totalPoints += parseInt(position.points) || 0;
              totals[tid].scores.push({ ...s, position: position.position, points: position.points, participantName: position.participantName });
            }
          }
        });
      }
    });
    return Object.values(totals).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const calculateIndividualTotals = () => {
    const totals = {};
    scores.forEach((s) => {
      if (s.category === 'General') return; // skip general for individual totals
      // Handle new positions structure
      if (s.positions && s.positions.length > 0) {
        s.positions.forEach((pos) => {
          if (pos.teamId && pos.participantName) {
            const team = teams.find((t) => (t._id || t.id) === pos.teamId);
            // Only include if team is found
            if (team) {
              const key = `${pos.teamId}-${pos.participantName}`;
              if (!totals[key]) totals[key] = { 
                teamId: pos.teamId, 
                teamName: team.name, 
                participantName: pos.participantName, 
                totalPoints: 0, 
                scores: [] 
              };
              totals[key].totalPoints += parseInt(pos.points) || 0;
              totals[key].scores.push({ ...s, position: pos.position, points: pos.points });
            }
          }
        });
      }
    });
    return Object.values(totals).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const teamTotals = calculateTeamTotals();
  const individualTotals = calculateIndividualTotals();

  const getRankIcon = (index) => { switch (index) { case 0: return <Trophy className="h-6 w-6 text-yellow-500" />; case 1: return <Medal className="h-6 w-6 text-gray-400" />; case 2: return <Medal className="h-6 w-6 text-orange-500" />; default: return <Star className="h-6 w-6 text-blue-500" />; } };
  const getRankColor = (index) => { switch (index) { case 0: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200'; case 1: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200'; case 2: return 'bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200'; default: return 'bg-white border-gray-200'; } };

  const getItemName = (itemId) => {
    const item = items.find((i) => (i._id || i.id) === itemId);
    return item ? item.name : 'Unknown Item';
  };

  if (loading) return (<div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Live Scoreboard</h1>
        <p className="text-gray-600">Real-time updates on team and individual standings</p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
        <div className="bg-gray-100 rounded-lg p-1">
          <button onClick={() => setView('teams')} className={`px-6 py-2 rounded-md font-medium transition-colors ${view === 'teams' ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            <Users className="h-4 w-4 inline mr-2" />Team Standings
          </button>
          <button onClick={() => setView('individual')} className={`px-6 py-2 rounded-md font-medium transition-colors ${view === 'individual' ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>
            <Trophy className="h-4 w-4 inline mr-2" />Individual Rankings
          </button>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter by category:</label>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {categories.map(c => (
              <option key={c} value={c}>{c === 'All' ? 'All Categories' : (c === 'Group' ? 'Group Events' : c)}</option>
            ))}
          </select>
        </div>
      </div>

      {view === 'teams' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Standings</h2>
            {teamTotals.length === 0 ? (
              <div className="text-center py-8">
                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team scores yet</h3>
                <p className="text-gray-600">Scores will appear here once competitions begin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamTotals.map((team, index) => {
                  const teamScores = scores.filter(score => 
                    score.positions && score.positions.some(pos => pos.teamId === team.teamId)
                  );
                  const recentEntries = teamScores.slice(0, 3);
                  
                  return (
                    <div key={team.teamId} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">{team.teamName}</h3>
                        <span className="text-2xl font-bold text-primary-600">{team.totalPoints}</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {team.scores.length} entries
                      </div>
                      {recentEntries.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent Entries</div>
                          {recentEntries.map((score, idx) => {
                            const teamPositions = score.positions.filter(pos => pos.teamId === team.teamId);
                            const item = items.find(i => (i._id || i.id) === score.itemId);
                            return (
                              <div key={idx} className="text-xs text-gray-600">
                                {item?.name || 'Unknown Competition'} - {teamPositions.map(pos => 
                                  `${pos.position === 1 ? '1st' : pos.position === 2 ? '2nd' : pos.position === 3 ? '3rd' : pos.position === 4 ? '4th' : `${pos.position}th`} (${pos.points}pts)`
                                ).join(', ')}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Scores</h2>
            {scores.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No scores recorded</h3>
                <p className="text-gray-600">Add your first score to get started.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competition</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Positions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {scores.map((score) => (
                      <tr key={score._id || score.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            score.category === 'Super-Senior' ? 'bg-red-100 text-red-800' :
                            score.category === 'Senior' ? 'bg-purple-100 text-purple-800' :
                            score.category === 'Junior' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {score.category || 'Group'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getItemName(score.itemId)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {score.positions && score.positions.length > 0 ? (
                              score.positions.map((pos, idx) => {
                                const team = teams.find(t => (t._id || t.id) === pos.teamId);
                                return (
                                  <div key={idx} className="flex items-center space-x-2">
                                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                                      {pos.position === 1 ? '1st' : pos.position === 2 ? '2nd' : pos.position === 3 ? '3rd' : pos.position === 4 ? '4th' : `${pos.position}th`}
                                    </span>
                                    <span className="text-sm text-gray-900">{pos.participantName}</span>
                                    <span className="text-xs text-gray-500">({team?.name || 'Team Not Found'})</span>
                                    <span className="text-xs text-gray-500">({pos.points} pts)</span>
                                  </div>
                                );
                              })
                            ) : (
                              <span className="text-sm text-gray-500">No positions</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {view === 'individual' && (
        <div className="space-y-4">
          {individualTotals.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No individual scores yet</h3>
              <p className="text-gray-600">Individual rankings will appear here once competitions begin.</p>
            </div>
          ) : (
            individualTotals.map((participant, index) => (
              <div key={`${participant.teamId}-${participant.participantName}`} className={`card border-2 ${getRankColor(index)}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {getRankIcon(index)}
                      <span className="text-2xl font-bold text-gray-900">#{index + 1}</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{participant.participantName}</h3>
                      <p className="text-gray-600">{participant.teamName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-gray-900">{participant.totalPoints}</p>
                    <p className="text-sm text-gray-600">points</p>
                  </div>
                </div>
                
                {/* Show recent achievements */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Achievements</h4>
                  <div className="space-y-1">
                    {participant.scores.slice(0, 3).map((score, scoreIndex) => {
                      const item = items.find(i => (i._id || i.id) === score.itemId);
                      return (
                        <div key={scoreIndex} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              score.category === 'Sub-Junior' ? 'bg-blue-100 text-blue-800' :
                              score.category === 'Junior' ? 'bg-green-100 text-green-800' :
                              score.category === 'Senior' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {score.category || 'Group'}
                            </span>
                            <span className="text-gray-900">{item?.name || 'Unknown Competition'}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {score.position === 1 ? '1st' : score.position === 2 ? '2nd' : score.position === 3 ? '3rd' : score.position === 4 ? '4th' : `${score.position}th`}
                            </span>
                            <span className="text-gray-600">{score.points} points</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default Scoreboard;
