import React, { useState, useEffect } from 'react';
import { View, Image, ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';


const DetailPage = ({ route }) => {
    const ipv4 = process.env.IPV4;
    const { item, id } = route.params;
    const [longContent, setLongContent] = useState('');
    const [userName, setUserName] = useState('');
    const [title, setTitle] = useState('');
    const [showimage, setshowImage] = useState('');
    const [createtime, setcreatetime] = useState('');
    const [region, setRegion] = useState('');
    const [userNameFrom, setUserNameFrom] = useState('');

    // const [access, setAccess] = useState(false);
    const navigation = useNavigation();

    const handleAvatarPress = async () => {
        const converResponse = await fetch(`http://${ipv4}/conversation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ fromUserName: userNameFrom, toUserName: userName })
        });
        const convId = await converResponse.json();

        navigation.navigate('ChatGroup', { screen: 'ChatDetailScreen', params: { conversationId: convId } });

    };

    useEffect(() => {
        const authorizeThenFetch = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const email = await AsyncStorage.getItem('username');
                console.log(token, email);
                setUserNameFrom(email)
                const response = await fetch(`http://${ipv4}/validation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, token })
                });
                const data = await response.json();
                console.log(data);

                if (data.success) {
                    const dataResponse = await fetch(`http://${ipv4}/story`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ mode: "read", id })
                    });
                    const data = await dataResponse.json();
                    console.log("safdsssssssssssssss", data);
                    let emailtemp = data[0].email;
                    setTitle(data[0].storytitle);
                    setLongContent(data[0].story);
                    setUserName(data[0].email);
                    setshowImage(data[0].ImageUrl);
                    setcreatetime(data[0].createdat.split('T')[0]);
                    const profileResponse = await fetch(`http://${ipv4}/profile`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ emailtemp })
                    });

                    const profiledata = await profileResponse.json();
                    setRegion(profiledata[0].region);


                } else {
                    // Handle authorizeThenFetch  error (e.g., display a message)
                    console.log("authorizeThenFetch  failed");
                }
            } catch (error) {
                console.error('Error auth:', error);
            }
        };

        authorizeThenFetch();

    }, [id]);

    return (
        <ScrollView style={styles.container}>
            <View style={styles.imageSection}>
                {showimage && (
                    <Image
                        source={{ uri: showimage }}
                        style={styles.image}
                    />
                )}
            </View>

            <View style={styles.contentSection}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.longContent}>{longContent}</Text>
                <TouchableOpacity style={styles.userInfoSection} onPress={handleAvatarPress}>
                    <Image
                        source={require('../assets/images/lux.jpg')}
                        style={styles.userAvatar}
                    />
                    <View style={styles.userInfo}>
                        <Text style={styles.userName}>{userName}</Text>
                        <View style={styles.metaInfo}>
                            <Text style={styles.region}>{region}</Text>
                            <Text style={styles.date}>{createtime}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // padding: 15,
        backgroundColor: '#F5F5F5',
    },
    imageSection: {
        minHeight: 100,
        overflow: 'hidden',
        alignItems: 'center',
        // marginBottom: 20,
    },
    image: {
        width: '100%',
        height: 'auto',
        minHeight: 300,
        resizeMode: 'cover',
        // borderRadius: 10,
    },
    contentSection: {
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2, // Android shadow
    },
    userInfoSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 20,
    },
    userInfo: {
        flex: 1, // Occupy remaining space
    },
    metaInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    title: {
        fontSize: 25,
        color: '#555',
    },
    longContent: {
        fontSize: 18,
        color: '#555',
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        // marginBottom: 5,
        color: '#333',
        width: '100%', // Adjust as needed
    },
    region: {
        width: '33%',
        fontSize: 16,
        color: '#777',
    },
    date: {
        width: '33%',
        fontSize: 16,
        color: '#777',
    }, userAvatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 10,
    },
});
export default DetailPage;