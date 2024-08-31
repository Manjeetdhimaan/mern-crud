import http from "./http.service";
import { IMessage } from "../../models/message.model";
import { messageBaseUrl } from "../../constants/api.constants";


class MessageService {
  async sendMessageWithFiles(data: FormData): Promise<IMessage | null> {
    const response = await http.post(`${messageBaseUrl}/private-message`, data);
    if (response && response.data) {
      return response.data;
    } else {
      return null;
    }
  }

  async updateLastMessageInConversation<T>(data: T): Promise<IMessage | null> {
    const response = await http.put(`${messageBaseUrl}/update-last-message`, data);
    if (response && response.data) {
      return response.data;
    } else {
      return null;
    }
  }
}

export default new MessageService();
