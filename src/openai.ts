import DBUtils from "./data.js";
import { config } from "./config.js";
import axios from "axios";

enum DebugLevel {
  debug,
  info,
  error
}

const defaultAnswer = "对不起，你的问题没有返回答案。很有可能你的答案违规了，你再这样问，我就报警了哈。";
const warningAnswer = "无可奉告，不要总想搞个大新闻！";
/**
 * Get completion from OpenAI
 * @param username
 * @param message
 */
async function chatgpt(username: string, message: string) {
  // 先将用户输入的消息添加到数据库中
  DBUtils.addUserMessage(username, message);
  const messages = DBUtils.getChatMessage(username);

  // try to add rule prompt appended in the last prompt;
  messages[messages.length - 1].content += config.last_prompt;

  let url = `${config.api}/openai/deployments/${config.developmentName}/chat/completions?api-version=2023-03-15-preview`
  let requestConfig = {
    apiKey: config.openai_api_key,
    data: { "messages": messages, "temperature": 0.9, "top_p": 0.95, "frequency_penalty": 0, "presence_penalty": 0, "stop": null }
  }
  let response = null;

  writeLogs(username, message, DebugLevel.debug);

  try {
    response = await axios({
      method: 'post',
      url: url,
      headers: {
        "api-key": requestConfig.apiKey
      },
      data: requestConfig.data
    });
  } catch (e: any) {
    //TODO: Write the error message in the local files.
    console.log(JSON.stringify(e));
  }

  let assistantMessage = null;
  if (response && response.data && response.data.choices && response.data.choices.length != 0 && response.data.choices[0].message) {
    assistantMessage = response.data.choices[0].message.content.replace(/^\n+|\n+$/g, "") as string;
  } else {
    assistantMessage = defaultAnswer;
  }

  console.log("Receiving assistantMessage:" + assistantMessage);

  if (assistantMessage == defaultAnswer || assistantMessage == warningAnswer) {
    console.log("Violate the rule, remove the last prompt in the messages.")
    DBUtils.removeLastUserMessage(username);
  } else {
    // remove the added rule prompt appended in the last prompt;
    let modifedPrompt = messages[messages.length - 1].content.split(config.last_prompt)[0];
    DBUtils.modifyLastPrompt(username, modifedPrompt);
    console.log(DBUtils.getChatMessage(username));
    console.log(`Finish Chatting with ${username}\n answers: ${assistantMessage}`,);
  }
  return assistantMessage;
}

/**
 * Get image from Dall·E
 * @param username
 * @param prompt
 */
async function dalle(username: string, prompt: string) {
  // const response = await openai.createImage({
  //   prompt: prompt,
  //   n:1,
  //   size: CreateImageRequestSizeEnum._256x256,
  //   response_format: CreateImageRequestResponseFormatEnum.Url,
  //   user: username
  // }).then((res) => res.data).catch((err) => console.log(err));
  // if (response) {
  //   return response.data[0].url;
  // }else{
  //   return "Generate image failed"
  // }
  // TODO: add dalle.
  return "Not support for now.";
}

/**
 * Speech to text
 * @param username
 * @param videoPath
 */
async function whisper(username: string, videoPath: string): Promise<string> {
  // const file:any= fs.createReadStream(videoPath);
  // const response = await openai.createTranscription(file,"whisper-1")
  //   .then((res) => res.data).catch((err) => console.log(err));
  // if (response) {
  //   return response.text;
  // }else{
  //   return "Speech to text failed"
  // }
  return Promise.resolve("Not Support now.")
}

function writeLogs(username: string, message: string, debugLevel: DebugLevel) {


}


export { chatgpt, dalle, whisper };