import express from 'express';
import logger from 'morgan';
import bodyParser from 'body-parser';
import config from "./server/config/config.json";
import routes from "./server/routes";

const appConfig = config[process.env.NODE_ENV];
const app       = express();

app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
routes(app);

app.get('*', (req, res) => res.status(200).send({
    message: 'Welcome to the game leaderboard API',
}));

export default app;