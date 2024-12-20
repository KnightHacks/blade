import type { CommandInteraction } from "discord.js";
import { SlashCommandBuilder } from "discord.js";

import { CHAT_RESPONES } from "../consts";

// CHAT COMMAND
// Chat with T.K

// Create the command
export const data = new SlashCommandBuilder()
  .setName("chat")
  .setDescription("Talk to T.K!");

// Logic for the ping command
export async function execute(interaction: CommandInteraction) {
  // Send back a random chat response
  const randomIndex = Math.floor(Math.random() * CHAT_RESPONES.length);

  if (!CHAT_RESPONES[randomIndex]) {
    throw new Error("No chat response found");
  }

  return interaction.reply(CHAT_RESPONES[randomIndex]);
}
