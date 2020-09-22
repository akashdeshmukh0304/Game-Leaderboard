import moment from "moment";
import model, { sequelize, Sequelize } from "../models";
import { buildErrorResponse, buildSuccessResponse } from "../utils"

const { 
    Players, 
    scores 
} = model;


class Player {
    static async add(req, res) {

        try {
            const {
                name,
                username
            } = req.body;
    
            const players = await Players
            .create({
                name,
                username
            });

            return buildSuccessResponse(res, {
                statusCode: 201,
                message: "User successfully created",
                players
            });
        } catch (error) {
            return buildErrorResponse(res, error);
        }
    }

    static async submit(req, res) {
        try {
            let error;
            const {
                score,
                matchName,
                kills
            } = req.body;

            if (score === null || score === "" || score === undefined) {
                error = {
                    statusCode: 400,
                    message: "Score is required"
                }
                throw error
            }

            if (matchName === null || matchName === "" || matchName === undefined) {
                error = {
                    statusCode: 400,
                    message: "Match name is required"
                }
                throw error;
            }

            if (kills === null || kills === "" || kills === undefined) {
                error = {
                    statusCode: 400,
                    message: "Kills is required"
                }
                throw error;
            }

            const { playerId } = req.params;

            if (playerId === null || playerId === undefined || playerId === "") {
                error = {
                    statusCode: 400,
                    message: "Player id is required"
                }
                throw error;
            }
            
            const player = await Players.findOne({
                where: {
                    id: playerId
                },
                raw: true
            });
            // check if the player exists
            if (player === null) {
                error = {
                    statusCode: 404,
                    message: "This player doesn't exists"
                }
                throw error;
            }

            
            const scoreData = await scores
            .create({
                scores: score,
                match_name: matchName,
                kills,
                playerId,
                time: moment(new Date()).format("YYYY-MM-DD HH:mm:ss")
            }, {
                raw: true
            });
            
            return res.status(201).json({
                success: true,
                message: "score submitted successfully",
                scoreData
            })
        } catch (error) {
            return buildErrorResponse(res, error);
        }
    }

    static async fetchPlayerStats(req, res) {
        try {
            let error;

            const { playerId } = req.params;

            if (playerId === null || playerId === undefined || playerId === "") {
                error = {
                    statusCode: 400,
                    message: "Player id is required"
                }
                throw error;
            }

            const query = `SELECT "s"."scores" as score, "s"."match_name" as match, "s"."kills"
            FROM scores s
            WHERE "s"."playerId"=$1`;

            const bindParam = {
                bind: [playerId],
                type: Sequelize.QueryTypes.SELECT
            }

            const playerStats = await sequelize.query(query, bindParam)

            if (playerStats.length <= 0) {
                error = {
                    statusCode: 404,
                    message: "No stats present for this player"
                }
                throw error;
            }

            return buildSuccessResponse(res, {
                statusCode: 200,
                PlayersStats: playerStats
            })

        } catch (error) {
            return buildErrorResponse(res, error);
        }
    }

    static async fetchStats(req, res) {
        try {
            let error;

            const {
                match,
                time
            } = req.query;

            let timePeriod = ""

            if (time) {
                const timeArray = time.split("-");
                if (timeArray[0] === "now") {
                    const splitTime = timeArray[1].split("");
                    if (splitTime[1] === "m") {
                        timePeriod = moment(new Date()).subtract(splitTime[0], "minutes").format("YYYY-MM-DD HH:mm:ss");
                    }
                    else if (splitTime[1] === "h") {
                        timePeriod = moment(new Date()).subtract(splitTime[0], "hour").format("YYYY-MM-DD HH:mm:ss");
                    }
                }
            }

            const baseWhereCondition = "WHERE 1=1 ";
            const matchWhereCondition = (match !== "") ? `AND "s"."match_name"='${match}' ` : "";
            const timeWhereCondition = (timePeriod !== "") ? `AND "s"."time" >= '${timePeriod}'` : "";

            const whereCondition = baseWhereCondition.concat(matchWhereCondition).concat(timeWhereCondition);

            const query = `SELECT "p"."username", "s"."scores" as scores, "s"."kills"
            FROM "Players" "p"
            INNER JOIN scores s ON "p"."id" = "s"."playerId"
            ${whereCondition}
            ORDER BY "s"."scores" DESC`

            const bindParam = {
                type: Sequelize.QueryTypes.SELECT
            }

            const matchStats = await sequelize.query(query, bindParam);
            if (matchStats.length <= 0) {
                error = {
                    statusCode: 404,
                    message: "No stats present for this match"
                }
                throw error;   
            }

            return buildSuccessResponse(res, {
                statusCode: 200,
                PlayersStats: matchStats
            })

        } catch (error) {
            return buildErrorResponse(res, error);
        }
    }

}

export default Player;