const express = require("express");
const { body, validationResult } = require("express-validator");
const Session = require("../models/Session");
const auth = require("../middleware/auth");

const router = express.Router();

// Get all published sessions (public)
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await Session.find({ status: "published" })
      .populate("user_id", "email")
      .sort({ created_at: -1 });

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get user's own sessions (draft + published)
router.get("/my-sessions", auth, async (req, res) => {
  try {
    const sessions = await Session.find({ user_id: req.user._id }).sort({
      updated_at: -1,
    });

    res.json(sessions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get single user session
router.get("/my-sessions/:id", auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Save or update draft
router.post(
  "/my-sessions/save-draft",
  auth,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("json_file_url").isURL().withMessage("Valid URL is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id, title, tags, json_file_url } = req.body;
      const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : [];

      let session;

      if (id) {
        // Update existing draft
        session = await Session.findOneAndUpdate(
          { _id: id, user_id: req.user._id },
          {
            title,
            tags: tagsArray,
            json_file_url,
            status: "draft",
          },
          { new: true }
        );

        if (!session) {
          return res.status(404).json({ message: "Session not found" });
        }
      } else {
        // Create new draft
        session = new Session({
          user_id: req.user._id,
          title,
          tags: tagsArray,
          json_file_url,
          status: "draft",
        });

        await session.save();
      }

      res.json(session);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Publish session
router.post(
  "/my-sessions/publish",
  auth,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("json_file_url").isURL().withMessage("Valid URL is required"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id, title, tags, json_file_url } = req.body;
      const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : [];

      let session;

      if (id) {
        // Update and publish existing session
        session = await Session.findOneAndUpdate(
          { _id: id, user_id: req.user._id },
          {
            title,
            tags: tagsArray,
            json_file_url,
            status: "published",
          },
          { new: true }
        );

        if (!session) {
          return res.status(404).json({ message: "Session not found" });
        }
      } else {
        // Create and publish new session
        session = new Session({
          user_id: req.user._id,
          title,
          tags: tagsArray,
          json_file_url,
          status: "published",
        });

        await session.save();
      }

      res.json(session);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
