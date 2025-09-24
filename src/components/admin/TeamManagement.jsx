import { useState, useEffect } from 'react';
import { Plus, Users, Upload, Download, Edit, Trash2 } from 'lucide-react';
import { apiGet, apiPost, apiDelete, apiPut, apiPostForm } from '../../lib/api';

const TeamManagement = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    captainName: '',
    captainEmail: '',
    captainPhone: '',
    description: ''
  });
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [excelFile, setExcelFile] = useState(null);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const data = await apiGet('/api/teams');
      console.log('Fetched teams:', data);
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setExcelFile(e.target.files[0]);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      // Create team first
      const team = await apiPost('/api/teams', formData);
      console.log('Team created:', team);
      
      // Upload Excel file if provided
      if (excelFile && team) {
        try {
          console.log('Uploading Excel for new team:', team._id || team.id);
          const fd = new FormData();
          fd.append('file', excelFile);
          const result = await apiPostForm(`/api/teams/${team._id || team.id}/members-upload`, fd);
          console.log('Upload result:', result);
        } catch (error) {
          console.error('Excel upload error:', error);
        }
      }
      
      setFormData({ name: '', captainName: '', captainEmail: '', captainPhone: '', description: '' });
      setExcelFile(null);
      setShowModal(false);
      await fetchTeams();
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage teams and their member details</p>
        </div>
        <button
          onClick={() => { setEditing(null); setFormData({ name: '', captainName: '', captainEmail: '', captainPhone: '', description: '' }); setExcelFile(null); setShowModal(true); }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Add Team</span>
        </button>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team) => (
          <div key={team._id || team.id} className="card">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Users className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{team.name}</h3>
                  <p className="text-sm text-gray-600">Captain: {team.captainName}</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600" onClick={() => { setEditing(team); setShowModal(true); setFormData({ name: team.name || '', captainName: team.captainName || '', captainEmail: team.captainEmail || '', captainPhone: team.captainPhone || '', description: team.description || '' }); setExcelFile(null); }}>
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600" onClick={async () => { try { await apiDelete(`/api/teams/${team._id || team.id}`); await fetchTeams(); } catch (_) {} }}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><span className="font-medium">Email:</span> {team.captainEmail}</p>
              <p><span className="font-medium">Phone:</span> {team.captainPhone}</p>
              {team.description && (
                <p><span className="font-medium">Description:</span> {team.description}</p>
              )}
            </div>
            
            {/* Participants Section */}
            {(() => {
              console.log('Team participants for', team.name, ':', team.participants);
              return team.participants && team.participants.length > 0 ? (
                <div className="mt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Participants ({team.participants.length})</h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {team.participants.map((participant, index) => (
                      <div key={index} className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded">
                        <span className="font-medium">{participant.name}</span>
                        <div className="flex space-x-2">
                          <span className={`px-2 py-1 rounded text-xs ${
                            participant.category === 'Sub-Junior' ? 'bg-blue-100 text-blue-800' :
                            participant.category === 'Junior' ? 'bg-green-100 text-green-800' :
                            participant.category === 'Senior' ? 'bg-purple-100 text-purple-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {participant.category}
                          </span>
                          {participant.chestNumber && (
                            <span className="text-gray-500">#{participant.chestNumber}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4 text-sm text-gray-500">
                  No participants uploaded yet
                </div>
              );
            })()}
            
            <div className="mt-4 space-y-2">
              <div className="flex space-x-2">
                <input 
                  type="file" 
                  accept=".xlsx,.xls" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                      console.log('Uploading Excel for team:', team._id || team.id);
                      const fd = new FormData();
                      fd.append('file', file);
                      const result = await apiPostForm(`/api/teams/${team._id || team.id}/members-upload`, fd);
                      console.log('Upload result:', result);
                      await fetchTeams();
                    } catch (error) {
                      console.error('Upload error:', error);
                    }
                  }}
                  className="hidden"
                  id={`excel-upload-${team._id || team.id}`}
                />
                <label 
                  htmlFor={`excel-upload-${team._id || team.id}`}
                  className="flex-1 btn-secondary flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Members</span>
                </label>
                <a className="flex-1 btn-secondary flex items-center justify-center space-x-2" href={team.membersFileUrl || '#'} target="_blank" rel="noreferrer">
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Team Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{editing ? 'Edit Team' : 'Add New Team'}</h2>
              
              <form onSubmit={async (e) => {
                if (!editing) return handleSubmit(e);
                e.preventDefault(); setUploading(true);
                try {
                  // Update team first
                  const team = await apiPut(`/api/teams/${editing._id || editing.id}`, formData);
                  
                  // Upload Excel file if provided
                  if (excelFile && team) {
                    try {
                      console.log('Uploading Excel for team:', team._id || team.id);
                      const fd = new FormData();
                      fd.append('file', excelFile);
                      const result = await apiPostForm(`/api/teams/${team._id || team.id}/members-upload`, fd);
                      console.log('Upload result:', result);
                    } catch (error) {
                      console.error('Excel upload error:', error);
                    }
                  }
                  
                  setFormData({ name: '', captainName: '', captainEmail: '', captainPhone: '', description: '' });
                  setExcelFile(null);
                  setShowModal(false); setEditing(null);
                  await fetchTeams();
                } catch (error) {
                  console.error('Error updating team:', error);
                } finally { setUploading(false); }
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="input-field"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter team name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Captain Name *
                  </label>
                  <input
                    type="text"
                    name="captainName"
                    required
                    className="input-field"
                    value={formData.captainName}
                    onChange={handleInputChange}
                    placeholder="Enter captain name"
                  />
                </div>

                {/* Removed email and phone as requested */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="input-field"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter team description (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team Members Excel File (Optional)
                  </label>
                  <input 
                    type="file" 
                    accept=".xlsx,.xls" 
                    onChange={handleFileChange} 
                    className="input-field" 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload Excel file with columns: Name, Category, Chest Number
                  </p>
                </div>


                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 btn-secondary"
                    disabled={uploading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                    disabled={uploading}
                  >
                    {uploading ? (editing ? 'Saving...' : 'Creating...') : (editing ? 'Save Changes' : 'Create Team')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamManagement;
