import jwt from "jsonwebtoken";

export const verifyJWT = (req, res, next) => {
  try {

    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();

  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};