import React, { useState, useEffect } from 'react';
import { RefreshControl, View, FlatList, Image, Text, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';


const ipv4 = process.env.IPV4;

const ChatScreen = () => {
    const navigation = useNavigation();
    const [chatList, setChatList] = useState([]);
    const [currentUserName, setCurrentUserName] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        setLoading(true);
        const fetchConversations = async () => {
            try {
                let username2 = await AsyncStorage.getItem('username');
                console.log("username2", username2);
                if (!username2) {
                    setErrorMessage("Username not found in storage. Please log in first.");
                    return;
                }
                setCurrentUserName(username2)
                let response = await fetch(`http://${ipv4}/conversations/${username2}`);
                let conversationsTemp = await response.json();
                console.log("conversationsTemp", conversationsTemp);
                // let conversationsUsed = conversationsTemp[0]
                // console.log("sadsdasdadsada", conversationsUsed, conversationsUsed._id, "hihi");

                let enrichedConversations = await Promise.all(conversationsTemp.map(async (conversation) => {
                    let otherUserName = conversation.participants.find(p => p !== username2);
                    let profileResponse = await fetch(`http://${ipv4}/profile`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: otherUserName })
                    });
                    let profile = await profileResponse.json();
                    console.log("conversation", conversation._id);
                    let messagesResponse = await fetch(`http://${ipv4}/messages/${conversation._id}/last`);
                    let lastMessage = await messagesResponse.json();

                    return {
                        ...conversation,
                        otherUser: profile[0],
                        lastMessage: lastMessage.text
                    };
                }));
                console.log("enrichedConversations", enrichedConversations);
                setChatList(enrichedConversations);
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
            }
            setLoading(false);

        };

        fetchConversations();

    }, [currentUserName]);


    const handlePressConversation = (conversationId, otherusername, currentusername) => {
        console.log("otherusername", otherusername, currentusername);
        navigation.navigate('ChatDetailScreen', { conversationId, otherusername, currentusername });
    };

    const renderItem = ({ item }) => (
        <Swipeable
            renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item._id)}>
            <TouchableOpacity
                style={styles.conversationItem}
                onPress={() => handlePressConversation(item._id, item.otherUser.email, currentUserName)}
            >
                <Image style={styles.avatar} source={{ uri: item.otherUser.imageurl }} />
                <View style={styles.textContainer}>
                    <Text style={styles.username}>{item.otherUser.email}</Text>
                    <Text style={styles.lastMessage}>{item.lastMessage || 'No messages yet'}</Text>
                </View>
                {item.unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                        <Text style={styles.unreadText}>{item.unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>
        </Swipeable>
    );

    const handleDeleteConversation = async (conversationId) => {

        try {
            await fetch(`http://${ipv4}/deleteConversation/${conversationId}`, {
                method: 'DELETE',
            });
            setChatList(chatList.filter(item => item._id !== conversationId));
        } catch (error) {
            console.error('Failed to delete conversation:', error);
        }
    };

    const renderRightActions = (progress, dragX, conversationId) => {
        const scale = dragX.interpolate({
            inputRange: [-80, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        return (
            <TouchableOpacity onPress={() => handleDeleteConversation(conversationId)}>
                <View style={styles.deleteBox}>
                    <Animated.Text style={[styles.deleteText, { transform: [{ scale }] }]}>
                        Delete
                    </Animated.Text>
                </View>
            </TouchableOpacity>
        );
    };
    const renderHeader = () => {
        return (
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>Chat List Header</Text>
            </View>
        );
    };

    const renderFooter = () => {
        return (
            <View style={styles.footerContainer}>
                <Text style={styles.footerText}>End of Chat List</Text>
            </View>
        );
    };
    const onRefresh = async () => {
        console.log('Refreshing...');
        setRefreshing(true);

        setTimeout(() => {
            setRefreshing(false);
            console.log('Refreshed!');
        }, 2000);
    };

    return (
        <View style={styles.container} >
            {errorMessage ? (
                <Text style={styles.errorText}>{errorMessage}</Text>
            ) : loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                // <FlatList
                //     data={chatList}
                //     renderItem={renderItem}
                //     keyExtractor={(item) => item._id.toString()}
                // />
                // <ScrollView scrollEnabled={false}>
                //     <FlatList
                //         data={chatList}
                //         renderItem={renderItem}
                //         keyExtractor={(item) => item._id.toString()}
                //     />
                // </ScrollView>
                <FlatList
                    data={chatList}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id.toString()}
                    ListHeaderComponent={renderHeader}
                    ListFooterComponent={renderFooter}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }
                />
            )}
        </View>
    );

};

const styles = StyleSheet.create({
    headerContainer: {
        padding: 10,
        backgroundColor: '#f0f0f0'
    },
    headerText: {
        fontSize: 16,
        color: '#000'
    },
    footerContainer: {
        padding: 10,
        backgroundColor: '#f0f0f0'
    },
    footerText: {
        fontSize: 16,
        color: '#000'
    },
    deleteBox: {
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
    deleteText: {
        color: 'white',
        fontWeight: 'bold',
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    conversationItem: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderColor: '#e0e0e0',
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
    textContainer: {
        flex: 1,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    lastMessage: {
        fontSize: 14,
        color: 'grey',
    },
    unreadBadge: {
        backgroundColor: 'red',
        borderRadius: 15,
        width: 25,
        height: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    unreadText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default ChatScreen;
