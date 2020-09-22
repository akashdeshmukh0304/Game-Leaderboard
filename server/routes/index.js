import Player from "../controllers/players";
import Score from "../controllers/scores";

export default app => {
    
    app.get("/api", (req, res) => {
        return res.status(200).send("Welcome to the leaderboard API.")
    })

    /**
     * API for players to sign up
     */
    app.post("/api/players", Player.add);
    app.post("/api/score/:playerId", Player.submit);
    app.get("/api/LeaderBoard", Score.fetchLeaderBoard);
    app.get("/api/playersStats/:playerId", Player.fetchPlayerStats);
    app.get("/api/playersStats/", Player.fetchStats);
}