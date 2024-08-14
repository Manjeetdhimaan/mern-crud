import http from "./http.service";
import { messageBaseUrl } from "../../constants/local.constants";
import { IMessage } from "../../models/message.model";


class MessageService {
  async sendMessageWithFiles(data: FormData): Promise<IMessage | null> {
    const response = await http.post(`${messageBaseUrl}/private-message`, data);
    if (response && response.data) {
      return response.data;
    } else {
      return null;
    }
  }
}

export default new MessageService();
