// Authentication middleware
// Verifies the Supabase JWT token from the Authorization header
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        // Create a Supabase client with the user's token to verify it
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY,
            {
                global: {
                    headers: { Authorization: `Bearer ${token}` },
                },
            }
        );

        // Get the user from the token
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return res.status(401).json({ error: "Invalid or expired token" });
        }

        // Attach user info to request
        req.user = user;
        req.supabaseToken = token;
        next();
    } catch (err) {
        console.error("Auth middleware error:", err.message);
        return res.status(500).json({ error: "Authentication failed" });
    }
};

module.exports = authMiddleware;
