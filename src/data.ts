import { ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from "azure-openai";
import { User } from "./interface";
import { isTokenOverLimit } from "./utils.js";
import { getFirstPrompt } from "./prompts.js";

const FIVE_MINUTES = 5 * 60 * 1000;

/**
 * 使用内存作为数据库
 */
class DB {
  private static data: User[] = [];

  /**
   * 添加一个用户, 如果用户已存在则返回已存在的用户
   * @param username
   */
  public addUser(username: string): User {
    let existUser = DB.data.find((user) => user.username === username);
    if (existUser) {
      console.log(`用户${username}已存在`);
      return existUser;
    }
    const newUser: User = {
      username: username,
      chatMessage: [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: getFirstPrompt(username),
          time: new Date().getTime()
        }
      ],
    };
    DB.data.push(newUser);
    return newUser;
  }

  /**
   * 根据用户名获取用户, 如果用户不存在则添加用户
   * @param username
   */
  public getUserByUsername(username: string): User {
    return DB.data.find((user) => user.username === username) || this.addUser(username);
  }

  /**
   * 获取用户的聊天记录
   * @param username
   */
  public getChatMessage(username: string): Array<ChatCompletionRequestMessage> {
    const usersAllMessages = this.getUserByUsername(username).chatMessage;
    const currentTime = new Date().getTime();
    // filter those messages which is 5 minutes ago.
    const userRecentlyMessages = usersAllMessages.filter((message, index) => {
      // Skip filter the first prompt;
      if (index == 0) {
        return true;
      }
      return currentTime - message.time < FIVE_MINUTES
    }).map(message => ({
      role: message.role,
      content: message.content
    }));

    return userRecentlyMessages;
  }

  /**
   * 设置用户的prompt
   * @param username
   * @param prompt
   */
  public setPrompt(username: string, prompt: string): void {
    const user = this.getUserByUsername(username);
    if (user) {
      user.chatMessage.find(
        (msg) => msg.role === ChatCompletionRequestMessageRoleEnum.System
      )!.content = prompt;
    }
  }

  /**
   * 添加用户输入的消息
   * @param username
   * @param message
   */
  public addUserMessage(username: string, message: string): void {
    const user = this.getUserByUsername(username);
    if (user) {
      while (isTokenOverLimit(user.chatMessage)) {
        // 删除从第2条开始的消息(因为第一条是prompt)
        user.chatMessage.splice(1, 1);
      }
      user.chatMessage.push({
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: message,
        time: new Date().getTime()
      });
    }
  }

  public removeLastUserMessage(username: string) {
    const user = this.getUserByUsername(username);
    if (user && user.chatMessage.length > 0) {
      user.chatMessage.pop();
      console.log("Last message removed.");
    }
  }

  public modifyLastPrompt(username: string, modifedPrompt: string) {
    const user = this.getUserByUsername(username);
    if (user && user.chatMessage.length > 0) {
      let lastPrompt = user.chatMessage[user.chatMessage.length - 1];
      console.log("Last message changed from: " + lastPrompt.content + " to: " + modifedPrompt);
      user.chatMessage[user.chatMessage.length - 1].content = modifedPrompt;
      return true;
    } else {
      return false;
    }
  }

  /**
   * 添加ChatGPT的回复
   * @param username
   * @param message
   */
  public addAssistantMessage(username: string, message: string): void {
    const user = this.getUserByUsername(username);
    if (user) {
      while (isTokenOverLimit(user.chatMessage)) {
        // 删除从第2条开始的消息(因为第一条是prompt)
        user.chatMessage.splice(1, 1);
      }
      user.chatMessage.push({
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: message,
        time: new Date().getTime()
      });
    }
  }

  /**
   * 清空用户的聊天记录, 并将prompt设置为默认值
   * @param username
   */
  public clearHistory(username: string): void {
    const user = this.getUserByUsername(username);
    if (user) {
      user.chatMessage = [
        {
          role: ChatCompletionRequestMessageRoleEnum.System,
          content: getFirstPrompt(username),
          time: new Date().getTime()
        }
      ];
    }
  }

  public getAllData(): User[] {
    return DB.data;
  }
}
const DBUtils = new DB();
export default DBUtils;