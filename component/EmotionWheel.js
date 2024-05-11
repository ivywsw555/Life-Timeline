import React, { useRef } from 'react';
import { View, Modal, Animated, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';

const EmotionWheel = ({ isVisible, setVisibility, setEmotion }) => {
    const wheelAngle = useRef(new Animated.Value(0)).current;

    const spinWheel = () => {
        // Additional implementation needed for actual spinning
    };

    const handleSelectEmotion = () => {
        setEmotion("Happy"); // Placeholder
        setVisibility(false);
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={isVisible}
            onRequestClose={() => setVisibility(false)}
        >
            <View style={styles.centeredView}>
                <View style={styles.modalView}>
                    <Animated.Image
                        source={require('../assets/images/Emotions_wheel-removebg-preview.png')} // Correct path needed
                        style={[styles.wheel, { transform: [{ rotate: '0deg' }] }]}
                    />
                    <TouchableOpacity style={styles.button} onPress={handleSelectEmotion}>
                        <Text style={styles.buttonText}>Select Emotion</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    wheel: {
        width: 300,
        height: 300,
    },
    button: {
        borderRadius: 20,
        padding: 10,
        elevation: 2,
        marginTop: 15,
        backgroundColor: '#2196F3',
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
        textAlign: "center"
    },
});

export default EmotionWheel;
