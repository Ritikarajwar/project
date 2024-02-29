import { MongoClient } from "mongodb";
const connection =MongoClient.connect("mongodb://127.0.0.1:27017")
export const dbName='tufaanii'
export default connection;
