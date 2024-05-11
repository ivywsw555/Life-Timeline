import React, { useCallback, useState, useEffect } from 'react';
import { RefreshControl, Alert, View, Text, TextInput, Button, TouchableOpacity, StyleSheet, ScrollView, Image, Dimensions, Modal } from 'react-native';
// import { GoogleLogin, googleLogout, useGoogleLogin } from '@react-oauth/google';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from 'axios';
// import SecureStorage from 'react-native-secure-storage';
import Icon from 'react-native-vector-icons/FontAwesome'; // Import Icon component
import DiaryComponent from './DiaryComponent';
import BioComponent from './BioComponent';

// import ImagePicker from 'react-native-image-picker';
import * as ImagePicker from 'expo-image-picker';
import { IPV4 } from '@env';

const ipv4 = process.env.IPV4;
const screenWidth = Dimensions.get('window').width;

async function storeToken(token) {
    console.log(token);
    let email = await AsyncStorage.getItem('username');
    console.log("ddddddddddddd", email);
    const response = await fetch(`http://${ipv4}/storetoken`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, token })
    });
    const dataha = await response.json();
    console.log("dfiohsdpofpf", dataha);
    await AsyncStorage.setItem('userToken', dataha.token);
}

const ProfileInfo = ({ username, avatarUri, diaryEntries, bioEntries, onSignOut }) => {
    // const [story, setStory] = useState('');
    const [isEditing, setEditing] = useState(false);
    const [editedGender, setEditedGender] = useState('');
    const [editedRegion, setEditedRegion] = useState('');


    const [imageUri, setImageUri] = useState(null);
    const [details, setDetails] = useState([]);
    const [access, setAccess] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleStoryChange = (newStory) => {
        setStory(newStory);
    };
    const pickImage = async () => {

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
        });

        if (!result.canceled) {
            setImageUri(result.uri);
        }
    };
    const uploadImage = async () => {

        if (!imageUri) {
            alert('Please select an image first.'); // User feedback
            return;
        }

        const formData = new FormData();
        formData.append('image', {
            uri: imageUri,
            type: 'image/jpeg',
            name: 'user_avatar.jpg'
        });

        try {
            const response = await fetch(`http://${ipv4}/uploadAvatar`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.ok) {
                // Handle successful upload on the backend (update user data)
                console.log('Image uploaded successfully');
            } else {
                throw new Error('Image upload failed');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };
    const handleSave = async () => {
        const email = await AsyncStorage.getItem('username');
        console.log(editedGender, editedRegion);
        try {
            const response = await fetch(`http://${ipv4}/createProfile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, username, gender: editedGender, region: editedRegion })

            });

            if (response.ok) {
                console.log('uploaded successfully');
            } else {
                throw new Error('upload failed');
            }

            await fetchProfileData();

            setEditing(false);

        } catch (error) {
            console.error('Error upload:', error);
        }
    };
    const handleEdit = () => {
        setEditing(true);
        setEditedGender(details.gender);
        setEditedRegion(details.region);
    };
    const handleCancel = () => {
        setEditing(false);
    };
    const fetchProfileData = async () => {
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
                const profileResponse = await fetch(`http://${ipv4}/profile`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email })
                });
                const profileData = await profileResponse.json();
                setDetails(profileData[0]);
                // console.log(profileData[0]);
                console.log(details, "kkkkkkkkkkkk");
            } else {
                console.log("Not authorized to fetch story");
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };
    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            // Call your data fetching or state updating functions here
            await fetchProfileData();
        } catch (error) {
            console.error('Error refreshing the profile data:', error);
        }
        setRefreshing(false);
    }, [fetchProfileData]);

    useEffect(() => {
        fetchProfileData();
    }, [access]);

    return (
        <ScrollView contentContainerStyle={styles.contentContainer} refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }>
            <View style={styles.headerContainer}>
                <Image source={{ uri: avatarUri }} style={styles.avatar} />
                <TouchableOpacity onPress={pickImage}>
                    {imageUri ? (
                        <Image source={{ uri: imageUri }} style={styles.previewImage} />
                    ) : (
                        <Text style={styles.uploadText}>Upload Image</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity onPress={uploadImage}>
                    <Text style={styles.uploadButton}>Upload</Text>
                </TouchableOpacity>
                <Text style={styles.username}>{details.email}</Text>
                <Button style={styles.SignoutButton} title="Sign Out" onPress={onSignOut} />
            </View>

            <View style={styles.detailsContainer}>
                <Text style={styles.sectionTitle}>User Information</Text>
                <Text style={styles.detailsText}>Birthday:{details.birthday}</Text>
                <Text style={styles.detailsText}>Gender:{details.gender}</Text>
                <Text style={styles.detailsText}>Region:{details.region}</Text>

                <TouchableOpacity onPress={handleEdit}>
                    <Text style={styles.editButton}>Edit</Text>
                </TouchableOpacity>
            </View>
            <Modal visible={isEditing} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>Edit Information</Text>

                    <TextInput
                        style={styles.inputField}
                        placeholder="Gender"
                        value={editedGender}
                        onChangeText={(text) => setEditedGender(text)}
                    />

                    <TextInput
                        style={styles.inputField}
                        placeholder="Region"
                        value={editedRegion}
                        onChangeText={(text) => setEditedRegion(text)}
                    />

                    <View style={styles.modalButtonsContainer}>
                        <Button title="Save" onPress={handleSave} />
                        <Button title="Cancel" onPress={handleCancel} />
                    </View>
                </View>
            </Modal>
            <View style={styles.bioContainer}>
                <Text style={styles.sectionTitle}>Life Timeline</Text>
                <BioComponent onStoryChange={handleStoryChange} />

            </View>

            {/* <BioComponent onStoryChange={handleStoryChange} /> */}


            <View style={styles.diaryContainer}>
                <Text style={styles.sectionTitle}>Diary</Text>
                <DiaryComponent initialEntries={diaryEntries} />
            </View>
        </ScrollView>
    );
};

// const scopes = [
//     'https://www.googleapis.com/auth/calendar',
//     'https://www.googleapis.com/auth/calendar.events',
//     'https://www.googleapis.com/auth/userinfo.profile',
//     'https://www.googleapis.com/auth/userinfo.email',
// ];
// const scope = scopes.join(' ');
// // const { signIn } = useGoogleLogin({
// //     onSuccess: async (codeResponse) => await handleGSubmit(codeResponse),
// //     scope: scope, 
// //     discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
// //     onError: (error) => console.log('Login Failed:', error)
// // });

const OtherScreen = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
        setTimeout(() => setPasswordVisible(false), 5000);
    };

    const handleSignIn = async (username, password) => {
        try {
            let email = username;
            console.log("sign in attempt", email, IPV4, `http://${IPV4}/login`);
            // const response = await fetch(`http://${IPV4}/login`, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     },
            //     body: JSON.stringify({ email, password })
            // });
            const response = await fetch(`http://${IPV4}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            console.log(data);
            if (!data.success) {
                if (response.status === 401) {
                    throw new Error('Login failed: Incorrect username or password');
                } else {
                    throw new Error(data.message || 'An unknown error occurred');
                }
            }

            await AsyncStorage.setItem('username', email);
            await AsyncStorage.setItem('userToken', data.token);

            await storeToken(data.token);
            // console.log({ email });
            setUser({
                email: email,
                username: 'Username',
                avatarUri: "https://c-ssl.dtstatic.com/uploads/blog/202207/04/20220704012910_10c36.thumb.1000_0.jpg",
                details: 'User details',
                diaryEntries: [],
                bioEntries: [],
            });
            // redirectToDoittogrther(); 

        } catch (err) {
            console.log("hhhhhhhhhhhh", err);
            setError(err.message);
            // Alert.alert("Login Error", err.message);
        }
    };

    const handleRegister = async (username, password) => {
        try {
            let email = username;

            const response = await fetch(`http://${ipv4}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            if (!data.success) {
                if (response.status === 401) {
                    throw new Error('Signup failed: Incorrect username or password');
                } else {
                    throw new Error(data.message || 'An unknown error occurred');
                }
            }


            await AsyncStorage.setItem('username', email);

            await storeToken(data.token);

            // setUser({ email });
            setUser({
                email: email,
                username: 'Username',
                avatarUri: 'AvatarURI',
                details: 'User details',
                diaryEntries: []
            });
            // redirectToDoittogrther(); 

        } catch (err) {
            console.log("hhhssshhhhhhhhh", err);
            setError(err.message);
            // Alert.alert("Login Error", err.message);
        }
    };
    // const handleGoogleSignIn = useGoogleLogin({
    //     onSuccess: async (codeResponse) => {
    //         // setUser(codeResponse);
    //         await handleGSubmit(codeResponse);
    //     },
    //     scope: scope,
    //     discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest"],
    //     onError: (error) => console.log('Login Failed:', error)
    // });

    // const handleGSubmit = async (user) => {
    //     if (!user.access_token) {
    //         console.log("Access token is not available.");
    //         return;
    //     }

    //     try {
    //         const userInfoResponse = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
    //             headers: {
    //                 Authorization: `Bearer ${user.access_token}`,
    //                 Accept: 'application/json'
    //             }
    //         });
    //         const userInfo = userInfoResponse.data;

    //         AsyncStorage.setItem('profile', JSON.stringify(userInfo));
    //         AsyncStorage.setItem('logintype', "gmail");
    //         AsyncStorage.setItem('email', userInfo.email);
    //         await storeGToken(user.access_token);

    //         const calendarList = await fetchCalendarlist(user.access_token);
    //         let calid = processCalendarList(calendarList);

    //         if (!calid) {
    //             calid = await createoneCalendar(user.access_token);
    //         }

    //         await postCalendarIdToServer(calid, userInfo.email);
    //         // const whatttt = await getCalendarEvent(calid,user.access_token);
    //         // console.log(whatttt);
    //         redirectToDoittogrther();

    //     } catch (error) {
    //         console.error("Error in handleGSubmit: ", error);
    //     }
    // };

    // async function fetchCalendarlist(temp) {
    //     try {
    //         // let temp = localStorage.getItem("userToken");
    //         const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
    //             method: 'GET',
    //             headers: {
    //                 'Authorization': `Bearer ${temp}`,
    //                 'Content-Type': 'application/json'
    //             }
    //         });
    //         let databa = await response.json();
    //         // console.log(databa);
    //         return databa;
    //     } catch (error) {
    //         console.error('Error checking token:', error);
    //         return false;
    //     }
    // }
    const handleSignOut = async () => {
        await AsyncStorage.removeItem('profile');
        await AsyncStorage.removeItem('logintype');
        await AsyncStorage.removeItem('username');
        await AsyncStorage.removeItem('email');
        await AsyncStorage.removeItem('userToken');

        setUser(null);
        console.log("REMIOVED EVERYTHING");
    };

    const SignIn = ({ onRegister, onSignIn, onGoogleSignIn }) => {
        const [username, setUsername] = useState('');
        const [password, setPassword] = useState('');
        return (
            <View style={styles.signInContainer}>
                <TextInput
                    style={styles.input}
                    placeholder="Username"
                    value={username}
                    onChangeText={setUsername}
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.twoinput}
                        placeholder="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry={!passwordVisible}
                    />
                    <TouchableOpacity onPress={togglePasswordVisibility} style={styles.eyeIcon}>
                        <Icon name={passwordVisible ? "eye-slash" : "eye"} size={15} color="black" />
                    </TouchableOpacity>
                </View>
                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity onPress={() => onSignIn(username, password)} style={styles.signButton}>
                    <Text style={styles.signButtonText}>Sign In</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => onRegister(username, password)} style={styles.signButton}>
                    <Text style={styles.signButtonText}>Sign Up</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.googleButton} onPress={onGoogleSignIn}>
                    <Text style={styles.googleButtonText}>Log In with Google</Text>
                </TouchableOpacity>
            </View>
        );
    };

    useEffect(() => {
        const fetchCredentials = async () => {
            setLoading(true);
            try {
                const storedUsername = await AsyncStorage.getItem('username');
                const storedToken = await AsyncStorage.getItem('userToken');

                if (storedUsername && storedToken) {
                    console.log("Auto-login with stored credentials");
                    setUser({
                        username: storedUsername,
                        username: 'Username',
                        avatarUri: "https://c-ssl.dtstatic.com/uploads/blog/202207/04/20220704012910_10c36.thumb.1000_0.jpg",
                        details: 'User details',
                        diaryEntries: [],
                        bioEntries: [],
                    });

                } else {
                    console.log("No stored credentials found");
                }
            } catch (err) {
                setError('Failed to retrieve credentials');
                console.error(err);
            }
            setLoading(false);
        };

        fetchCredentials();
    }, []);
    return (
        <View style={styles.firstcontainer}>
            {user ? (
                <>
                    {console.log("User Data:", user)}

                    <ProfileInfo
                        username={user ? user.username : 'No username'}
                        avatarUri={user.avatarUri}
                        details={user.details}
                        diaryEntries={user.diaryEntries}
                        bioEntries={user.bioEntries}
                        onSignOut={handleSignOut}
                    />
                </>
            ) : (
                <SignIn
                    onSignIn={handleSignIn}
                    onRegister={handleRegister}
                // onGoogleSignIn={handleGoogleSignIn}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        marginBottom: 10,

    },
    twoinput: {
        flex: 1,
        padding: 8,
    },
    eyeIcon: {
        padding: 8,
    },
    errorText: {
        color: 'red',
        fontSize: 14,
        marginTop: 5,
        marginBottom: 5,
        textAlign: 'center',
    },
    // contentContainer: {
    //     alignItems: 'center',
    //     justifyContent: 'center',
    // // },
    // box: {
    //     width: 100,
    //     height: 100,
    //     backgroundColor: 'blue',
    //     margin: 10,
    // },
    firstcontainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F0F0',
    },
    signInContainer: {
        width: '80%',
        backgroundColor: '#FFFFFF',
        padding: 20,
        borderRadius: 10,
        shadowOpacity: 0.2,
        shadowRadius: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },


    contentContainer: {
        width: screenWidth,
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
    },
    headerContainer: {
        width: '100%',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 10,
        borderWidth: 3,
        borderColor: '#BDBDBD',
    },
    username: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#424242',
        marginBottom: 10,
    },
    SignoutButton: {

    },
    detailsContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    bioContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#424242',
        marginBottom: 10,
    },
    detailsText: {
        fontSize: 16,
        color: '#757575',
    },
    diaryContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: '#FFFFFF',
        marginTop: 10,
    },
    diaryEntry: {
        marginBottom: 10,
    },
    entryDate: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#424242',
        marginBottom: 5,
    },
    entryContent: {
        fontSize: 14,
        color: '#757575',
    },
    sectionSeparator: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 10,
    },

    input: {
        borderBottomColor: 'gray',
        borderBottomWidth: 1,
        marginBottom: 10,
        padding: 8,
    },
    signButton: {
        backgroundColor: '#eda12b',
        padding: 10,
        marginTop: 10,
        borderRadius: 10,
    },
    signButtonText: {
        color: '#FFFFFF',
        // fontSize: 16,
        textAlign: 'center',
    },
    googleButton: {
        backgroundColor: '#000000',
        padding: 10,
        marginTop: 10,
        borderRadius: 10,
    },
    googleButtonText: {
        color: '#ffffff',
        textAlign: 'center',
    },
    SignoutButton: {
        borderRadius: 5,
    },
    welcomeText: {
        fontSize: 18,
        marginBottom: 20,
    },
    editButton: {
        color: 'blue',
        textDecorationLine: 'underline',
        marginTop: 10,
    },

    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white',
    },
    inputField: {
        width: '80%',
        height: 40,
        backgroundColor: 'white',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '80%',
    },
});

export default OtherScreen;
