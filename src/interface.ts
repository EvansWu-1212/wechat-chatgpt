import { ChatCompletionRequestMessage } from "azure-openai";

export interface IConfig {
  api?: string;
  openai_api_key: string;
  model: string;
  chatTriggerRule: string;
  disableGroupMessage: boolean;
  temperature: number;
  blockWords: string[];
  chatgptBlockWords: string[];
  chatPrivateTriggerKeyword: string;
  importantTalkers: string[];
  turnOnAudio: boolean;
  turnOnImage: boolean;
  developmentName: string;
  first_prompt: string;
  last_prompt: string;
}

export interface ExtendedChatCompletionRequestMessage extends ChatCompletionRequestMessage {
  time: number;
}

export interface User {
  username: string,
  chatMessage: Array<ExtendedChatCompletionRequestMessage>,
}