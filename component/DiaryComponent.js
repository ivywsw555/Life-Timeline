import React, { useState } from 'react';
import { View, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import EmotionWheel from './EmotionWheel';  // Ensure EmotionWheel is correctly imported

const DiaryComponent = () => {
    const [diaryEntries, setDiaryEntries] = useState([]);
    const [emotion, setEmotion] = useState('');
    const [story, setStory] = useState('');
    const [date, setDate] = useState('');
    const [title, setTitle] = useState('');
    const [isPickerVisible, setPickerVisible] = useState(false);

    const addDiaryEntry = () => {
        const newEntry = { id: Date.now().toString(), date, title, emotion, story };
        setDiaryEntries([...diaryEntries, newEntry]);
        setDate('');
        setTitle('');
        setEmotion('');
        setStory('');
    };

    const togglePicker = () => {
        console.log('Toggling picker visibility:', !isPickerVisible); // Debugging log
        setPickerVisible(!isPickerVisible);
    };

    const renderDiaryEntry = ({ item }) => (
        <View style={styles.diaryEntry}>
            <Text>Date: {item.date}</Text>
            <Text>Title: {item.title}</Text>
            <Text>Emotion: {item.emotion}</Text>
            <Text>Story: {item.story}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <TextInput
                placeholder="Date"
                value={date}
                onChangeText={setDate}
                style={styles.input}
            />
            <View style={styles.emotionInputContainer}>
                <TextInput
                    placeholder="Emotion"
                    value={emotion}
                    editable={false}
                    style={styles.input}
                />
                <TouchableOpacity onPress={togglePicker}>
                    <Icon name="smile" size={24} color="black" />
                </TouchableOpacity>
            </View>
            <TextInput
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
                style={styles.input}
            />
            <TextInput
                placeholder="Story"
                value={story}
                onChangeText={setStory}
                style={[styles.input, { height: 100 }]}
                multiline
            />
            <Button title="Add Entry" onPress={addDiaryEntry} />
            <FlatList
                data={diaryEntries}
                renderItem={renderDiaryEntry}
                keyExtractor={(item) => item.id}
            />
            <EmotionWheel isVisible={isPickerVisible} setVisibility={setPickerVisible} setEmotion={setEmotion} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    input: {
        // width: "100%",
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        flex: 1,
        borderRadius: 10
    },
    emotionInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    diaryEntry: {
        margin: 10,
        padding: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
});

export default DiaryComponent;
