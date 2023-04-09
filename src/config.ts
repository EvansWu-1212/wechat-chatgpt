import * as dotenv from "dotenv";
dotenv.config();
import { IConfig } from "./interface";

export const config: IConfig = {
  api: process.env.ENDPOINT,
  openai_api_key: process.env.OPENAI_API_KEY || "123456789",
  model: process.env.MODEL || "gpt-35-turbo",
  chatPrivateTriggerKeyword: process.env.CHAT_PRIVATE_TRIGGER_KEYWORD || "",
  chatTriggerRule: process.env.CHAT_TRIGGER_RULE || "",
  disableGroupMessage: process.env.DISABLE_GROUP_MESSAGE === "true",
  temperature: process.env.TEMPERATURE ? parseFloat(process.env.TEMPERATURE) : 0.6,
  blockWords: process.env.BLOCK_WORDS?.split(",") || [],
  chatgptBlockWords: process.env.CHATGPT_BLOCK_WORDS?.split(",") || [],
  importantTalkers: process.env.SKIP_BLOCK_NAMES?.split(",") || [],
  turnOnAudio: process.env.TURN_ON_AUDIO == "true" || false,
  turnOnImage: process.env.TURN_ON_IMAGE == "true" || false,
  developmentName: process.env.DEVELOPMENT_NAME || "chatgpt"
};