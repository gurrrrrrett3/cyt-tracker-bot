import { Client, Colors, EmbedBuilder, InteractionType, ModalSubmitInteraction } from "discord.js";

export default class ModalManager {
  public modals: Map<string, Function> = new Map();

  constructor(private client: Client) {
    this.client.on("interactionCreate", (modal) => {
      if (modal.type != InteractionType.ModalSubmit) return;

      const modalId = modal.customId;
      const modalFunc = this.modals.get(modalId);
      if (!modalFunc) {
        modal.reply({
          embeds: [
            new EmbedBuilder()
              .setTitle("Error")
              .setDescription("This modal has expired or is invalid.")
              .setColor(Colors.Red)
              .setFooter({ text: `modalId: ${modal.customId}` }),
          ],
          ephemeral: true,
        });
        return;
      }
      modalFunc(modal);
    });
  }

  public registerModal(id: string, modal: (interaction: ModalSubmitInteraction) => any) {
    this.modals.set(id, modal);
  }

  public unregisterModal(id: string) {
    this.modals.delete(id);
  }
}
