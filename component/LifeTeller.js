import React, { useState, useLayoutEffect } from 'react';
import {
    View, TextInput, TouchableOpacity, Text, StyleSheet, Alert, Keyboard, TouchableWithoutFeedback
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LifeTeller = ({ route, navigation }) => {
    const { storyTitle, storyContent, onUpdate } = route.params;
    const [localTitle, setLocalTitle] = useState(storyTitle);
    const [localContent, setLocalContent] = useState(storyContent);
    const ipv4 = process.env.IPV4;

    const handleSave = async () => {
        let email = await AsyncStorage.getItem('username');
        let access = true; // You might want to implement a real check for access permissions

        if (access) {
            try {
                const response = await fetch(`http://${ipv4}/story`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, mode: "write", story: localContent, storyTitle: localTitle })
                });
                const data = await response.json();

                if (response.ok) {
                    s
                    Alert.alert("Success", "Story saved successfully");
                    onUpdate(localTitle, localContent); // This updates the parent state

                    console.log(data);
                    navigation.goBack();
                } else {
                    throw new Error(data.message || "An error occurred while saving the story");
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                Alert.alert("Error", error.message || "Failed to save the story");
            }
        } else {
            Alert.alert("Access Denied", "You do not have permission to perform this action");
            return "404 NOT FOUND";
        }
    };
    useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={() => {
                    Keyboard.dismiss();
                    // navigation.goBack(); 
                }}>
                    <Text style={{ color: 'blue', marginRight: 10, fontSize: 16 }}>Done</Text>
                </TouchableOpacity>
            ),
        });
    }, [navigation]);
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.container}>
                <TextInput
                    style={styles.titleInput}
                    value={localTitle}
                    onChangeText={setLocalTitle}
                    placeholder="Edit your title here..."
                />
                <TextInput
                    style={styles.storyInput}
                    multiline
                    value={localContent}
                    onChangeText={setLocalContent}
                    placeholder="Edit your story here..."
                />
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                </TouchableOpacity>
            </View>
        </TouchableWithoutFeedback>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff',
    },
    titleInput: {
        fontSize: 20,
        marginBottom: 10,
    },
    storyInput: {
        flex: 1,
        textAlignVertical: 'top',
        fontSize: 18,
        marginBottom: 10,
    },
    saveButton: {
        padding: 10,
        backgroundColor: 'blue',
        alignItems: 'center',
    },
    saveButtonText: {
        color: 'white',
        fontSize: 18,
    },
});

export default LifeTeller;
