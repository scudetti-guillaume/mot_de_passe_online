// const express = require("express");
// const router = express.Router();
// const team = require("../controllers/team.controller");
const PlayerModel = require("../models/players.model");
const TeamModel = require("../models/team.model");
const GameSettingsModel = require("../models/gameSettings.model");

exports.getTeam = async (callback) => {
    try {
        const playerList = await PlayerModel.find({ selected: true });
        callback({ success: true, data: playerList });
    } catch (err) {
        console.error('Erreur lors de la récupération de tous les joueurs :', err);
        callback({ success: false, error: 'Erreur lors de la récupération de tous les joueurs .' });
    }
    }

exports.addPlayer = async (data , callback) => {
    const { playerId, playerNumber } = data
    try {
        const PlayerListTrue = await PlayerModel.findOneAndUpdate({ _id: playerId }, { selected: true, Number: playerNumber }, { new: true });
        if (PlayerListTrue) {
            callback({ success: true, data: { playerId: playerId } });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de tous les joueurs :', error);
        callback({ success: false, error: 'player non ajouter' });
    }
}

exports.playerRemove = async (data, callback) => {
    const { playerId } = data
    try {
        const PlayerListFalse = await PlayerModel.findOneAndUpdate({ _id: playerId }, { selected: false, Number: 0 }, { new: true });
        if (PlayerListFalse) {
            callback({ success: true, data: { playerId: playerId } });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération de tous les joueurs :', error);
        callback({ success: false, error: 'player non ajouter' });
    }
}

exports.launchGame = async (callback) => {
    await TeamModel.deleteMany();
    const data = await GameSettingsModel.find({})
    const { chrono, wordsNumber } = data[0]
    const PlayerListTrue = await PlayerModel.find({ selected: true }).sort({ Number: 1 }).exec();
    const teamStart = []
    teamStart.push(PlayerListTrue)
    try {
        PlayerListTrue.forEach((player) => {
          TeamModel.findOneAndUpdate(
                {},
                {
                    $push: { players: { playerId: player._id, playerPseudo: player.pseudo, playerNumber: player.Number } },
                    chrono, wordsNumber,
                },
                { upsert: true, new: true }
            )
                .then((team) => {
                    team.save()
                })
        });
        callback({success: true, data : teamStart})
    } catch (error) {
        callback({ success: false, error: 'team non ajouter' });
    }
}

exports.getChrono = async (data,callback) => {
    const {chrono} = data;
    try {
        await TeamModel.updateOne({ chrono : chrono });
        callback({ success: true, data : chrono })
    } catch (err) {
        callback({ success: false, error: 'erreur sur le chrono' });
    }
}


exports.getWord = async (data,callback) => {
    const { player1Words, player2Words } = data
    const list_1 = []
    const list_2 = []
    const askwordlist = await TeamModel.find({});
    askwordlist.forEach(team => {
        team.players.forEach(player => {
            list_1.push(player.wordlist)
            list_2.push(player.wordlist)
        })
    });
    if (list_1[0].length == 0 && list_2[0].length == 0) {
        try {
            const updateQuery = {
                $push: {
                    "players.$[elem1].wordlist": { $each: player1Words },
                    "players.$[elem2].wordlist": { $each: player2Words }
                }
            };
            const options = {
                arrayFilters: [
                    { "elem1.playerNumber": 1 },
                    { "elem2.playerNumber": 2 }
                ]
            };
            await TeamModel.updateMany({}, updateQuery, options);
            const PlayerList = await TeamModel.find({});
            callback({ success: true, data: PlayerList });
            // callback({ success: true,  list_1: player1Words, list_2: player2Words })
        } catch (err) {
            callback({ success: false, error : err})
        }
    } else {
        const PlayerList = await TeamModel.find({});
        callback({ success: true, data: PlayerList });
    }
}

exports.regenList = async (data, callback) => {
    const { player1Words, player2Words } = data;
    console.log(data);
    const list_1 = [];
    const list_2 = [];
    const askwordlist = await TeamModel.find({});
    askwordlist.forEach((team) => {
        team.players.forEach((player) => {
            list_1.push(player.wordlist);
            list_2.push(player.wordlist);
        });
    });
        try {
            const unsetQuery = {
                $unset: {
                    "players.$[elem1].wordlist": 1,
                    "players.$[elem2].wordlist": 1,
                },
            };
            const unsetOptions = {
                arrayFilters: [
                    { "elem1.playerNumber": 1 },
                    { "elem2.playerNumber": 2 },
                ],
            };
            await TeamModel.updateMany({}, unsetQuery, unsetOptions);
            if (list_1[0].length === 0 && list_2[0].length === 0) {
            const pushQuery = {
                $push: {
                    "players.$[elem1].wordlist": { $each: player1Words },
                    "players.$[elem2].wordlist": { $each: player2Words },
                },
            };
            const pushoptions = {
                arrayFilters: [
                    { "elem1.playerNumber": 1 },
                    { "elem2.playerNumber": 2 },
                ],
            };
            await TeamModel.updateMany({}, pushQuery, pushoptions);
                const PlayerList = await TeamModel.find({});
                console.log(PlayerList);
               callback({ success: true, data: PlayerList });

            // callback({ success: true, list_1: player1Words, list_2: player2Words });
        } else {
                const unsetQuery = {
                    $unset: {
                        "players.$[elem1].wordlist": 1,
                        "players.$[elem2].wordlist": 1,
                    },
                };
                const unsetOptions = {
                    arrayFilters: [
                        { "elem1.playerNumber": 1 },
                        { "elem2.playerNumber": 2 },
                    ],
                };
                await TeamModel.updateMany({}, unsetQuery, unsetOptions);
                const pushQuery = {
                    $push: {
                        "players.$[elem1].wordlist": { $each: player1Words },
                        "players.$[elem2].wordlist": { $each: player2Words },
                    },
                };
                const pushoptions = {
                    arrayFilters: [
                        { "elem1.playerNumber": 1 },
                        { "elem2.playerNumber": 2 },
                    ],
                };
                await TeamModel.updateMany({}, pushQuery, pushoptions);
                const PlayerList = await TeamModel.find({});
                console.log(PlayerList);
            callback({ success: true, data: PlayerList });
        }
    
        } catch (err) {
            callback({ success: false, error: err });
        }
    }

exports.getDataGame = async (callback) => {
    try {
        const PlayerList = await TeamModel.find({});
       callback({ success: true, data: PlayerList });
    } catch (err) {
        callback({ success: false, error: err });
    }
};



exports.getUpdate = async (data, callback) => {
    try {
        await TeamModel.deleteMany({});
        const newData = await TeamModel.insertMany(data.updatedGameData);
        // console.log(newData);
        callback({ success: true, data: newData });
    } catch (error) {
        console.error(error);
        callback({ success: false, data: 'erreur lors de la mise à jour des données' });
    }
};


exports.teamReset = async (callback) => {
    try {
        PlayerModel.updateMany({ selected: true }, { selected: false, Number: 0 })
            .then(() => {
                return TeamModel.updateOne({ reset: true });
            })
            .then(() => {
                callback({ success: true });
            })
            .catch((error) => {
                callback({ success: false });
            });
    } catch (error) {
        callback({ success: false });
    }
}


// const { getIO } = require('../util/socket');
// const io = getIO();

// router.post("/addplayer", (req, res) => {
//     team.addPlayer(req, res);
// });

// router.patch("/removeplayer", (req, res) => {
//     // req.app.get("io").emit("playerRemoved", req.body);
//     team.removePlayer(req, res);
// });

// router.get("/team", (req, res) => {
//     // req.app.get("io").emit("team", req.body);
//     team.getTeam(req, res);
// })

// router.post("/launchgame", (req, res) => {
//     // req.app.get("io").emit("startgame", res.body);
//     team.startGame(req, res);
// });

// router.post("/words", (req, res) => {
//     // req.app.get("io").emit("startgame", res.body);
//     team.wordList(req, res);
// });

// router.get("/dataGame", (req, res) => {
//     // req.app.get("io").emit("startgame", res.body);
//     team.getData(req, res);
// });

// router.patch("/regenwords", (req, res) => {
//     // req.app.get("io").emit("startgame", res.body);
//     team.regenList(req, res);
// });

// router.post("/update", (req, res) => {
//     // req.app.get("io").emit("startgame", res.body);
//     team.update(req, res);
// });

// router.post("/chrono", (req, res) => {
//     // req.app.get("io").emit("startgame", res.body);
//     team.chrono(req, res);
// });

// router.post("/reset", (req, res) => {
//     // req.app.get("io").emit("startgame", res.body);
//     team.reset(req, res);
// });

// // router.post("/finish", (req, res) => {
// //     // req.app.get("io").emit("startgame", res.body);
// //     team.finish(req, res);
// // });

// module.exports = router;





