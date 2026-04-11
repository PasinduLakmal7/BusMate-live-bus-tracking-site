const logoutUser = (req, res) => {
    try {
        // TERMINATE SESSION: Clear the secure userId cookie
        res.clearCookie('userId', { path: '/' });

        // If using express-session on this node core, clear it as well
        if (req.session) {
            req.session.destroy();
        }

        return res.status(200).json({ 
            success: true, 
            message: "Session terminated. Return to base established." 
        });
    } catch (err) {
        console.error('Logout Fail:', err);
        return res.status(500).json({ success: false, error: "System Error: Termination failed." });
    }
};

module.exports = logoutUser;
