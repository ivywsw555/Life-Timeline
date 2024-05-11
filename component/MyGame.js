import React, { useState, useEffect, useRef } from 'react';
import { View, Image, TouchableOpacity, ScrollView, FlatList, StyleSheet, Dimensions, Text } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import DetailPage from './DetailPage';
// import { LazyLoadImage } from 'react-lazy-load-image-component';
// import { v4 as uuidv } from 'uuid';

import { IPV4 } from '@env';

const ipv4 = process.env.IPV4;

let flagggg = 0;
let num = 0;

const MyGame = () => {
    // const scrollRef = useRef(null);

    const [leftColumnImages, setLeftColumnImages] = useState([]);
    const [rightColumnImages, setRightColumnImages] = useState([]);
    const [fetchedImages, setFetchedImages] = useState([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [columnImagesss, setColumnImagesss] = useState([]);
    const [descriptions, setDescriptions] = useState({});
    const initialImageSize = 10;

    const newWidth = Dimensions.get('window').width / 2 - 4; // Adjusted for margin

    const fetchDescriptions = async () => {
        const newDescriptions = {};
        await Promise.all(columnImagesss.map(async (image) => {
            newDescriptions[image.id] = await fetchDescriptionById(image.id);
        }));
        setDescriptions(newDescriptions);
    };

    const fetchStory = async () => {
        setIsLoadingMore(false);

        try {
            const storyResponse = await fetch(`http://${ipv4}/story?page=${page}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },

            });
            const storyData = await storyResponse.json();
            // console.log("Old story data:", storyData);
            if (storyData.every(img => img.ImageUrl)) {
                const imagesWithIds = storyData.map((img, index) => ({
                    ImageUrl: img.ImageUrl, id: img._id.toString()
                }));
                // console.log("first11111111111", JSON.stringify(imagesWithIds, null, 2));
                setFetchedImages(imagesWithIds);
                setPage(page + 1);
                fetchDescriptions(storyData);
            } else {
                console.error("storyData[0] is not a valid array of image objects");
            }

        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchMoreStories = async () => {
        setIsLoadingMore(false);

        try {
            const storyResponse = await fetch(`http://${ipv4}/story?page=${page + 1}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });

            const storyData = await storyResponse.json();
            // console.log("New story data:", storyData);
            if (storyData.length > 0) {
                const imagesWithIdsfirst = storyData.map((img, index) => ({
                    ImageUrl: img.ImageUrl,
                    id: img._id.toString(),
                }));
                console.log("fetchMoreStories actually running", imagesWithIdsfirst.length);

                // setFetchedImages(fetchedImages => [...fetchedImages, ...imagesWithIdsfirst]);
                setFetchedImages(prevImages => {
                    const updatedImages = [...prevImages, ...imagesWithIdsfirst];
                    // distributeImages(updatedImages);
                    return updatedImages;
                })
                setPage(page + 1);
            }
        } catch (error) {
            console.error('Error fetching more stories:', error);
        } finally {
            setIsLoadingMore(true);
        }
    };

    const handleScroll = async (event) => {
        const layoutHeight = event.nativeEvent.layoutMeasurement.height;
        const contentHeight = event.nativeEvent.contentSize.height;
        const offset = event.nativeEvent.contentOffset.y;
        // console.log("Didnot fetchMoreStories", layoutHeight, contentHeight, offset, isLoadingMore, layoutHeight + offset, contentHeight);

        if (layoutHeight + offset >= (contentHeight - 1) && !isLoadingMore) {
            if (!isOnCooldown) {
                startCooldown();
                // console.log("fetchMoreStories", layoutHeight, contentHeight, offset, isLoadingMore);
                await fetchMoreStories();
            } else {
                console.log("cooldown");
            }

            setIsLoadingMore(false);
        }
    };
    let isOnCooldown = false;
    const cooldownDuration = 5000;
    let lastFetchTime = 0;

    async function startCooldown() {
        isOnCooldown = true;
        lastFetchTime = Date.now();

        setTimeout(() => {
            isOnCooldown = false;
        }, cooldownDuration);
    }
    useEffect(() => {

        const fetchAndDistribute = async () => {
            if (flagggg === 0) {
                flagggg += 1;
                await fetchStory();
            }
        };
        fetchAndDistribute();

    }, [page]);

    const distributeImages = (images) => {
        // console.log("distributeImages recuring num", num)
        const leftCol = [];
        const rightCol = [];

        images.forEach((img, index) => {
            if (index % 2 === 0) {
                leftCol.push(img);
            } else {
                rightCol.push(img);
            }
        });
        num += 1;
        setLeftColumnImages(leftCol);
        setRightColumnImages(rightCol);
    };

    useEffect(() => {

        const onTime = async () => {
            const updatedImages = fetchedImages.map(img => ({ ...img, width: newWidth, height: newWidth }));
            // console.log("fetchedImages triggered", updatedImages.length);

            const imageSizePromises = updatedImages.map((img, index) => {
                return new Promise((resolve, reject) => {
                    if (img.ImageUrl) {
                        Image.getSize(img.ImageUrl, (width, height) => {
                            const aspectRatio = height / width;
                            const newHeight = newWidth * aspectRatio;
                            const modifiedImage = {
                                ...img,
                                height: newHeight,
                            };
                            resolve(modifiedImage);
                        }, (error) => {
                            console.error(`Could not get size for image ${index}: ${error.message}`);
                            reject(error);
                        });
                    } else {
                        resolve(img);
                    }
                });
            });

            try {
                const modifiedImages = await Promise.all(imageSizePromises);
                setColumnImagesss(modifiedImages);
                distributeImages(modifiedImages);
            } catch (error) {
                console.error('Error getting image sizes:', error);
            }
        };

        onTime();
    }, [fetchedImages])

    const navigation = useNavigation();

    const navigateToDetail = (item, id) => {
        console.log(item, id);
        navigation.navigate('DetailPage', { item, id });
    };

    const fetchDescriptionById = async (id) => {
        try {
            const response = await fetch(`http://${IPV4}/story`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ mode: "read", id })
            });;
            const data = await response.json();
            // console.log("kkkkkkkkkkkkkkkk", data);
            return data[0].storytitle;
        } catch (error) {
            console.error('Failed to fetch description', error);
            return 'No description available';
        }
    };
    useEffect((columnImagesss) => {
        console.log("columnImagesss", columnImagesss);
        fetchDescriptions();
    }, [columnImagesss]);

    const renderColumn = (columnImages) => (
        <View>
            {columnImages.map((item, index) => (

                <TouchableOpacity key={item.id} onPress={() => { console.log('Image clicked', item.id); navigateToDetail(item, item.id) }}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={{ uri: item.ImageUrl }}
                            style={[styles.image, { width: item.width, height: item.height }]}
                        />
                        <Text style={styles.imageText}>{descriptions[item.id] || 'Loading...'}</Text>
                    </View>
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <ScrollView onScroll={handleScroll} scrollEventThrottle={16} >
            <View style={styles.container}>
                {renderColumn(leftColumnImages)}
                {renderColumn(rightColumnImages)}
            </View>
            {isLoadingMore && <Text style={{ textAlign: 'center' }}>Loading...</Text>}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        // color: "black",
        flexDirection: 'row',
        justifyContent: 'space-between',

    },
    image: {
        borderRadius: 0,
        margin: 0,
        width: '100%',
    },
    imageContainer: {
        margin: 2,
        borderRadius: 5,
        overflow: 'hidden',
        backgroundColor: 'white',
    },

    imageText: {
        textAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        color: 'black',
        padding: 5,
        // height: 50,
    },
});

export default MyGame;