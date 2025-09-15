import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());

// Proxy endpoint
app.get("/proxy", async (req, res) => {
  try {
    const username = req.query.username;
    if (!username) return res.status(400).json({ error: "Username required" });

    // Step 1: Get userId from username
    const userRes = await fetch(`https://users.roblox.com/v1/usernames/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usernames: [username] })
    });

    const userData = await userRes.json();
    if (!userData.data || userData.data.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userData.data[0];
    const userId = user.id;

    // Step 2: Get avatar
    const avatarRes = await fetch(
      `https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=150x150&format=Png&isCircular=false`
    );
    const avatarData = await avatarRes.json();

    res.json({
      username: user.name,
      userId,
      avatar: avatarData.data[0]?.imageUrl || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Proxy failed" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Proxy running on port ${port}`));
