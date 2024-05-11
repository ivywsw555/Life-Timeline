import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';



const BioComponent = () => {

    const ipv4 = process.env.IPV4;
    const [storyContent, setStoryContent] = useState('');
    const [storyTitle, setStoryTitle] = useState('');

    const [access, setAccess] = useState(false);
    const [isOpen, setIsOpen] = useState(false);  // State to manage the dropdown

    const handleSaveStory = async () => {
        let email = await AsyncStorage.getItem('username');

        if (access) {
            try {
                const response = await fetch(`http://${ipv4}/story`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, mode: "write", story, storyTitle })
                });
                const data = await response.json();

                console.log(data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        } else {
            return "404 NOT FOUND";
        } console.log('Saved Story:', story, storyTitle);
    };



    // const logAllAsyncStorage = async () => {
    //     try {
    //         const keys = await AsyncStorage.getAllKeys();
    //         for (const key of keys) {
    //             const value = await AsyncStorage.getItem(key);
    //             console.log(key, value);
    //         }
    //     } catch (error) {
    //         console.error('Error retrieving data:', error);
    //     }
    // };


    useEffect(() => {

        const fetchStoryData = async () => {
            try {
                const email = await AsyncStorage.getItem('username');
                const token = await AsyncStorage.getItem('userToken');
                const validationResponse = await fetch(`http://${ipv4}/validation`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, token })
                });
                const validationData = await validationResponse.json();
                setAccess(validationData.success);
                console.log(validationData, token);

                if (access) {
                    const storyResponse = await fetch(`http://${ipv4}/story`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email, mode: "read" })
                    });
                    const storyData = await storyResponse.json();
                    setStoryContent(storyData[0].story);
                    setStoryTitle(storyData[0].storyTitle);
                    console.log(storyData[0].storyTitle);
                } else {
                    console.log("Bio Not authorized to fetch story");
                }
            } catch (error) {
                s
                console.error('Error:', error);
            }
        };

        fetchStoryData();
    }, [access,]);
    const navigation = useNavigation();

    return (
        // <View style={styles.container}>
        //     <View style={styles.background}></View>
        //     <View style={styles.content}>
        //         <Text style={styles.title}>Write Your Own Life</Text>

        //         <TextInput
        //             placeholder="Start typing your title..."
        //             placeholderTextColor="#FFF"
        //             style={styles.titleinput}
        //             value={storyTitle}
        //             onChangeText={(text) => setStoryTitle(text)}
        //         />
        //         <TextInput
        //             multiline
        //             placeholder="Start typing your story..."
        //             placeholderTextColor="#FFF"
        //             style={styles.input}
        //             value={storycontent}
        //             onChangeText={(text) => setStorycontent(text)}
        //         />
        //         <TouchableOpacity style={styles.saveButton} onPress={handleSaveStory}>
        //             <Text style={styles.saveButtonText}>Save Story</Text>
        //         </TouchableOpacity>
        //     </View>
        // </View>

        <View style={styles.container}>
            <View style={styles.background}></View>
            <TouchableOpacity onPress={() => setIsOpen(!isOpen)} style={styles.dropdownToggle}>
                <Text style={styles.dropdownToggleText}>{isOpen ? 'Hide Story' : 'Show Story'}</Text>
            </TouchableOpacity>
            {isOpen && (
                <View style={styles.content}>
                    <Text style={styles.storyTitle}>{storyTitle}</Text>
                    <Text style={styles.storyText}>{storyContent}</Text>
                    <TouchableOpacity
                        style={styles.editButton}
                        onPress={() => navigation.navigate('LifeTeller', {
                            storyTitle, storyContent, onUpdate: (newTitle, newContent) => {
                                setStoryTitle(newTitle);
                                setStoryContent(newContent);
                            }
                        })}
                    >
                        <Text style={styles.editButtonText}>Edit Story</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    background: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,

    },
    content: {
        width: '100%',
        padding: 20,
        borderRadius: 10,
        // backgroundColor: 'rgba(255, 255, 255, 0.8)',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: '#333',
    },
    input: {
        width: '100%',
        height: 150,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        color: '#333',
    },
    titleInput: {
        width: '100%',
        height: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        borderRadius: 8,
        padding: 10,
        marginBottom: 20,
        color: '#333',
    },
    saveButton: {
        backgroundColor: '#FF1493',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    saveButtonText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 16,
    },
    dropdownToggleText: {
        height: 50,
        fontSize: 24,

    }
});

export default BioComponent;
