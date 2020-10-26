const { Client, Collection } = require("discord.js");
const { config } = require("dotenv");
const fs = require("fs");

const checkPolls = require("./helpers/checkPolls");
const checkEvents = require("./helpers/checkEvents");
const loadRoleMenus = require("./helpers/loadRoleMenus");
const loadMemberSoundEffects = require("./helpers/loadMemberSoundEffects");

function setup() {
    const client = new Client({
        disableEveryone: false
    });

    config({
        path: __dirname + "/.env"
    });

    client.mongoose = require("./utils/mongoose");
    client.config = require("./config");
    require("./utils/mongooseFunctions")(client);

    client.commands = new Collection();
    client.aliases = new Collection();

    client.categories = fs.readdirSync("./commands/");

    ["commands", "events"].forEach(handler => {
        require(`./handlers/${handler}`)(client);
    });

    // Map with guilds playing music ?
    client.musicGuilds = new Map();

    // Map with guilds playing soundboard effects
    client.soundboardGuilds = new Map();

    // Set of people we are currently waiting on a response from so that we can ignore any further commands until we get it
    client.waitingResponse = new Set();

    client.mongoose.init();

    client.databaseCache = {};
    client.databaseCache.events = new Collection();
    client.databaseCache.roleMenus = new Collection();
    client.databaseCache.soundEffects = new Collection();
    client.databaseCache.memberSoundEffects = new Collection();

    client.login(process.env.DISCORDTOKEN);

    checkPolls.init(client);
    checkEvents.init(client);
    loadRoleMenus.init(client);
    loadMemberSoundEffects.init(client);
}

// if there is an unhandledRejection, log them
process.on("unhandledRejection", (err) => {
	console.error("unhandledRejection:\n", err);
});

setup();