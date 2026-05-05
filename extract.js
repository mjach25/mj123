const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, 'index.html');
const dataPath = path.join(__dirname, 'data.json');

let html = fs.readFileSync(indexPath, 'utf8');

// Find the games array
const startIndex = html.indexOf('const GAMES = [');
const endIndex = html.indexOf('];', startIndex) + 2;

if (startIndex !== -1 && endIndex !== -1) {
    const gamesStr = html.substring(startIndex, endIndex);
    
    // Evaluate it safely to convert to JSON
    let GAMES = [];
    eval(gamesStr);
    
    fs.writeFileSync(dataPath, JSON.stringify(GAMES, null, 2));
    console.log('Successfully extracted GAMES to data.json');

    // Replace in HTML
    html = html.substring(0, startIndex) + "let GAMES = [];" + html.substring(endIndex);
    fs.writeFileSync(indexPath, html);
    console.log('Successfully updated index.html');
} else {
    console.log('GAMES array not found');
}
