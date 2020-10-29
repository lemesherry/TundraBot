const { MessageEmbed } = require("discord.js");
const { stripIndents } = require("common-tags");
const { createRole, formatDate, formatDateLong } = require("../functions");
const { defaultGuildSettings: defaults } = require("../config");

/**
 * @param {import("discord.js").Client} client Discord Client instance
 * @param {import("discord.js").Guild} guild Discord Guild
*/
module.exports = async (client, guild) => {
    try {
        let clientMember = await guild.members.cache.get(client.user.id);
        const newGuild = {
            guildID: guild.id,
            guildName: guild.name,
            timeJoined: clientMember.joinedAt
        };

        await client.createGuild(newGuild);
    } catch (err) {
        console.error("Join server error: ", err);
    }

    console.log(`Joined new guild: ${guild.name}`);

    const owner = await client.users.fetch(process.env.OWNERID);

    const embedMsg = new MessageEmbed()
        .setColor("GREEN")
        .setTimestamp()
        .setFooter(guild.name, guild.iconURL())
        .setAuthor("Joined server :)", guild.iconURL())
        .addField("Guild information", stripIndents`**\\> ID:** ${guild.id}
            **\\> Name:** ${guild.name}
            **\\> Member count:** ${guild.memberCount}
            **\\> Created at:** ${formatDateLong(guild.createdTimestamp)}
            **\\> Joined at:** ${formatDateLong(guild.joinedTimestamp)}`);   
    if (!guild.owner) {
        await guild.members.fetch(guild.ownerID);
    }
        embedMsg.addField("Server owner information", stripIndents`**\\> ID:** ${guild.owner.user.id}
            **\\> Username:** ${guild.owner.user.username}
            **\\> Discord Tag:** ${guild.owner.user.tag}
            **\\> Created account:** ${formatDate(guild.owner.user.createdAt)}`, true);

    owner.send(embedMsg);

    // Create necessary roles for soundboard commands
    createRole(guild, defaults.soundboardRole, null).catch((err) => {
        console.error("Couldn't create soundboard role: ", err);
    });
};