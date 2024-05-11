import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GiftedChat } from 'react-native-gifted-chat';
import socketIOClient from 'socket.io-client';


const ChatDetailScreen = ({ route }) => {
    const { conversationId, otherusername, currentusername } = route.params;
    const [messages, setMessages] = useState([]);
    const socket = useRef();
    socket.current = socketIOClient("http://192.168.0.120:3001/");

    useEffect(() => {
        console.log(otherusername, currentusername);
        const endpoint = process.env.IPV4;

        console.log(endpoint);
        const fetchMessages = async () => {
            try {
                console.log(endpoint, conversationId);
                console.log("socket.current", socket.current);
                const response = await fetch(`http://${endpoint}/messages/${conversationId}`);
                const data = await response.json();
                console.log(data);
                const formattedMessages = data.map(msg => ({
                    _id: msg._id,
                    text: msg.text,
                    createdAt: new Date(msg.createdAt),
                    user: {
                        _id: msg.fromUserName === currentusername ? currentusername : otherusername,
                        name: msg.fromUserName,
                        avatar: msg.fromUserName === currentusername ? 'current_user_avatar_url' : 'other_user_avatar_url',
                    },
                }));
                formattedMessages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

                setMessages(formattedMessages);
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            }
        };

        fetchMessages();

        const handleReceiveMessage = message => {
            if (message.conversationId === conversationId) {
                setMessages(previousMessages => GiftedChat.append(previousMessages, {
                    ...message,
                    user: {
                        _id: message.fromUserName === currentusername ? currentusername : otherusername,
                        name: message.fromUserName,
                        avatar: 'avatar_url_based_on_user',
                    },
                }));
            }
        };

        socket.current.on('receiveMessage', handleReceiveMessage);
        socket.current.on('connect', () => {
            console.log('Connected to server');
            socket.current.emit('testMessage', { msg: 'Hello Server' });
        });
        return () => socket.current.disconnect();
    }, [conversationId, currentusername, otherusername]);

    const onSend = useCallback((newMessages = []) => {
        console.log("onsend trigger", newMessages);
        newMessages.forEach((message) => {
            socket.current.emit('sendMessage', {
                ...message,
                conversationId,
                fromUserName: currentusername,
                toUserName: otherusername,
                createdAt: new Date(),
            }, (confirmation) => {
                if (confirmation.success) {
                    console.log('Message sent successfully_client.');
                } else {
                    console.log('Error sending message:', confirmation.error);
                }
            });

            setMessages(previousMessages => GiftedChat.append(previousMessages, message));
        });
    }, [conversationId, currentusername, otherusername]);


    return (
        <GiftedChat
            messages={messages} handleSendMessage
            onSend={messages => onSend(messages)}
            user={{
                _id: currentusername,
            }}
        />
    );
};

export default ChatDetailScreen;
