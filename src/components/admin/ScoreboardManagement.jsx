import { useState, useEffect } from 'react';
import { Plus, Trophy, Edit, Trash2, Users, Calendar } from 'lucide-react';
import { apiGet, apiPost, apiDelete, apiPut } from '../../lib/api';

const ScoreboardManagement = () => {
  const [scores, setScores] = useState([]);
  const [teams, setTeams] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    itemId: '', 
    category: '', 
    isGroupEvent: false, 
    positions: [
      { teamId: '', participantName: '', position: 1, points: 0 },
      { teamId: '', participantName: '', position: 2, points: 0 },
      { teamId: '', participantName: '', position: 3, points: 0 },
      { teamId: '', participantName: '', position: 4, points: 0 }
    ], 
    remarks: '' 
  });
  const [participants, setParticipants] = useState([]);
  const [allParticipants, setAllParticipants] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [scoresList, teamsList, itemsList] = await Promise.all([
        apiGet(`/api/scores${categoryFilter && categoryFilter !== 'All' ? `?category=${encodeURIComponent(categoryFilter)}` : ''}`),
        apiGet('/api/teams'),
        apiGet('/api/items')
      ]);
      setScores(scoresList || []);
      setTeams(teamsList || []);
      setItems(itemsList || []);
      
      // Load all participants from all teams
      await loadAllParticipants(teamsList || []);
    } catch (e) {
      console.error('Error fetching data:', e);
    } finally {
      setLoading(false);
    }
  };

  const handlePublishAll = async () => {
    try {
      setPublishing(true);
      await apiPost('/api/scores/publish', { published: true });
      await fetchData();
    } catch (e) {
      console.error('Publish failed', e);
    } finally {
      setPublishing(false);
    }
  };

  const loadAllParticipants = async (teamsList) => {
    try {
      const allParticipantsList = [];
      for (const team of teamsList) {
        try {
          const teamParticipants = await apiGet(`/api/teams/${team._id || team.id}/participants`);
          if (teamParticipants && teamParticipants.length > 0) {
            allParticipantsList.push(...teamParticipants.map(p => ({
              ...p,
              teamId: team._id || team.id,
              teamName: team.name
            })));
          }
        } catch (error) {
          console.error(`Error loading participants for team ${team.name}:`, error);
        }
      }
      setAllParticipants(allParticipantsList);
    } catch (error) {
      console.error('Error loading all participants:', error);
    }
  };

  const handleInputChange = async (e) => {
    const { name, value, type, checked } = e.target;
    const next = { ...formData, [name]: type === 'checkbox' ? checked : value };
    setFormData(next);
  };

  const handlePositionChange = (index, field, value) => {
    const newPositions = [...formData.positions];
    newPositions[index] = { ...newPositions[index], [field]: value };
    
    // If team changes, reset participant name
    if (field === 'teamId') {
      newPositions[index].participantName = '';
    }
    
    setFormData({ ...formData, positions: newPositions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      if (editing) {
        await apiPut(`/api/scores/${editing._id || editing.id}`, formData);
      } else {
        await apiPost('/api/scores', formData);
      }
       setFormData({ 
         itemId: '', 
         category: '', 
         isGroupEvent: false, 
         positions: [
           { teamId: '', participantName: '', position: 1, points: 0 },
           { teamId: '', participantName: '', position: 2, points: 0 },
           { teamId: '', participantName: '', position: 3, points: 0 },
           { teamId: '', participantName: '', position: 4, points: 0 }
         ], 
         remarks: '' 
       });
      setShowModal(false); setEditing(null);
      await fetchData();
    } catch (err) {
      console.error('Error saving score:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateTeamTotals = () => {
    const teamTotals = {};
    scores.forEach((score) => {
      const tid = score.teamId?.toString?.() || score.teamId;
      if (!teamTotals[tid]) {
        const team = teams.find((t) => (t._id || t.id) === tid);
        teamTotals[tid] = { teamName: team?.name || 'Team Not Found', totalPoints: 0, scores: [] };
      }
      teamTotals[tid].totalPoints += parseInt(score.points) || 0;
      teamTotals[tid].scores.push(score);
    });
    return Object.values(teamTotals).sort((a, b) => b.totalPoints - a.totalPoints);
  };

  const getTeamName = (teamId) => {
    const team = teams.find((t) => (t._id || t.id) === teamId);
    return team ? team.name : 'Team Not Found';
  };

  const getItemName = (itemId) => {
    const item = items.find((i) => (i._id || i.id) === itemId);
    return item ? item.name : 'Unknown Item';
  };

  const teamTotals = calculateTeamTotals();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scoreboard Management</h1>
          <p className="text-gray-600">Manage scores and track team standings</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handlePublishAll} disabled={publishing} className="btn-secondary flex items-center space-x-2">
            <Trophy className="h-5 w-5" />
            <span>{publishing ? 'Publishing...' : 'Publish to Live'}</span>
          </button>
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center space-x-2">
          <Plus className="h-5 w-5" />
          <span>Add Score</span>
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Trophy className="h-5 w-5 mr-2" /> Team Standings
        </h2>
        <div className="flex items-center space-x-3 mb-4">
          <label className="text-sm text-gray-700">Filter by category:</label>
          <select className="input-field w-44" value={categoryFilter} onChange={async (e) => { setCategoryFilter(e.target.value); setLoading(true); await fetchData(); setLoading(false); }}>
            <option>All</option>
            <option>Sub-Junior</option>
            <option>Junior</option>
            <option>Senior</option>
          </select>
        </div>
        {teamTotals.length === 0 ? (
          <div className="text-center py-8"><Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">No scores yet</h3><p className="text-gray-600">Add scores to see team standings.</p></div>
        ) : (
          <div className="space-y-3">
            {teamTotals.map((team, index) => (
              <div key={team.teamName} className={`flex items-center justify-between p-4 rounded-lg ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200' : 'bg-gray-50'}`}>
                <div className="flex items-center space-x-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${index === 0 ? 'bg-yellow-500 text-white' : index === 1 ? 'bg-gray-400 text-white' : index === 2 ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'}`}>{index + 1}</div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{team.teamName}</h3>
                    <p className="text-sm text-gray-600">{team.scores.length} entries</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{team.totalPoints}</p>
                  <p className="text-sm text-gray-600">points</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Standings</h2>
        {teams.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teams found</h3>
            <p className="text-gray-600">Add teams to see standings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.filter(team => team.name && team.name !== 'Team Not Found').map((team) => {
              const teamScores = scores.filter(score => 
                score.positions && score.positions.some(pos => pos.teamId === (team._id || team.id))
              );
              const totalPoints = teamScores.reduce((total, score) => {
                const teamPositions = score.positions.filter(pos => pos.teamId === (team._id || team.id));
                return total + teamPositions.reduce((posTotal, pos) => posTotal + (pos.points || 0), 0);
              }, 0);
              const recentEntries = teamScores.slice(0, 3);
              
              return (
                <div key={team._id || team.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                    <span className="text-2xl font-bold text-primary-600">{totalPoints}</span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {teamScores.length} entries
                  </div>
                  {recentEntries.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">Recent Entries</div>
                      {recentEntries.map((score, idx) => {
                        const teamPositions = score.positions.filter(pos => pos.teamId === (team._id || team.id));
                        return (
                          <div key={idx} className="text-xs text-gray-600">
                             {getItemName(score.itemId)} - {teamPositions.map(pos => 
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
          <div className="text-center py-8"><Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" /><h3 className="text-lg font-medium text-gray-900 mb-2">No scores recorded</h3><p className="text-gray-600">Add your first score to get started.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Positions</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {scores.map((score) => (
                  <tr key={score._id || score.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        score.category === 'Sub-Junior' ? 'bg-blue-100 text-blue-800' :
                        score.category === 'Junior' ? 'bg-green-100 text-green-800' :
                        score.category === 'Senior' ? 'bg-purple-100 text-purple-800' :
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="text-primary-600 hover:text-primary-900" onClick={() => { 
                          setEditing(score); 
                          setFormData({ 
                            itemId: score.itemId || '', 
                            category: score.category || '',
                            isGroupEvent: score.isGroupEvent || false,
                            positions: score.positions || [{ teamId: '', participantName: '', position: 1, points: 0 }],
                            remarks: score.remarks || '' 
                          }); 
                          setShowModal(true); 
                        }}><Edit className="h-4 w-4" /></button>
                        <button className="text-red-600 hover:text-red-900" onClick={async () => { try { await apiDelete(`/api/scores/${score._id || score.id}`); await fetchData(); } catch (_) {} }}><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editing ? 'Edit Score' : 'Add Score'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select name="category" required={!formData.isGroupEvent} disabled={formData.isGroupEvent} className="input-field" value={formData.category} onChange={handleInputChange}>
                    <option value="">Select category</option>
                    <option>Sub-Junior</option>
                    <option>Junior</option>
                    <option>Senior</option>
                  </select>
                  <div className="mt-2 flex items-center space-x-2">
                    <input id="isGroup" type="checkbox" name="isGroupEvent" checked={formData.isGroupEvent} onChange={handleInputChange} />
                    <label htmlFor="isGroup" className="text-sm text-gray-700">Group event (no category)</label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Competition *</label>
                  <select name="itemId" required className="input-field" value={formData.itemId} onChange={handleInputChange}>
                    <option value="">Select competition</option>
                    {items.map((item) => (
                      <option key={item._id || item.id} value={item._id || item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
                {!formData.isGroupEvent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Positions *</label>
                    <div className="space-y-3">
                      {formData.positions.map((position, index) => {
                        // Filter participants by selected team and category
                        const filteredParticipants = allParticipants.filter(p => 
                          p.teamId === position.teamId && 
                          p.category === formData.category
                        );
                        
                         return (
                           <div key={index} className="grid grid-cols-5 gap-3 p-3 border border-gray-200 rounded-lg">
                             <div>
                               <label className="block text-xs font-medium text-gray-600 mb-1">Position</label>
                               <select 
                                 value={position.position} 
                                 onChange={(e) => handlePositionChange(index, 'position', parseInt(e.target.value))}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                               >
                                 <option value={1}>1st Place</option>
                                 <option value={2}>2nd Place</option>
                                 <option value={3}>3rd Place</option>
                                 <option value={4}>4th Place</option>
                               </select>
                             </div>
                             <div>
                               <label className="block text-xs font-medium text-gray-600 mb-1">Team</label>
                               <select 
                                 value={position.teamId} 
                                 onChange={(e) => handlePositionChange(index, 'teamId', e.target.value)}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                               >
                                 <option value="">Select team</option>
                                 {teams.map((team) => (
                                   <option key={team._id || team.id} value={team._id || team.id}>{team.name}</option>
                                 ))}
                               </select>
                             </div>
                             <div>
                               <label className="block text-xs font-medium text-gray-600 mb-1">Participant</label>
                               <select 
                                 value={position.participantName} 
                                 onChange={(e) => handlePositionChange(index, 'participantName', e.target.value)}
                                 disabled={!position.teamId}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm disabled:bg-gray-100"
                               >
                                 <option value="">Select participant</option>
                                 {filteredParticipants.map((p, idx) => (
                                   <option key={idx} value={p.name}>{p.name} {p.chestNumber ? `- ${p.chestNumber}` : ''}</option>
                                 ))}
                               </select>
                             </div>
                             <div>
                               <label className="block text-xs font-medium text-gray-600 mb-1">Points</label>
                               <input 
                                 type="number" 
                                 min="0" 
                                 value={position.points} 
                                 onChange={(e) => handlePositionChange(index, 'points', parseInt(e.target.value) || 0)}
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                 placeholder="0"
                               />
                             </div>
                             <div className="flex items-end">
                               <button
                                 type="button"
                                 onClick={() => {
                                   const newPositions = formData.positions.filter((_, i) => i !== index);
                                   setFormData({ ...formData, positions: newPositions });
                                 }}
                                 className="w-full px-3 py-2 text-red-600 hover:text-red-800 text-sm flex items-center justify-center"
                                 title="Remove position"
                               >
                                 <Trash2 className="h-4 w-4" />
                               </button>
                             </div>
                           </div>
                         );
                      })}
                      <button
                        type="button"
                        onClick={() => {
                          const newPositions = [...formData.positions, { 
                            teamId: '',
                            participantName: '', 
                            position: formData.positions.length + 1, 
                            points: 0 
                          }];
                          setFormData({ ...formData, positions: newPositions });
                        }}
                        className="w-full px-3 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 text-sm"
                      >
                        + Add Position
                      </button>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
                  <textarea name="remarks" rows={3} className="input-field" value={formData.remarks} onChange={handleInputChange} placeholder="Enter any remarks (optional)" />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-secondary" disabled={submitting}>Cancel</button>
                  <button type="submit" className="flex-1 btn-primary" disabled={submitting}>{submitting ? (editing ? 'Updating...' : 'Adding...') : (editing ? 'Update Score' : 'Add Score')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScoreboardManagement;
