/* eslint-disable no-case-declarations */
import { Message, MessageEmbed, Snowflake, TextChannel } from "discord.js";
import { TundraBot } from "../base/TundraBot";
import { sendMessage } from "../utils/functions";
import Logger from "../utils/logger";
import { StartupHelper } from "./startupHelper";

export default class PlayerInit extends StartupHelper {
    // <guildID, now playing message>
    nowPlayingMessages: Map<Snowflake, Message>;

    constructor(client: TundraBot) {
        super(client);
        this.nowPlayingMessages = new Map();
    }

    async init(): Promise<void> {
        this.client.player
            .on("trackStart", async (queue, track) => {
                queue.options.leaveOnEmpty = false;
                queue.options.autoSelfDeaf = true;
                queue.options.leaveOnEnd = true;
                queue.options.leaveOnStop = true;

                const embedMsg = new MessageEmbed()
                    .setColor("BLUE")
                    .setDescription(
                        `🎵 Now playing: [${track.title}](${track.url})`
                    )
                    .setFooter(
                        `Queued by: ${track.requestedBy.tag}`,
                        track.requestedBy.displayAvatarURL()
                    )
                    .setTimestamp();

                sendMessage(
                    this.client,
                    { embeds: [embedMsg] },
                    <TextChannel>queue.metadata
                ).then((message) => {
                    if (!message) return;
                    this.nowPlayingMessages.set(queue.guild.id, message);
                });
            })
            .on("trackEnd", async (queue, track) => {
                let nowPlayingMessage = this.nowPlayingMessages.get(queue.guild.id);
                if (nowPlayingMessage) nowPlayingMessage = await nowPlayingMessage.fetch();

                if (nowPlayingMessage && nowPlayingMessage.deletable) {
                    nowPlayingMessage.delete().catch();
                }
            })
            .on("botDisconnect", async (queue) => {
                sendMessage(
                    this.client,
                    "I disconnected from the voice channel...",
                    <TextChannel>queue.metadata
                );
            })
            .on("queueEnd", async (queue) => {
                // Just leave
            })
            .on("trackAdd", async (queue, track) => {
                // do nothing, handle in play command
            })
            .on("tracksAdd", async (queue, tracks) => {
                // do nothing, handle in play command
            })
            .on("channelEmpty", async () => {
                // do nothing, leaveOnEmpty is not enabled
            })
            .on("error", async (queue, error) => {
                Logger.log(
                    "error",
                    `[${queue.guild.name}] Error emitted from the queue: ${error.message}`
                );

                switch (error.message) {
                    case "NotConnected":
                        sendMessage(
                            this.client,
                            "You must be connected to a voice channel!",
                            <TextChannel>queue.metadata
                        );
                        break;
                    case "UnableToJoin":
                        sendMessage(
                            this.client,
                            "I can't connect to your voice channel!",
                            <TextChannel>queue.metadata
                        );
                        break;
                    case "NotPlaying":
                        sendMessage(
                            this.client,
                            "No songs are currently playing in this server.",
                            <TextChannel>queue.metadata
                        );
                        break;
                    case "ParseError":
                        sendMessage(
                            this.client,
                            "I had trouble parsing this song/playlist.",
                            <TextChannel>queue.metadata
                        );
                        break;
                    case "LiveVideo":
                        sendMessage(
                            this.client,
                            "Live videos are not yet supported!",
                            <TextChannel>queue.metadata
                        );
                        break;
                    case "VideoUnavailable":
                        sendMessage(
                            this.client,
                            "I'm unable to access this video.",
                            <TextChannel>queue.metadata
                        );
                        break;
                    default:
                        Logger.log("error", error);

                        sendMessage(
                            this.client,
                            `An error occurred... Code: \`${error.message}\``,
                            <TextChannel>queue.metadata
                        );
                        break;
                }
            })
            .on("connectionError", async (queue, error) => {
                Logger.log(
                    "error",
                    `[${queue.guild.name}] Error emitted from the connection: ${error.message}`
                );

                sendMessage(
                    this.client,
                    `An error occurred... Code: \`${error.message}\``,
                    <TextChannel>queue.metadata
                );
            });
    }
}
