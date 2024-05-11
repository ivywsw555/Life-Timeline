import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Checkbox from 'expo-checkbox';


const CategoryDetailsScreen = ({ route }) => {
    const { categoryName } = route.params;
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await fetch(`http://${process.env.IPV4}/events/${categoryName}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const dataEvents = await response.json();
                const eventsWithChecked = dataEvents.map(event => ({
                    ...event,
                    isChecked: false
                }));
                setEvents(eventsWithChecked);
            } catch (error) {
                console.error(`Failed to fetch events for ${categoryName}:`, error);
            }
        };
        fetchEvents();
    }, [categoryName]);

    const toggleCheckbox = (index) => {
        const updatedEvents = [...events];
        updatedEvents[index].isChecked = !updatedEvents[index].isChecked;
        setEvents(updatedEvents);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>{categoryName}</Text>
            <FlatList
                data={events}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={styles.itemContainer}>
                        <Checkbox
                            value={item.isChecked}
                            onValueChange={newValue => toggleCheckbox(index)}
                            color={item.isChecked ? '#4630EB' : undefined}
                        />
                        <Text style={styles.itemText}>{item.name}</Text>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff'
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 10
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10
    },
    itemText: {
        fontSize: 18,
        marginLeft: 10
    }
});

export default CategoryDetailsScreen;