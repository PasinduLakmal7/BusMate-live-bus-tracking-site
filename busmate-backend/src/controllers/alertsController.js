const pool = require('../../db.js');

/**
 * Get all transit alerts
 */
exports.getAllAlerts = async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT alert_id as id, type, title, description, routes, created_at, is_read FROM alerts';
    const params = [];

    if (type && type !== 'All') {
      // Mapping categories back to backend types
      const typeMap = {
        'Delays': 'Delay',
        'Accidents': 'Accident',
        'Route Changes': 'Route Change',
        'System': 'System'
      };
      const dbType = typeMap[type] || type;
      query += ' WHERE type = $1';
      params.push(dbType);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ success: true, alerts: result.rows });
  } catch (err) {
    console.error('getAllAlerts error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Mark a single alert as read
 */
exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('UPDATE alerts SET is_read = TRUE WHERE alert_id = $1', [id]);
    res.json({ success: true, message: 'Alert marked as read' });
  } catch (err) {
    console.error('markAsRead error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

/**
 * Mark all alerts as read
 */
exports.markAllRead = async (req, res) => {
  try {
    await pool.query('UPDATE alerts SET is_read = TRUE');
    res.json({ success: true, message: 'All alerts marked as read' });
  } catch (err) {
    console.error('markAllRead error', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
