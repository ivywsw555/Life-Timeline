import React, { useState, useEffect } from 'react';
import { View, Image, TouchableOpacity, StyleSheet, FlatList, Text, TextInput, Button, Dimensions, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const images = {
    drink: require('../assets/images/discover_icon/drinks.jpg'),
    art: require('../assets/images/discover_icon/arts.jpg'),
    plant: require('../assets/images/discover_icon/plants.jpg'),
    animal: require('../assets/images/discover_icon/animals.jpg'),
    sport: require('../assets/images/discover_icon/sports.jpg'),
    job: require('../assets/images/discover_icon/jobs.jpg'),
};

const CategoryScreen = () => {
    const ipv4 = process.env.IPV4;
    const navigation = useNavigation();

    const [items, setItems] = useState([]);
    const [newDream, setNewDream] = useState('');
    const [dreams, setDreams] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            const categoriesResponse = await fetch(`http://${ipv4}/categories`);
            const categoriesData = await categoriesResponse.json();
            const dreamsResponse = await fetch(`http://${ipv4}/dreams`);
            const dreamsData = await dreamsResponse.json();
            const adjustedCategories = adjustCategoriesForGridLayout(categoriesData);
            // console.log("dreamsData1", dreamsData);
            setDreams(dreamsData);

            console.log("dreamsDatadreams", dreams);
            const combinedData = [
                ...adjustedCategories,
                { title: 'Life Dream List', type: 'header' },
                ...dreamsData.map(dream => ({ ...dream, type: 'dream', _id: dream._id.toString() }))
            ];
            setItems(combinedData);

        } catch (error) {
            console.error('Failed to fetch data:', error);
        }
    };

    const adjustCategoriesForGridLayout = (categories) => {
        const numColumns = 3;
        const numRowsComplete = Math.floor(categories.length / numColumns);
        const numItemsLastRow = categories.length - numRowsComplete * numColumns;
        const placeholdersNeeded = numItemsLastRow > 0 ? numColumns - numItemsLastRow : 0;

        return [
            ...categories.map(cat => ({ ...cat, type: 'category' })),
            ...Array(placeholdersNeeded).fill({ type: 'placeholder' })
        ];
    };

    const addDream = async () => {
        if (newDream) {
            try {
                const response = await fetch(`http://${ipv4}/addDream`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ dream: newDream })
                });
                const addedDream = await response.json();
                setDreams([...dreams, addedDream]);
                setNewDream('');
            } catch (error) {
                console.error('Failed to add dream:', error);
            }
        }
    };

    const deleteDream = async (id) => {
        try {
            await fetch(`http://${ipv4}/deleteDream/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            setDreams(dreams.filter(dream => dream._id !== id));
        } catch (error) {
            console.error('Failed to delete dream:', error);
        }
    };

    const renderItem = ({ item }) => {
        if (item.type === 'category') {
            const imageSource = images[item.name.toLowerCase()] || images['default'];

            return (
                <TouchableOpacity
                    style={styles.categoryItem}
                    onPress={() => navigation.navigate('CategoryDetailsScreen', { categoryName: item.name })}
                >
                    <Image source={imageSource} style={styles.categoryIcon} />
                    <Text style={styles.categoryText}>{item.name}</Text>
                </TouchableOpacity>
            );
        } else if (item.type === 'dream') {
            return (
                <View style={styles.dreamItem}>
                    <Text style={styles.dreamText}>{item.dream}</Text>
                    <Button title="Delete" onPress={() => deleteDream(item._id)} />
                </View>
            );
        } else if (item.type === 'header') {
            return <Text style={styles.header}>{item.title}</Text>;
        } else if (item.type === 'placeholder') {
            return <View style={styles.categoryItem} />; // Empty placeholder
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>"Discover the World"</Text>
            <FlatList
                data={items}
                renderItem={renderItem}
                keyExtractor={(item, index) => item._id || String(index)}
                numColumns={3}
            />
            <TextInput
                style={styles.input}
                value={newDream}
                onChangeText={setNewDream}
                placeholder="Add new dream"
            />
            <Button title="Add Dream" onPress={addDream} />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        backgroundColor: '#fff'
    },
    categoryItem: {
        margin: 0,
        width: (width - 30) / 3,
        height: 150,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderRadius: 0,
        elevation: 3
    },
    categoryIcon: {
        width: (width - 30) / 3 - 5,
        height: (width - 30) / 3 - 5,
        borderRadius: 10,
    },
    categoryText: {
        marginTop: 5,
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center'
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        paddingVertical: 10,
        width: '100%'
    },
    dreamItem: {
        // backgroundColor: '#f9f9f9',
        borderRadius: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        width: '100%'
    },
    dreamText: {
        fontSize: 18
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginVertical: 10,
        width: '100%'
    }
});

export default CategoryScreen;
