import mongoose from "mongoose";
import chalk from "chalk";

const DB_CONNECTION_STRING = process.env.DB_MONGOSH_CONNECTION_STRING;

async function connectToDB() {
    try {
        const connectionInstance = await mongoose.connect(`${DB_CONNECTION_STRING}`, { dbName: "Users" });
        console.log(chalk.cyan("DB connected successfully || PORT: " + connectionInstance.connection.port));
        return;

    } catch (error) {
        throw error;
    }
}

export { connectToDB };
