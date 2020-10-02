import model, { sequelize, Sequelize } from "../models";
import moment from "moment";
import { buildErrorResponse, buildSuccessResponse } from "../utils"


class Score {

    static async fetchLeaderBoard(req, res) {
        
        try {
            let error;
            const {
                matchName,
                time,
                limit
            } = req.query;

            let timePeriod = ""

            if (time) {
                const timeArray = time.split("-");
                if (timeArray[0] === "now") {
                    const splitTime = timeArray[1].split("");
                    if (splitTime.includes("m")) {
                        const minutes = splitTime.slice(0, splitTime.indexOf("m")).join("");
                        timePeriod = moment.utc(new Date()).subtract(parseInt(minutes), "minutes").format("YYYY-MM-DD HH:mm:ss");
                    }
                    else if (splitTime.includes("h")) {
                        const hours = splitTime.slice(0, splitTime.indexOf("h")).join("");
                        timePeriod = moment.utc(new Date()).subtract(parseInt(hours), "hour").format("YYYY-MM-DD HH:mm:ss");
                    }
                    else if (splitTime.includes("d")) {
                        const days = splitTime.slice(0, splitTime.indexOf("d")).join("");
                        timePeriod = moment.utc(new Date()).subtract(parseInt(days), "days").format("YYYY-MM-DD HH:mm:ss");
                    }
                }
            }
            
            const baseWhereCondition = "WHERE 1=1 ";
            const matchWhereCondition = (matchName !== "" && matchName !== null && matchName !== undefined) ? `AND "s"."match_name"='${matchName}' ` : "";
            const timeWhereCondition = (timePeriod !== "" && timePeriod !== null && timePeriod !== undefined) ? `AND "s"."time" >= '${timePeriod}'` : "";

            const whereCondition = baseWhereCondition.concat(matchWhereCondition).concat(timeWhereCondition);

            const limitCondition = (limit > 0) ? `LIMIT ${limit}` : "";

            const query = `SELECT "p"."id", "p"."username", MAX("s"."scores") as score, "s"."match_name", (SELECT kills from scores where "playerId" = "p"."id" and scores=MAX("s"."scores") limit 1) as kills
            FROM "Players" "p"
            INNER JOIN scores s ON "p"."id" = "s"."playerId"
            ${whereCondition} 
            GROUP by "p"."id", "p"."username", "s"."match_name"
            ORDER BY MAX("s"."scores") DESC
            ${limitCondition}`;
            const scoresData = await sequelize.query(query, { type: Sequelize.QueryTypes.SELECT })

            if (scoresData.length <= 0) {
                error = {
                    statusCode: 404,
                    message: "No scores present"
                }
                throw error;
            }

            const leaderBoardScors = scoresData.map((item, key) => {
                return {
                    username: item.username,
                    rank: key+1,
                    kills: item.kills,
                    score: item.score
                }

            })

            return buildSuccessResponse(res, {
                statusCode: 200,
                stats: leaderBoardScors
            })

        } catch (error) {
            return buildErrorResponse(res, error);
        }
    }

}

export default Score;