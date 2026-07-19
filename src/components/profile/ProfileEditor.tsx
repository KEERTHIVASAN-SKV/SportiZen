import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { X, Save, Plus, Trophy, Award, Trash2, Image, Loader2 } from 'lucide-react';
import { User, SPORTS_CATEGORIES, Achievement } from '../../types';
import { achievementService, storageService } from '../../services/supabaseService';
import toast from 'react-hot-toast';

interface ProfileEditorProps {
  user: User;
  onClose: () => void;
}

const ProfileEditor: React.FC<ProfileEditorProps> = ({ user, onClose }) => {
  const { updateUser } = useAuth();
  
  // Set up initial state combining flat user fields and nested role profiles
  const [formData, setFormData] = useState({
    name: user.name,
    bio: user.bio || '',
    sport: user.sport,
    location: user.location || '',
    experience: user.experience || '',
    // Player profile specific
    age: user.playerProfile?.age?.toString() || '',
    gender: user.playerProfile?.gender || 'Male',
    position: user.playerProfile?.position || '',
    // Contact Info
    contactInfo: {
      phone: user.contactInfo?.phone || '',
      website: user.contactInfo?.website || '',
      instagram: user.contactInfo?.instagram || '',
      twitter: user.contactInfo?.twitter || '',
    }
  });

  // Coach certifications list
  const [coachCertifications, setCoachCertifications] = useState<string[]>(
    user.coachProfile?.certifications || []
  );
  const [newCert, setNewCert] = useState('');

  // Achievements
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    type: 'trophy' as Achievement['type'],
    date: new Date().toISOString().split('T')[0]
  });
  const [showAddAchievement, setShowAddAchievement] = useState(false);
  const [achievementImageFile, setAchievementImageFile] = useState<File | null>(null);
  const [achievementImagePreview, setAchievementImagePreview] = useState<string | null>(null);
  const [savingAchievement, setSavingAchievement] = useState(false);
  const [saving, setSaving] = useState(false);

  const achievementImageRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactInfo: {
          ...prev.contactInfo,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAchievementImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    setAchievementImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setAchievementImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleAddAchievement = async () => {
    if (!newAchievement.title || !newAchievement.description) {
      toast.error('Title and description are required.');
      return;
    }
    setSavingAchievement(true);
    try {
      let imageUrl: string | undefined;

      // Upload image if provided
      if (achievementImageFile) {
        const uploaded = await storageService.uploadAchievementImage(user.id, achievementImageFile);
        if (uploaded) imageUrl = uploaded;
      }

      // Save to Supabase achievements table
      const saved = await achievementService.add(user.id, {
        title: newAchievement.title,
        description: newAchievement.description,
        date: newAchievement.date,
        type: newAchievement.type,
        image_url: imageUrl,
      });

      if (saved) {
        toast.success('Achievement added! 🏆');
        setAchievements(prev => [saved, ...prev]);
        setNewAchievement({
          title: '',
          description: '',
          type: 'trophy',
          date: new Date().toISOString().split('T')[0]
        });
        setAchievementImageFile(null);
        setAchievementImagePreview(null);
        setShowAddAchievement(false);
      } else {
        toast.error('Failed to save achievement. Please try again.');
      }
    } catch (err) {
      toast.error('An error occurred saving the achievement.');
    } finally {
      setSavingAchievement(false);
    }
  };

  const handleDeleteAchievement = async (id: string) => {
    const ok = await achievementService.delete(id);
    if (ok) {
      setAchievements(prev => prev.filter(a => a.id !== id));
      toast.success('Achievement removed.');
    }
  };

  const handleAddCertification = () => {
    if (newCert.trim()) {
      setCoachCertifications(prev => [...prev, newCert.trim()]);
      setNewCert('');
    }
  };

  const handleRemoveCertification = (indexToRemove: number) => {
    setCoachCertifications(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let payload: Partial<User> = {};

      if (user.role === 'player') {
        payload = {
          name: formData.name,
          sport: formData.sport,
          location: formData.location,
          bio: formData.bio,
          contactInfo: formData.contactInfo,
          playerProfile: {
            age: formData.age ? parseInt(formData.age) : undefined,
            gender: formData.gender,
            sport: formData.sport,
            position: formData.position,
            bio: formData.bio,
            location: formData.location,
            contactInfo: formData.contactInfo,
            verificationStatus: user.playerProfile?.verificationStatus || 'none'
          }
        };
      } else if (user.role === 'coach') {
        payload = {
          name: formData.name,
          sport: formData.sport,
          location: formData.location,
          bio: formData.bio,
          experience: formData.experience,
          contactInfo: formData.contactInfo,
          coachProfile: {
            experience: formData.experience,
            certifications: coachCertifications,
            sportsCategory: formData.sport,
            bio: formData.bio,
            location: formData.location,
            contactInfo: formData.contactInfo,
            rating: user.coachProfile?.rating || 5.0
          }
        };
      } else if (user.role === 'organization') {
        payload = {
          name: formData.name,
          location: formData.location,
          bio: formData.bio,
          contactInfo: {
            phone: formData.contactInfo.phone,
            website: formData.contactInfo.website
          },
          orgProfile: {
            organizationName: formData.name,
            address: formData.location,
            description: formData.bio,
            website: formData.contactInfo.website,
            phone: formData.contactInfo.phone
          }
        };
      }

      await updateUser(payload);
      toast.success('Profile updated!');
      onClose();
    } catch {
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
            {user.role === 'player' ? <Trophy className="w-5 h-5 text-blue-500 mr-2" /> : <Award className="w-5 h-5 text-green-500 mr-2" />}
            Edit Profile Setup
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors duration-200"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* General Information */}
          <div>
            <h3 className="text-md font-extrabold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">General Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                  {user.role === 'organization' ? 'Organization Name' : 'Full Name'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
              </div>
              
              {user.role !== 'organization' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Sport Focus
                  </label>
                  <select
                    name="sport"
                    value={formData.sport}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {SPORTS_CATEGORIES.map(sport => (
                      <option key={sport} value={sport}>{sport}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                {user.role === 'organization' ? 'Academy Headquarters Address' : 'Location (City, State)'}
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder={user.role === 'organization' ? '123 Main St, New York, NY' : 'Los Angeles, CA'}
              />
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">
                Bio / Description
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                placeholder="Brief introduction..."
              />
            </div>
          </div>

          {/* Role-Specific Sections */}
          {user.role === 'player' && (
            <div>
              <h3 className="text-md font-extrabold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Athlete Profile Fields</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Playing Position</label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                    placeholder="e.g. Guard, Forward"
                  />
                </div>
              </div>
            </div>
          )}

          {user.role === 'coach' && (
            <div>
              <h3 className="text-md font-extrabold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Coaching Credentials</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Years of Coaching Experience</label>
                <input
                  type="text"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="e.g. 5 years"
                />
              </div>

              {/* Coaching Certifications Manager */}
              <div className="mt-4">
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Coach Certifications</label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={newCert}
                    onChange={(e) => setNewCert(e.target.value)}
                    placeholder="e.g. FIBA Level 1 License"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCertification}
                    className="px-4 py-2 bg-green-500 text-white rounded-xl font-bold hover:bg-green-600 transition text-xs"
                  >
                    Add
                  </button>
                </div>
                {coachCertifications.length > 0 && (
                  <div className="space-y-1">
                    {coachCertifications.map((cert, i) => (
                      <div key={i} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-250 dark:border-gray-600 text-sm font-semibold">
                        <span className="text-gray-800 dark:text-gray-200">{cert}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCertification(i)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div>
            <h3 className="text-md font-extrabold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Contact &amp; Social Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Phone</label>
                <input
                  type="tel"
                  name="contactInfo.phone"
                  value={formData.contactInfo.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Website</label>
                <input
                  type="url"
                  name="contactInfo.website"
                  value={formData.contactInfo.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="https://mywebsite.com"
                />
              </div>
              {user.role !== 'organization' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Instagram Handle</label>
                    <input
                      type="text"
                      name="contactInfo.instagram"
                      value={formData.contactInfo.instagram}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder="@instagram_handle"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Twitter Handle</label>
                    <input
                      type="text"
                      name="contactInfo.twitter"
                      value={formData.contactInfo.twitter}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      placeholder="@twitter_handle"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Add Achievements Section (Only for Player) */}
          {user.role === 'player' && (
            <div>
              <div className="flex items-center justify-between mb-4 border-b pb-2 dark:border-gray-700">
                <h3 className="text-md font-extrabold text-gray-800 dark:text-white">Athlete Achievements</h3>
                <button
                  type="button"
                  onClick={() => setShowAddAchievement(true)}
                  className="flex items-center px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-bold transition-all shadow shadow-green-500/10"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Achievement
                </button>
              </div>

              {/* Recently added achievements in this session */}
              {achievements.length > 0 && (
                <div className="space-y-2 mb-4">
                  {achievements.map((a) => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                      <div>
                        <span className="font-bold text-sm text-gray-800 dark:text-white">{a.title}</span>
                        <span className="ml-2 text-xs text-green-600 dark:text-green-400 font-semibold capitalize">{a.type}</span>
                      </div>
                      <button type="button" onClick={() => handleDeleteAchievement(a.id)} className="text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {showAddAchievement && (
                <div className="bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border border-gray-150 dark:border-gray-700 space-y-4 mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Title</label>
                      <input
                        type="text"
                        value={newAchievement.title}
                        onChange={(e) => setNewAchievement(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                        placeholder="Championship Gold Medal"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Type</label>
                      <select
                        value={newAchievement.type}
                        onChange={(e) => setNewAchievement(prev => ({ ...prev, type: e.target.value as Achievement['type'] }))}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                      >
                        <option value="trophy">Trophy</option>
                        <option value="medal">Medal</option>
                        <option value="certificate">Certificate</option>
                        <option value="record">Record</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Description</label>
                    <textarea
                      value={newAchievement.description}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, description: e.target.value }))}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                      placeholder="Details of performance..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Date</label>
                    <input
                      type="date"
                      value={newAchievement.date}
                      onChange={(e) => setNewAchievement(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-xs"
                    />
                  </div>

                  {/* Achievement Image */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Photo (optional)</label>
                    <input
                      ref={achievementImageRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAchievementImageSelect}
                      className="hidden"
                    />
                    {achievementImagePreview ? (
                      <div className="relative">
                        <img src={achievementImagePreview} alt="Preview" className="w-full rounded-xl max-h-32 object-cover" />
                        <button
                          type="button"
                          onClick={() => { setAchievementImageFile(null); setAchievementImagePreview(null); }}
                          className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-lg hover:bg-black/80"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => achievementImageRef.current?.click()}
                        className="flex items-center gap-1.5 px-3 py-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/20 rounded-xl text-xs font-bold border border-dashed border-gray-300 dark:border-gray-600 w-full justify-center transition-all"
                      >
                        <Image className="w-4 h-4" />
                        Add Photo
                      </button>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={handleAddAchievement}
                      disabled={savingAchievement}
                      className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl text-xs font-bold hover:bg-green-600 transition disabled:opacity-60"
                    >
                      {savingAchievement ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                      ) : (
                        'Save Achievement'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAchievement(false)}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 text-xs font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-bold"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:opacity-90 shadow-md shadow-blue-500/10 text-sm disabled:opacity-60"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Changes</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;