import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiGet } from '../../lib/api';
import { Trophy, Medal, Star, ArrowLeft, User, Users, Tag, Hash } from 'lucide-react';

const ParticipantDetail = () => {
  const { teamId, participantName } = useParams();
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [teams, setTeams] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [participant, setParticipant] = useState(null);
  const [participantScores, setParticipantScores] = useState([]);

  useEffect(() => {
    fetchData();
  }, [teamId, participantName]);

  const fetchData = async () => {
    try {
      const [scoresList, teamsList, itemsList] = await Promise.all([
        apiGet('/api/scores?published=true'),
        apiGet('/api/teams'),
        apiGet('/api/items')
      ]);
      
      setScores(scoresList || []);
      setTeams(teamsList || []);
      setItems(itemsList || []);

      // Find the participant's team
      const team = teamsList.find(t => (t._id || t.id) === teamId);
      if (team) {
        const foundParticipant = team.participants?.find(p => p.name === decodeURIComponent(participantName));
        if (foundParticipant) {
          setParticipant({
            ...foundParticipant,
            teamName: team.name,
            teamId: teamId
          });
        }
      }

      // Calculate participant's scores (only solo items for individual achievements)
      const participantScoresList = [];
      scoresList.forEach((score) => {
        // Find the item to check its type
        const item = itemsList.find(i => (i._id || i.id) === score.itemId);
        if (!item || item.type !== 'solo') return; // only include solo items for individual achievements
        
        if (score.positions && score.positions.length > 0) {
          score.positions.forEach((pos) => {
            if (pos.teamId === teamId && pos.participantName === decodeURIComponent(participantName)) {
              participantScoresList.push({
                ...score,
                position: pos.position,
                points: pos.points
              });
            }
          });
        }
      });

      // Sort by date (newest first) and calculate total points
      const sortedScores = participantScoresList.sort((a, b) => new Date(b.createdAt || b.updatedAt) - new Date(a.createdAt || a.updatedAt));
      setParticipantScores(sortedScores);

    } catch (e) {
      console.error('Participant detail fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  const getItemName = (itemId) => {
    const item = items.find((i) => (i._id || i.id) === itemId);
    return item ? item.name : 'Unknown Item';
  };

  const getRankIcon = (position) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-orange-500" />;
      default: return <Star className="h-5 w-5 text-blue-500" />;
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'Super-Senior': return 'bg-red-100 text-red-800';
      case 'Senior': return 'bg-purple-100 text-purple-800';
      case 'Junior': return 'bg-green-100 text-green-800';
      case 'Sub-Junior': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalPoints = participantScores.reduce((sum, score) => sum + (parseInt(score.points) || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Participant Not Found</h3>
          <p className="text-gray-600 mb-4">The participant you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/scoreboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Scoreboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/scoreboard')}
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scoreboard
        </button>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-100 rounded-full p-3">
                <User className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{participant.name}</h1>
                <p className="text-gray-600">{participant.teamName}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-primary-600">{totalPoints}</p>
              <p className="text-sm text-gray-600">Total Points</p>
            </div>
          </div>

          {/* Participant Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Team</p>
                <p className="font-medium text-gray-900">{participant.teamName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Category</p>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(participant.category)}`}>
                  {participant.category}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Hash className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Chest Number</p>
                <p className="font-medium text-gray-900">{participant.chestNumber || 'Not assigned'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">All Achievements</h2>
          <p className="text-sm text-gray-600">{participantScores.length} competitions participated</p>
        </div>
        
        {participantScores.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No achievements yet</h3>
            <p className="text-gray-600">This participant hasn't participated in any competitions yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {participantScores.map((score, index) => {
              const item = items.find(i => (i._id || i.id) === score.itemId);
              return (
                <div key={index} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getRankIcon(score.position)}
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          {item?.name || 'Unknown Competition'}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(score.category)}`}>
                            {score.category || 'Group'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(score.createdAt || score.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {score.position === 1 ? '1st' : score.position === 2 ? '2nd' : score.position === 3 ? '3rd' : score.position === 4 ? '4th' : `${score.position}th`}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{score.points} points</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantDetail;
