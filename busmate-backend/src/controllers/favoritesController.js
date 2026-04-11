const pool = require('../../db.js');

/**
 * Identify User ID for all favorites actions
 */
const getUserId = (req) => {
    const rawUserId = req.cookies?.userId || req.session?.userId; 
    return rawUserId ? parseInt(rawUserId) : null;
};

// GET all favorites for the logged-in user
exports.getFavorites = async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) {
            return res.json({ success: true, favorites: [] });
        }

        const result = await pool.query(
            "SELECT item_type, item_id, item_name FROM user_favorites WHERE user_id = $1 ORDER BY created_at DESC", 
            [userId]
        );
        
        return res.json({ success: true, favorites: result.rows });
    } catch (err) {
        console.error("Get Favorites failure:", err);
        return res.status(500).json({ success: false, error: "Security synchronizer offline" });
    }
};

// ADD a favorite
exports.addFavorite = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { item_type, item_id, item_name } = req.body;
        
        if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

        await pool.query(
            "INSERT INTO user_favorites (user_id, item_type, item_id, item_name) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, item_type, item_id) DO NOTHING",
            [userId, item_type, item_id, item_name]
        );

        return res.status(201).json({ success: true, message: "Node saved to core" });
    } catch (err) {
        console.error("Add Favorite failure:", err);
        return res.status(500).json({ success: false, error: "Gateway saving failure" });
    }
};

// REMOVE a favorite
exports.removeFavorite = async (req, res) => {
    try {
        const userId = getUserId(req);
        const { item_type, item_id } = req.body;
        
        if (!userId) return res.status(401).json({ success: false, error: "Unauthorized" });

        await pool.query(
            "DELETE FROM user_favorites WHERE user_id = $1 AND item_type = $2 AND item_id = $3",
            [userId, item_type, item_id]
        );

        return res.json({ success: true, message: "Node disconnected from core" });
    } catch (err) {
        console.error("Remove Favorite failure:", err);
        return res.status(500).json({ success: false, error: "Removal handshake failed" });
    }
};
