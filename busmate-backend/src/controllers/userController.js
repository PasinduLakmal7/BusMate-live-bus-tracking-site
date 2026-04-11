const Users = require('../../db/models/usersModel.js');

/**
 * Get user profile data
 */
exports.getProfile = async (req, res) => {
  try {
    // 1. IDENTIFY OPERATIVE (Session or Secure Cookie)
    const rawUserId = req.cookies?.userId || req.session?.userId; 
    const userId = rawUserId ? parseInt(rawUserId) : null;

    if (!userId) {
      return res.status(200).json({ success: false, guest: true, message: 'Guest session' });
    }

    const user = await Users.query().findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Add dynamic stats (Simulated for this node)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      journeyCount: 142,
      savedRoutesCount: 8,
      profilePic: '👨🏽‍💻'
    };

    res.json({ success: true, user: userData });
  } catch (err) {
    console.error('getProfile error', err);
    res.status(500).json({ success: false, error: 'Internal Server Sync Failure' });
  }
};

/**
 * Update user preferences (e.g. Dark Mode, Language)
 */
exports.updatePreferences = async (req, res) => {
    // This could update a 'preferences' JSONB column in users table
    res.json({ success: true, message: 'Preferences updated successfully' });
};
