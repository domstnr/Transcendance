import { IEvent } from './event.interface';
import { EventType, ChatMessageSentPayload } from './event.types';

export class ChatMessageSentEvent implements IEvent<ChatMessageSentPayload> {
  public readonly type = EventType.CHAT_MESSAGE_SENT;
  public readonly timestamp = Date.now();

  constructor(public readonly payload: ChatMessageSentPayload) {}
}