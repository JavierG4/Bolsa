import { connect } from "mongoose";
import dotenv from "dotenv";
import { MongoMemoryServer } from "mongodb-memory-server";

dotenv.config();

let memServer: MongoMemoryServer | null = null;

export const connectDB = async () => {
  const env = process.env.NODE_ENV;

  try {
    if (env === "test" && process.env.MEMORY_DB === "true") {
      // Conectar a MongoDB en memoria
      memServer = await MongoMemoryServer.create();
      const uri = memServer.getUri();
      await connect(uri);
      console.log("🧪 Connected to in-memory MongoDB for testing");
    } else {
      const uri = process.env.ATLAS_URI;
      if (!uri) throw new Error("ATLAS_URI is not defined");
      await connect(uri);
      console.log("🔗 Connected to real MongoDB");
    }
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    process.exit(1);
  }
};

// Para cerrar la conexión (opcional, si quieres limpiar la memoria)
export const disconnectDB = async () => {
  await import("mongoose").then(mongoose => mongoose.disconnect());
  if (memServer) await memServer.stop();
};
