const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://mjachraf:13HeLupR5Cenh3bC@cluster0.kcgsw3w.mongodb.net/game3rb?retryWrites=true&w=majority";

app.use(cors());
app.use(express.json());

let isConnected = false;

async function connectDB() {
        if (isConnected && mongoose.connection.readyState === 1) return;
        await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000, bufferCommands: false });
        isConnected = true;
}

const Game = mongoose.models.Game || mongoose.model('Game', new mongoose.Schema({ id: Number, title: String, platform: String, genre: [String], year: Number, rating: Number, dl: String, img: String, hero: String, hero2: String, hero3: String, link: String, desc: String, hot: Boolean, isNewItem: Boolean, req: Object }, { strict: false }));

const Settings = mongoose.models.Settings || mongoose.model('Settings', new mongoose.Schema({ _id: { type: String, default: 'global' }, heroLine1: String, heroLine2: String, heroLine3: String, heroSub: String, aboutText: String }, { strict: false }));

const Ads = mongoose.models.Ads || mongoose.model('Ads', new mongoose.Schema({ _id: { type: String, default: 'global' }, rightAdEnabled: Boolean, rightAdImage: String, rightAdLink: String }, { strict: false }));

app.use(async (req, res, next) => {
        try { await connectDB(); next(); }
        catch (err) { res.status(500).json({ error: 'DB connection failed: ' + err.message }); }
});

app.get('/api/games', async (req, res) => {
        try {
                    let games = await Game.find({}).sort({ id: -1 }).lean();
                    games = games.map(g => { if (g.isNewItem !== undefined) g.isNew = g.isNewItem; return g; });
                    res.json(games);
        } catch (err) { res.status(500).json([]); }
});

app.post('/api/games', async (req, res) => {
        try {
                    const newGame = req.body;
                    const maxGame = await Game.findOne().sort({ id: -1 });
                    newGame.id = (maxGame && maxGame.id ? maxGame.id : 0) + 1;
                    if (typeof newGame.genre === 'string') newGame.genre = newGame.genre.split(',').map(g => g.trim());
                    if (newGame.isNew !== undefined) { newGame.isNewItem = newGame.isNew; delete newGame.isNew; }
                    const created = await Game.create(newGame);
                    res.json({ success: true, game: created });
        } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.put('/api/games/:id', async (req, res) => {
        try {
                    const id = parseInt(req.params.id);
                    const data = req.body;
                    if (typeof data.genre === 'string') data.genre = data.genre.split(',').map(g => g.trim());
                    if (data.isNew !== undefined) { data.isNewItem = data.isNew; delete data.isNew; }
                    const result = await Game.findOneAndUpdate({ id }, data, { new: true });
                    result ? res.json({ success: true, game: result }) : res.status(404).json({ success: false });
        } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.delete('/api/games/:id', async (req, res) => {
        try {
                    await Game.findOneAndDelete({ id: parseInt(req.params.id) });
                    res.json({ success: true });
        } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

app.get('/api/settings', async (req, res) => {
        try {
                    const s = await Settings.findById('global').lean();
                    res.json(s || { heroLine1: 'Your Ultimate', heroLine2: 'Free Gaming', heroLine3: 'Destination', heroSub: 'Discover free games.', aboutText: 'Our mission!' });
        } catch (err) { res.status(500).json({}); }
});

app.post('/api/settings', async (req, res) => {
        try {
                    await Settings.findOneAndUpdate({ _id: 'global' }, req.body, { upsert: true, new: true });
                    res.json({ success: true });
        } catch (err) { res.status(500).json({ success: false }); }
});

app.get('/api/ads', async (req, res) => {
        try {
                    const a = await Ads.findById('global').lean();
                    res.json(a || { rightAdEnabled: false, rightAdImage: '', rightAdLink: '' });
        } catch (err) { res.status(500).json({}); }
});

app.post('/api/ads', async (req, res) => {
        try {
                    await Ads.findOneAndUpdate({ _id: 'global' }, req.body, { upsert: true, new: true });
                    res.json({ success: true });
        } catch (err) { res.status(500).json({ success: false }); }
});

module.exports = app;
