const express = require("express");
const authClient = require("../modules/auth-client");
const sessions = require("../modules/sessions");

const router = express.Router();

router.get("/invite", (req, res) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${process.env.BOT_ID}&redirect_uri=${process.env.DASHBOARD_URL}/auth-guild&response_type=code&scope=bot`);
});

router.get("/login", (req, res) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=${process.env.BOT_ID}&redirect_uri=${process.env.DASHBOARD_URL}/auth&response_type=code&scope=identify%20guilds&prompt=none`);
});

router.get("/auth-guild", async (req, res) => {
    try {
        const key = res.cookies.get("key");
        await sessions.update(key);
    } finally {
        res.redirect("/dashboard");
    }
});

router.get("/auth", async (req, res) => {
    const code = req.query.code;
    try {
        const key = await authClient.getAccess(code);
        res.cookies.set("key", key);

        res.redirect(process.env.DASHBOARD_URL);
    } catch (err) {
        res.redirect("/");
    }
});

router.get("/logout", (req, res) => {
    res.cookies.set("key", "");

    res.redirect("/");
});

module.exports = router;