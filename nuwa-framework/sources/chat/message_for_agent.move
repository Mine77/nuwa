module nuwa_framework::message_for_agent {
    use std::string::{Self, String};
    use std::vector;
    use moveos_std::object;
    use moveos_std::json;
    use nuwa_framework::message::{Self, Message};
    use nuwa_framework::agent_input::{Self, AgentInput};

    #[data_struct]
    struct MessageForAgent has copy, drop, store{
        index: u64,
        sender: address,
        content: String,
        timestamp: u64,
        message_type: u8,
        reply_to: u64,
    }

    /// Message Input Description
    const MESSAGE_INPUT_DESCRIPTION: vector<u8> = b"Message Input structure: A MessageInput contains a history of previous messages and the current message to process. | Message fields: | - index: message sequence number | - sender: sender's address | - content: message text | - timestamp: creation time in milliseconds | - message_type: 0=normal message, 1=action event message, 2=system event message | - reply_to: index of the message being replied to, 0 means no reply | Use message history to maintain conversation context and respond appropriately to the current message.";

    #[data_struct]
    struct MessageInput has copy, drop, store {
        history: vector<MessageForAgent>,
        current: MessageForAgent,
    }

    public fun new_agent_input(messages: vector<Message>) : AgentInput<MessageInput> {
        let channel_id = message::get_channel_id(vector::borrow(&messages,0));
        let messages_for_agent = vector::empty();
        vector::for_each(messages, |msg| {
            let msg: Message = msg;
            vector::push_back(&mut messages_for_agent, MessageForAgent {
                index: message::get_index(&msg),
                sender: message::get_sender(&msg),
                content: message::get_content(&msg),
                timestamp: message::get_timestamp(&msg),
                message_type: message::get_type(&msg),
                reply_to: message::get_reply_to(&msg),
            });
        });
        let current = vector::pop_back(&mut messages_for_agent);
        let description = string::utf8(b"Receive a message from a channel(");
        string::append(&mut description, object::to_string(&channel_id));
        string::append(&mut description, string::utf8(b")\n"));
        string::append(&mut description, string::utf8(MESSAGE_INPUT_DESCRIPTION));
        agent_input::new_agent_input(
            current.sender,
            channel_id,
            description,
            MessageInput {
                history: messages_for_agent,
                current,
            }
        )
    }

    public fun decode_agent_input(input_data_json: String) : MessageInput {
        json::from_json<MessageInput>(string::into_bytes(input_data_json))
    }

    public fun get_history(input: &MessageInput) : &vector<MessageForAgent> {
        &input.history
    }

    public fun get_current(input: &MessageInput) : &MessageForAgent {
        &input.current
    }

    public fun get_index(msg: &MessageForAgent) : u64 {
        msg.index
    }

    public fun get_sender(msg: &MessageForAgent) : address {
        msg.sender
    }

    public fun get_content(msg: &MessageForAgent) : String {
        msg.content
    }

    public fun get_timestamp(msg: &MessageForAgent) : u64 {
        msg.timestamp
    }

    public fun get_message_type(msg: &MessageForAgent) : u8 {
        msg.message_type
    }

    public fun get_reply_to(msg: &MessageForAgent) : u64 {
        msg.reply_to
    }
}