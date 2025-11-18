import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET;

export const authMiddleware = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
    return res.status(401).send("No token provided");
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded
    next();
  } catch (err) {
    return res.status(401).send("Invalid or expired token");
  }
};