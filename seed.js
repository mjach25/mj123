const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const uri = "mongodb+srv://mjachraf:13HeLupR5Cenh3bC@cluster0.kcgsw3w.mongodb.net/game3rb?retryWrites=true&w=majority";

const gameSchema = new mongoose.Schema({
    id: Number,
    title: String,
    platform: String,
    genre: [String],
    year: Number,
    rating: Number,
    dl: String,
    img: String,
    hero: String,
    hero2: String,
    hero3: String,
    link: String,
    desc: String,
    hot: Boolean,
    isNew: Boolean,
    req: Object
}, { strict: false });

const settingsSchema = new mongoose.Schema({
    _id: { type: String, default: "global" },
    heroLine1: String,
    heroLine2: String,
    heroLine3: String,
    heroSub: String,
    aboutText: String
}, { strict: false });

const adsSchema = new mongoose.Schema({
    _id: { type: String, default: "global" },
    rightAdEnabled: Boolean,
    rightAdImage: String,
    rightAdLink: String
}, { strict: false });

const Game = mongoose.model('Game', gameSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const Ads = mongoose.model('Ads', adsSchema);

async function seed() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to DB...");

        const gamesData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
        await Game.deleteMany({});
        await Game.insertMany(gamesData);
        console.log(`Inserted ${gamesData.length} games.`);

        try {
            const settingsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'settings.json'), 'utf8'));
            settingsData._id = "global";
            await Settings.deleteMany({});
            await Settings.create(settingsData);
            console.log("Inserted settings.");
        } catch(e) {}

        try {
            const adsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'ads.json'), 'utf8'));
            adsData._id = "global";
            await Ads.deleteMany({});
            await Ads.create(adsData);
            console.log("Inserted ads.");
        } catch(e) {}

        console.log("Seeding complete!");
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seed();
