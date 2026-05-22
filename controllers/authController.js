// Authentication Controller
// Handles Register, Login, and Logout using Supabase Auth
const supabase = require("../config/supabase");

// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email, and password are required" });
        }

        // Only allow 'citizen' or 'officer' roles
        const userRole = role === "officer" ? "officer" : "citizen";

        // Create user in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true, // Auto-confirm for MVP
        });

        if (authError) {
            return res.status(400).json({ error: authError.message });
        }

        // Insert user profile into users table
        const { error: profileError } = await supabase
            .from("users")
            .insert({
                id: authData.user.id,
                name,
                email,
                role: userRole,
            });

        if (profileError) {
            // Cleanup: delete auth user if profile insert fails
            await supabase.auth.admin.deleteUser(authData.user.id);
            return res.status(400).json({ error: profileError.message });
        }

        res.status(201).json({
            message: "User registered successfully",
            user: { id: authData.user.id, name, email, role: userRole },
        });
    } catch (err) {
        console.error("Register error:", err.message);
        res.status(500).json({ error: "Server error during registration" });
    }
};

// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        // Fetch user profile to get role
        const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", data.user.id)
            .single();

        if (profileError) {
            return res.status(400).json({ error: "User profile not found" });
        }

        res.status(200).json({
            message: "Login successful",
            token: data.session.access_token,
            user: {
                id: profile.id,
                name: profile.name,
                email: profile.email,
                role: profile.role,
            },
        });
    } catch (err) {
        console.error("Login error:", err.message);
        res.status(500).json({ error: "Server error during login" });
    }
};

// POST /api/auth/logout
const logout = async (req, res) => {
    try {
        // On the server side, we just acknowledge the logout
        // The client will clear the token
        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("Logout error:", err.message);
        res.status(500).json({ error: "Server error during logout" });
    }
};

module.exports = { register, login, logout };
