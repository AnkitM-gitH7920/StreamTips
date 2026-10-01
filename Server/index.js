import "dotenv/config";
import app from "./app.js";
import chalk from "chalk";
import { connectToDB } from "./database/connectDB.js";
import Redis from "ioredis"

const SERVER_PORT = process.env.PORT || 8080;

const redis = new Redis({
     host: process.env.REDIS_HOST,
     port: process.env.REDIS_PORT
})

redis.on("connect", (res, error) => {
     if (error) {
          console.log(chalk.red("Error connecting to redis DB!!!"));
          console.log(error);
     } else {
          console.log(chalk.cyan("Redis DB connected successfully"));
          connectToDB()
               .then((res) => {
                    app.listen(SERVER_PORT, () => {
                         console.log(chalk.cyan("Server listening at PORT : " + chalk.red(SERVER_PORT)));
                    })
               }).catch((err) => {
                    console.log(chalk.bgRed("Something went wrong!!!"));
                    console.log(err);
               })

     }
})

export default redis;
