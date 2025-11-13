import { connect } from "mongoose";
import dotenv from "dotenv";

dotenv.config();

try {
  await connect(process.env.ATLAS_URI!);
  console.log("Connection to MongoDB server established");
} catch (error) {
  console.log(error);
}