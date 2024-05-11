// const MongoClient = require('mongodb').MongoClient;

// const OpenAI = require("openai");
require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const http = require('http');

const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
// const socketIo = require('socket.io');
// const server = http.createServer(app);

// const io = socketIo(server, {
//     cors: {
//         origin: "*",
//         methods: ["GET", "POST"]
//     }
// });
var url = `mongodb://localhost:27017/LifeTimeline`;
var dbName = "LifeTimeline"

function generateTokenForUser(userId) {
    const tokenSize = 32;
    const token = crypto.randomBytes(tokenSize).toString('hex');
    return token;
}
async function initializeDatabase() {
    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db(dbName);

        await initializeUsers(db);

        await initializeCategories(db);

    } catch (e) {
        console.error("Database initialization error:", e);
    } finally {
        await client.close();
    }
}

async function initializeUsers(db) {
    const userCollectionExists = await db.listCollections({ name: 'validEmailandpass' }).toArray();
    if (userCollectionExists.length === 0) {
        let users = [
            { email: "yifeima@usc.edu", hashedPassword: "yifei", privacy: "admin", createdat: new Date(), source: "email" },
            { email: "junyaore@usc.edu", hashedPassword: "junyao", privacy: "admin", createdat: new Date(), source: "email" },
            { email: "S", hashedPassword: "S", privacy: "user", createdat: new Date(), source: "email" }
        ];

        for (let user of users) {
            user.hashedPassword = await bcrypt.hash(user.hashedPassword, 10);
        }
        await db.collection('validEmailandpass').insertMany(users);
    }
}

async function initializeCategories(db) {
    const categoryCollectionExists = await db.listCollections({ name: 'categories' }).toArray();
    if (categoryCollectionExists.length === 0) {
        let categories = [
            {
                name: "Drink",
                events: [
                    { name: "Cocktail", description: "A cocktail is an alcoholic mixed drink." },
                    { name: "Smoothie", description: "A smoothie is a thick beverage made from blended raw fruits or vegetables." },
                    { name: "Soda", description: "A soft drink containing carbonated water, a sweetener, and a natural or artificial flavoring." },
                    { name: "Coffee", description: "A brewed drink prepared from roasted coffee beans." },
                    { name: "Tea", description: "An aromatic beverage commonly prepared by pouring hot or boiling water over cured or fresh leaves of the Camellia sinensis." },
                    { name: "Beer", description: "An alcoholic drink made from yeast-fermented malt flavored with hops." },
                    { name: "Wine", description: "An alcoholic drink made from fermented grape juice." },
                    { name: "Whiskey", description: "A type of distilled alcoholic beverage made from fermented grain mash." },
                    { name: "Margarita", description: "A cocktail consisting of tequila, orange liqueur, and lime juice often served with salt on the rim of the glass." },
                    { name: "Martini", description: "A cocktail made with gin and vermouth, and garnished with an olive or a lemon twist." }
                ]
            },
            {
                name: "Sport",
                events: [
                    { name: "Basketball", description: "A team sport where two teams of five players try to score points by throwing a ball into the top of a basketball hoop." },
                    { name: "Soccer", description: "Known as football in most of the world, it's a sport played between two teams of eleven players with a spherical ball." },
                    { name: "Tennis", description: "A racket sport that can be played individually against a single opponent or between two teams of two players each." },
                    { name: "Baseball", description: "A bat-and-ball sport played between two opposing teams who take turns batting and fielding." },
                    { name: "Golf", description: "A club-and-ball sport in which players use various clubs to hit balls into a series of holes on a course in as few strokes as possible." },
                    { name: "Running", description: "A method of terrestrial locomotion allowing humans and other animals to move rapidly on foot." },
                    { name: "Swimming", description: "The self-propulsion of a person through water, usually for recreation, sport, exercise, or survival." },
                    { name: "Boxing", description: "A combat sport in which two people, usually wearing protective gloves, throw punches at each other for a predetermined amount of time in a boxing ring." },
                    { name: "Cycling", description: "The use of bicycles for transport, recreation, exercise or sport." },
                    { name: "Volleyball", description: "A team sport in which two teams of six players are separated by a net. Each team tries to score points by grounding a ball on the other team's court under organized rules." }
                ]
            },
            {
                name: "Job",
                events: [
                    { name: "Software Developer", description: "A professional who writes, debugs, and executes the source code of software applications." },
                    { name: "Civil Engineer", description: "An engineer who designs, builds, supervises, operates, and maintains construction projects in the public and private sector." },
                    { name: "Graphic Designer", description: "A professional within the graphic arts industry who assembles together images, typography, or motion graphics to create a piece of design." },
                    { name: "Data Analyst", description: "A professional responsible for collecting, processing, and performing statistical analyses of data." },
                    { name: "Nurse", description: "A healthcare professional who practices independently or is supervised by a physician, surgeon, or dentist and who is skilled in promoting and maintaining health." },
                    { name: "Accountant", description: "A practitioner of accounting or accountancy, who is responsible for keeping and interpreting financial records." },
                    { name: "Teacher", description: "A person who helps students to acquire knowledge, competence, or virtue." },
                    { name: "Chef", description: "A trained professional cook and tradesman who is proficient in all aspects of food preparation, often focusing on a particular cuisine." },
                    { name: "Electrician", description: "A tradesman specializing in electrical wiring of buildings, transmission lines, stationary machines, and related equipment." },
                    { name: "Architect", description: "A person who plans, designs, and oversees the construction of buildings." }
                ]
            },
            {
                name: "Art",
                events: [
                    { name: "Painting", description: "The practice of applying paint, pigment, color or other medium to a solid surface." },
                    { name: "Sculpture", description: "The art of making two- or three-dimensional representative or abstract forms, especially by carving stone or wood or by casting metal or plaster." },
                    { name: "Photography", description: "The art, application, and practice of creating durable images by recording light, electronically by means of an image sensor, or chemically by means of a light-sensitive material." },
                    { name: "Dance", description: "A performing art form consisting of purposefully selected sequences of human movement." },
                    { name: "Literature", description: "Written works, especially those considered of superior or lasting artistic merit." },
                    { name: "Cinema", description: "A filmmaking art form where motion pictures are produced." },
                    { name: "Music", description: "The art of arranging sounds in time to produce a composition through the elements of melody, harmony, rhythm, and timbre." },
                    { name: "Theatre", description: "A collaborative form of performing art that uses live performers to present the experience of a real or imagined event before a live audience." },
                    { name: "Architecture", description: "Both the process and the product of planning, designing, and constructing buildings or any other structures." },
                    { name: "Digital Art", description: "An artistic work or practice that uses digital technology as part of the creative or presentation process." }
                ]
            },
            {
                name: "Plant",
                events: [
                    { name: "Succulents", description: "Plants with parts that are thickened, fleshy, and engorged, usually to retain water in arid climates or soil conditions." },
                    { name: "Orchids", description: "A diverse and widespread family of flowering plants with blooms that are often colourful and fragrant." },
                    { name: "Ferns", description: "A group of plants that reproduce via spores and have neither seeds nor flowers." },
                    { name: "Palms", description: "Diverse plants from the Arecaceae family, most species are known as palm trees." },
                    { name: "Cacti", description: "Members of the plant family Cactaceae, a family comprising about 127 genera with some 1750 known species of the order Caryophyllales." },
                    { name: "Bonsai", description: "The Japanese art form using cultivation techniques to produce small trees in containers that mimic the shape and scale of full size trees." },
                    { name: "Bamboo", description: "A group of woody perennial evergreen plants in the true grass family Poaceae." },
                    { name: "Herbs", description: "Plants with savory or aromatic properties that are used for flavoring and garnishing food, medicinal purposes, or for fragrances." },
                    { name: "Shrubs", description: "Small to medium-sized woody plants taller than herbs and shorter than a tree." },
                    { name: "Trees", description: "Perennial plants with an elongated stem, or trunk, supporting branches and leaves in most species." }
                ]
            }
        ];

        await db.collection('categories').insertMany(categories);
    }
}

async function deleteExpiredTokens() {
    const client = new MongoClient(url);

    try {
        await client.connect();

        const db = client.db(dbName);
        const collection = db.collection('validToken');
        const cursor = await collection.find().toArray();
        console.log(cursor);
        for await (let doc of cursor) {
            if (doc.createdat && doc.createdat instanceof Date) {

                const duration = Math.floor((new Date() - doc.createdat) / 1000);
                console.log(duration);
                await collection.updateOne(
                    { _id: doc._id },
                    { $set: { duration: duration } }
                );
            }
        }
        const result = await collection.deleteMany({ duration: { $gt: 500000 } });
        console.log(`${result.deletedCount} expired token(s) were deleted.`);

    } catch (err) {
        console.log(err.stack);
    } finally {
        await client.close();
    }
}
app.use(cors({
    origin: "*",
    methods: ['GET', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get('/', async (req, res) => {
    res.status(200).json("correct");
});

app.get('/categories', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const categoriesCollection = db.collection('categories');

        // Retrieve only the names of the categories
        const categories = await categoriesCollection.find({}, { projection: { name: 1 } }).toArray();
        console.log("Categories fetched:", categories);
        res.status(200).json(categories);
    } catch (error) {
        console.error('Failed to retrieve categories:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve categories' });
    } finally {
        await client.close();
    }
});

app.post('/updateEventCheckedState', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const { eventId, isChecked } = req.body;

        const result = await db.collection('categories').updateOne(
            { "events._id": eventId },
            { $set: { "events.$.isChecked": isChecked } }
        );

        if (result.modifiedCount === 1) {
            res.status(200).json({ success: true, message: 'Event updated successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Event not found' });
        }
    } catch (error) {
        console.error('Failed to update event:', error);
        res.status(500).json({ success: false, message: 'Failed to update event' });
    } finally {
        await client.close();
    }
});

app.get('/events/:categoryName', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const categoriesCollection = db.collection('categories');

        const category = await categoriesCollection.findOne({ name: req.params.categoryName }, { projection: { events: 1, _id: 0 } });
        console.log("Eventscategory:", category);
        if (category) {
            console.log("Events fetched for category:", req.params.categoryName, category.events);
            res.status(200).json(category.events);
        } else {
            res.status(404).json({ success: false, message: 'Category not found' });
        }
    } catch (error) {
        console.error('Failed to retrieve events:', error);
        res.status(500).json({ success: false, message: 'Failed to retrieve events' });
    } finally {
        await client.close();
    }
});

app.delete('/deleteEvent/:eventId', async (req, res) => {
    const { eventId } = req.params;
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const categoriesCollection = db.collection('categories');

        // Assuming your events are stored in an array within the category document
        const deleteResult = await categoriesCollection.updateMany(
            {},
            { $pull: { events: { _id: new ObjectId(eventId) } } }
        );

        if (deleteResult.modifiedCount > 0) {
            res.status(200).json({ success: true, message: 'Event deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Event not found' });
        }
    } catch (error) {
        console.error('Failed to delete event:', error);
        res.status(500).json({ success: false, message: 'Failed to delete event' });
    } finally {
        await client.close();
    }
});

app.get('/dreams', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const dreamsCollection = db.collection('dreams');
        const dreams = await dreamsCollection.find({}).toArray();
        console.log("dreams", dreams);
        res.status(200).json(dreams);
    } catch (error) {
        console.error('Failed to fetch dreams:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch dreams' });
    } finally {
        await client.close();
    }
});


app.post('/addDream', async (req, res) => {
    const { dream } = req.body;
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const dreamsCollection = db.collection('dreams');
        const result = await dreamsCollection.insertOne({ dream });
        console.log(result);
        res.status(200).json(result);
    } catch (error) {
        console.error('Failed to add dream:', error);
        res.status(500).json({ success: false, message: 'Failed to add dream' });
    } finally {
        await client.close();
    }
});


app.delete('/deleteDream/:id', async (req, res) => {
    const { id } = req.params;
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const dreamsCollection = db.collection('dreams');
        const deleteResult = await dreamsCollection.deleteOne({ _id: new ObjectId(id) });

        if (deleteResult.deletedCount === 1) {
            res.status(200).json({ success: true, message: 'Dream deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Dream not found' });
        }
    } catch (error) {
        console.error('Failed to delete dream:', error);
        res.status(500).json({ success: false, message: 'Failed to delete dream' });
    } finally {
        await client.close();
    }
});


// io.on('connection', (socket) => {
//     console.log('User connected');

//     socket.on('sendMessage', async (message) => {
//         console.log("A message received", message);
//         const client = new MongoClient(url);
//         try {
//             await client.connect();
//             const db = client.db(dbName);
//             const messagesCollection = db.collection('messages');

//             const insertedMessage = await messagesCollection.insertOne({
//                 ...message,
//                 createdAt: new Date()
//             });

//             const recipientSocket = findSocketByUserName(io, message.toUserName);

//             if (recipientSocket) {
//                 recipientSocket.emit('receiveMessage', {
//                     ...message,
//                     _id: insertedMessage.insertedId,
//                     createdAt: new Date()
//                 });
//             }

//             socket.emit('messageSent', {
//                 ...message,
//                 _id: insertedMessage.insertedId,
//                 createdAt: new Date()
//             });
//         } catch (error) {
//             console.error('Failed to save message:', error);
//             socket.emit('sendMessageError', { message: 'Message could not be sent.' });
//         } finally {
//             client.close();
//         }
//     });


//     socket.on('disconnect', () => {
//         console.log('Client disconnected');
//     });
// });
// function findSocketByUserName(io, userName) {
//     const sockets = io.sockets.sockets;
//     for (let [id, socket] of sockets) {
//         if (socket.userName === userName) {
//             return socket;
//         }
//     }
//     return null;
// }
// io.on('connection', (socket) => {
//     socket.on('join', ({ userName }) => {
//         socket.userName = userName;
//     });
// });
app.get('/messages/:conversationId', async (req, res) => {
    const { conversationId } = req.params;
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const messagesCollection = db.collection('messages');
        const messages = await messagesCollection.find({ conversationId }).toArray();
        res.status(200).json(messages);
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        await client.close();
    }
});
app.get('/messages/:conversationId/last', async (req, res) => {
    const { conversationId } = req.params;
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const messagesCollection = db.collection('messages');

        const lastMessage = await messagesCollection.find({ conversationId }).sort({ createdAt: -1 }).limit(1).toArray();
        console.log(lastMessage);
        if (lastMessage.length > 0) {
            res.status(200).json(lastMessage[0]);
        } else {
            res.status(404).json({ message: "No messages found for this conversation." });
        }
    } catch (error) {
        console.error('Failed to fetch messages:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.close();
    }
});

app.post('/conversation', async (req, res) => {
    const { fromUserName, toUserName } = req.body;
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const conversationsCollection = db.collection('conversations');
        let conversation = await conversationsCollection.findOne({
            participants: { $all: [fromUserName, toUserName] }
        });
        if (!conversation) {
            conversation = await conversationsCollection.insertOne({
                participants: [fromUserName, toUserName],
                createdAt: new Date()
            });
        }
        res.status(200).json(conversation);
    } catch (error) {
        console.error('Failed to create or find the conversation:', error);
        res.status(500).json({ error: 'Internal server error' });
    } finally {
        client.close();
    }
});

app.get('/conversations/:username', async (req, res) => {
    const { username } = req.params;
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const conversationsCollection = db.collection('conversations');

        const conversations = await conversationsCollection.find({
            participants: username
        }).toArray();
        console.log("conv", conversations);
        res.status(200).json(conversations);
    } catch (error) {
        console.error('Failed to retrieve conversations for user:', error);
        res.status(401).json({ success: false, message: 'Failed to retrieve conversations for user' });
    } finally {
        client.close();
    }
});
app.delete('/deleteConversation/:conversationId', async (req, res) => {
    const { conversationId } = req.params;
    const client = new MongoClient(url);
    try {
        console.log("deleteing", conversationId);
        await client.connect();
        const db = client.db(dbName);
        const conversationsCollection = db.collection('conversations');

        const deleteResult = await conversationsCollection.deleteOne({ _id: new ObjectId(conversationId) });

        if (deleteResult.deletedCount === 1) {
            res.status(200).json({ success: true, message: 'Conversation deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Conversation not found' });
        }
    } catch (error) {
        console.error('Failed to delete conversation:', error);
        res.status(500).json({ success: false, message: 'Failed to delete conversation' });
    } finally {
        await client.close();
    }
});

app.get('/test', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Test endpoint reached successfully!'
    });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    // console.log(req.body);
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const emailCollection = db.collection('validEmailandpass');
        const tokenCollection = db.collection('validToken');

        // console.log(emailAll);
        const userInDB = await emailCollection.findOne({ email });
        const userInToken = await tokenCollection.findOne({ email });
        // console.log(userInDB, userInToken);
        if (userInDB && userInToken) {
            const token = userInToken.token;
            res.json({ success: true, token });

        } else if (userInDB) {
            const isValidPassword = await bcrypt.compare(password, userInDB.hashedPassword);
            if (isValidPassword) {
                console.log("User authenticated successfully");
                const token = generateTokenForUser(userInDB);
                res.json({ success: true, token });

            } else {
                console.log("Incorrect username or password");
                res.status(401).json({ success: false, message: 'Invalid email or password' });
            }
        } else {
            console.log("User not found");
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

    } catch (error) {
        console.error("555Database connection error:", error);
    } finally {
        client.close();
    }
});

app.post('/register', async (req, res) => {
    try {
        const client = new MongoClient(url, {
            useUnifiedTopology: true
        });
        try {
            await client.connect();
            const db = client.db(dbName);
            // console.log("Connected to MongoDB");
            const { email, password } = req.body;
            const emailCollection = db.collection('validEmailandpass');
            const userInDBha = await emailCollection.findOne({ email });


            if (!userInDBha) {
                const hashedPassword = await bcrypt.hash(password, 10);
                const result = await emailCollection.insertOne({ email: email, hashedPassword: hashedPassword, privacy: "user", createdat: new Date(), source: "email" });
                let token = generateTokenForUser(userInDBha);
                console.log(result);
                res.json({ success: true, token });
            } else {
                console.log("User found");
                res.status(401).json({ success: false, message: 'User already exist' });
            }


        } catch (e) {
            console.error("Database connection error:", e);
        } finally {
            client.close();
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
});

app.post('/storetoken', async (req, res) => {
    const { email, token } = req.body;
    // console.log(email, token);
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const emailCollection = db.collection('validEmailandpass');
        const tokenCollection = db.collection('validToken');
        const userInDB = await emailCollection.findOne({ email: email }, { source: "email" });
        const userInToken = await tokenCollection.findOne({ email: email }, { source: "email" });

        if (userInDB) {
            if (!userInToken) {
                await tokenCollection.insertOne({
                    _id: new ObjectId(),
                    email: email,
                    source: "email",
                    token: token,
                    createdat: new Date(),
                    duration: 0,
                    renew: 0,
                });
                res.json({ success: true, token });
            } else {
                await tokenCollection.updateOne(
                    { email: email, source: "email" },
                    {
                        $set: {
                            createdat: new Date(),
                            duration: 0
                        },
                        $inc: {
                            renew: 1,
                        }
                    }
                );
                res.json({ success: true, token });

            }
        } else {
            console.log("User not found");
            res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

    } catch (error) {
        console.error("666Database connection error:", error);
    } finally {
        client.close();
    }
});

// app.post('/storegtoken', async (req, res) => {
//     const { email, token } = req.body;
//     const client = new MongoClient(url);
//     try {
//         await client.connect();
//         // console.log("Connected to MongoDB");
//         const db = client.db(dbName);
//         const emailCollection = db.collection('validEmailandpass');
//         const tokenCollection = db.collection('validToken');
//         const userInDB = await emailCollection.findOne({ email: email, source: "gmail" });
//         const userInToken = await tokenCollection.findOne({ email: email, source: "gmail" });

//         if (userInDB) {
//             if (!userInToken) {
//                 await tokenCollection.insertOne({
//                     _id: new ObjectId(),
//                     source: "gmail",
//                     email: email,
//                     token: token,
//                     createdat: new Date(),
//                     duration: 0,
//                     renew: 0,
//                 });
//                 res.json({ success: true, token });
//             } else {
//                 await tokenCollection.updateOne(
//                     { email: email }, { source: "gmail" },
//                     {
//                         $set: {
//                             createdat: new Date(),
//                             duration: 0
//                         },
//                         $inc: {
//                             renew: 1,
//                         }
//                     }
//                 );
//                 res.json({ success: true, token });

//             }
//         } else {
//             await emailCollection.insertOne({
//                 _id: new ObjectId(),
//                 email: email,
//                 source: "gmail",
//                 privacy: "user",
//                 createdat: new Date(),
//             });
//             await tokenCollection.insertOne({
//                 _id: new ObjectId(),
//                 source: "gmail",
//                 email: email,
//                 token: token,
//                 createdat: new Date(),
//                 duration: 0,
//                 renew: 0,
//             });
//             res.json({ success: true, token });
//         }

//     } catch (error) {
//         console.error("670Database connection error:", error);
//     } finally {
//         client.close();
//     }
// });

app.post('/validation', async (req, res) => {
    const { email, token } = req.body;
    const client = new MongoClient(url);
    try {
        await client.connect();
        // console.log("Connected to MongoDB");
        const db = client.db(dbName);
        const tokenCollection = db.collection('validToken');
        const userInToken = await tokenCollection.findOne({ email });

        if (!userInToken) {
            res.status(404).json({ success: false, message: 'No token or expired' });
        } else if (token == userInToken.token) {
            await tokenCollection.updateOne(
                { email: email },
                {
                    $set: {
                        duration: 0
                    },
                    $inc: {
                        renew: 1,
                    }
                }
            );
            // const token = userInToken.token;
            res.json({ success: true });
        }

    } catch (error) {
        console.error("666Database connection error:", error);
    } finally {
        client.close();
    }

});

app.delete('/token', async (req, res) => {
    const { email } = req.body;
    const client = new MongoClient(url);
    try {
        await client.connect();
        // console.log("Connected to MongoDB");
        const db = client.db(dbName);
        const tokenCollection = db.collection('validToken');
        const userInToken = await tokenCollection.findOne({ email });

        if (!userInToken) {
            res.status(404).json({ success: false, message: 'No token or expired' });
        } else {
            await tokenCollection.deleteOne(
                { email: email }
            );
            const token = userInToken.token;
            res.json({ success: true, token });
        }

    } catch (error) {
        console.error("669Database connection error:", error);
    } finally {
        client.close();
    }

});

app.get('/user', async (req, res) => {
    const client = new MongoClient(url);
    try {
        await client.connect();
        // console.log("Connected to MongoDB");
        const db = client.db(dbName);
        const profileCollection = db.collection('validEmailandpass');
        const profileAll = await profileCollection.find().toArray();
        // let temp = profileAll.length;
        // console.log(profileAll);
        res.status(200).json(profileAll);

    } catch (error) {
        console.error("668Database connection error:", error);
    } finally {
        client.close();
    }
});

app.post('/profile', async (req, res) => {
    const { email } = req.body;
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const profilesCollection = db.collection('ProfileData');
        const profileOneOne = await profilesCollection.find({ email: email }).toArray();
        if (profileOneOne.length == 0) {

            await profilesCollection.insertOne({
                _id: new ObjectId(),
                email: email,
                username: "no data",
                birthday: "no data",
                gender: "no data",
                region: "no data",
                created_at: new Date(),
                update_at: new Date(),
            });
        }
        // console.log(profileOne);
        const newprofile = await profilesCollection.find({ email: email }).toArray();

        res.status(200).send(newprofile);

    } catch (error) {
        console.error("667Database connection error:", error);
    } finally {
        client.close();
    }
});

app.post('/createProfile', async (req, res) => {
    const { email, username, gender, region } = req.body;
    console.log('Received request body:', req.body);
    console.log(email, username, gender, region);
    if (!email) {
        return res.status(400).send({ error: 'Email is required' });
    }

    const client = new MongoClient(url);

    try {
        await client.connect();
        const db = client.db(dbName);
        const profileCollection = db.collection('ProfileData');

        const existingProfile = await profileCollection.findOne({ email });

        if (existingProfile) {
            const updatedResult = await profileCollection.updateOne({ email }, {
                $set: {
                    username,
                    gender,
                    region,
                    update_at: new Date(),
                }
            });

            if (updatedResult.modifiedCount > 0) {
                res.status(200).send({ message: 'Profile updated successfully' });
            } else {
                res.status(500).send({ error: 'Failed to update profile' });
            }
        } else {
            const insertResult = await profileCollection.insertOne({
                email,
                username,
                // birthday: birthday ? birthday : "no data",
                gender: gender ? gender : "no data",
                region: region ? region : "no data",
                created_at: new Date(),
                update_at: new Date(),
            });

            if (insertResult.acknowledged) {
                res.status(201).send({ message: 'Profile created successfully' });
            } else {
                res.status(500).send({ error: 'Failed to create profile' });
            }
        }
    } catch (error) {
        console.error("Error handling profile:", error);
        res.status(500).send({ error: 'Internal server error' });
    } finally {
        client.close();
    }
});

app.post('/story', async (req, res) => {
    const { email, mode, story, storytitle, id } = req.body;
    const client = new MongoClient(url);
    // console.log(story);
    try {
        await client.connect();
        const db = client.db(dbName);
        const LifeCollection = db.collection('Story&Dream');
        const LifeOne = await LifeCollection.find({
            $or: [
                { email: email },
                { _id: new ObjectId(id) }
            ]
        }).toArray();
        // console.log(LifeOne);
        if (mode == "read") {
            res.status(200).send(LifeOne);

        } else if (LifeOne.length != 0) {
            await LifeCollection.updateOne(
                { email: email },
                {
                    $set: {
                        update_at: new Date(),
                        story: story,
                        storytitle: storytitle,
                    },
                    $inc: {
                        renew: 1,
                    }
                }
            );
            res.status(200).send(true);
        } else {
            await LifeCollection.insertOne({

                _id: new ObjectId(),
                source: "email",
                email: email,
                createdat: new Date(),
                renew: 0,
                story: story,
                storytitle: storytitle,
            }
            );
            console.log("story added");
            res.status(200).send(true);
        }

    } catch (error) {
        console.error("667Database connection error:", error);
    } finally {
        client.close();
    }
});

app.get('/story', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const skipAmount = (page - 1) * 2;
    const client = new MongoClient(url);
    try {
        await client.connect();
        const db = client.db(dbName);
        const LifeCollection = db.collection('Story&Dream');

        const totalDocuments = await LifeCollection.countDocuments();
        // console.log(totalDocuments);
        // const result = await LifeCollection.aggregate([
        //     { $sample: { size: 2 } }
        // ]).toArray();

        const result = await LifeCollection.aggregate([
            // { $skip: skipAmount },
            // { $limit: 2 },
            { $sample: { size: 10 } }
        ]).toArray();
        console.log(result);
        res.status(200).send(result);

    } catch (error) {
        console.error("667Database connection error:", error);
        res.status(500).send({ error: "Error fetching stories" });
    } finally {
        client.close();
    }
});

deleteExpiredTokens();
setInterval(deleteExpiredTokens, 250000);

initializeDatabase().then(() => {
    app.listen(3002, '0.0.0.0', () => {
        console.log('Server is running on port 3002');
    });
    // server.listen(3001, '0.0.0.0', () => {
    //     console.log('socket is running on port 3001');
    // });
}).catch(error => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
});

