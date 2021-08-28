import { Command, CommandContext } from "../../base/Command";
import { MessageEmbed, TextChannel } from "discord.js";
import { sendMessage, sendReply } from "../../utils/functions";
import { stripIndents } from "common-tags";

export default class Suggest implements Command {
    name = "suggest";
    aliases = ["suggestion"];
    category = "moderation";
    description = "Suggests a feature to implement.";
    usage = "suggest <suggestion>";
    enabled = true;
    slashCommandEnabled = false;
    guildOnly = false;
    botPermissions = [];
    memberPermissions = [];
    ownerOnly = false;
    premiumOnly = false;
    cooldown = 30000; // 30 seconds

    async execute(ctx: CommandContext, args: string[]): Promise<void> {
        // If there was no suggestion specified
        if (!args[0]) {
            sendReply(
                ctx.client,
                "Please specify a suggestion!",
                ctx.msg
            );
            return;
        }        

        const embedMsg = new MessageEmbed()
            .setColor("#390645")
            .setTimestamp()
            .setAuthor("Suggestion by", ctx.author.displayAvatarURL());
        
        if (ctx.guild) {
            embedMsg.setDescription(stripIndents`**\\> Member:** ${ctx.member} (${ctx.member.id})
            **\\> Suggested in:** ${ctx.guild}'s ${ctx.channel} (${ctx.guild.id})
            **\\> Suggestion:** ${args.join(" ")}`).setFooter(ctx.guild.name, ctx.guild.iconURL());
        } else {
            embedMsg.setDescription(`**\\> Suggestion:** ${args.join(" ")}`);
        }

        const supportGuild = await ctx.client.guilds.fetch(
            process.env.SUPPORT_SERVER_ID
        );

        const suggestionsChannel = supportGuild.channels.cache.get(
            process.env.SUPPORT_SERVER_SUGGESTIONS_CHANNEL_ID
        ) as TextChannel;

        sendMessage(ctx.client, { embeds: [embedMsg] }, suggestionsChannel);

        sendReply(ctx.client, `Thanks! Your suggestion has been sent to my creator ${process.env.OWNERNAME}${process.env.OWNERTAG}.`, ctx.msg);
    }
}