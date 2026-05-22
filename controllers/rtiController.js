// RTI Request Controller
// Handles CRUD operations for RTI requests
const supabase = require("../config/supabase");

// POST /api/rti/create - Citizen creates a new RTI request
const createRequest = async (req, res) => {
    try {
        const { title, description } = req.body;
        const userId = req.user.id;

        if (!title || !description) {
            return res.status(400).json({ error: "Title and description are required" });
        }

        // Check if user is a citizen
        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", userId)
            .single();

        if (!profile || profile.role !== "citizen") {
            return res.status(403).json({ error: "Only citizens can create RTI requests" });
        }

        // Insert the RTI request
        const { data, error } = await supabase
            .from("rti_requests")
            .insert({
                user_id: userId,
                title,
                description,
                status: "Pending",
            })
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(201).json({
            message: "RTI request created successfully",
            request: data,
        });
    } catch (err) {
        console.error("Create request error:", err.message);
        res.status(500).json({ error: "Server error while creating request" });
    }
};

// GET /api/rti/my - Citizen gets their own requests
const getMyRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data, error } = await supabase
            .from("rti_requests")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ requests: data });
    } catch (err) {
        console.error("Get my requests error:", err.message);
        res.status(500).json({ error: "Server error while fetching requests" });
    }
};

// GET /api/rti/all - Officer gets all requests
const getAllRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        // Check if user is an officer
        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", userId)
            .single();

        if (!profile || profile.role !== "officer") {
            return res.status(403).json({ error: "Only officers can view all requests" });
        }

        const { data, error } = await supabase
            .from("rti_requests")
            .select("*, users(name, email)")
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({ requests: data });
    } catch (err) {
        console.error("Get all requests error:", err.message);
        res.status(500).json({ error: "Server error while fetching requests" });
    }
};

// PUT /api/rti/status/:id - Officer updates request status
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        // Validate status
        const allowedStatuses = ["Pending", "Under Review", "Resolved"];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({
                error: "Invalid status. Allowed values: Pending, Under Review, Resolved",
            });
        }

        // Check if user is an officer
        const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", userId)
            .single();

        if (!profile || profile.role !== "officer") {
            return res.status(403).json({ error: "Only officers can update request status" });
        }

        // Update the request status
        const { data, error } = await supabase
            .from("rti_requests")
            .update({ status })
            .eq("id", id)
            .select()
            .single();

        if (error) {
            return res.status(400).json({ error: error.message });
        }

        res.status(200).json({
            message: "Status updated successfully",
            request: data,
        });
    } catch (err) {
        console.error("Update status error:", err.message);
        res.status(500).json({ error: "Server error while updating status" });
    }
};

module.exports = { createRequest, getMyRequests, getAllRequests, updateStatus };
