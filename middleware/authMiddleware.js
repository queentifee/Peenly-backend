// const jwt = require("jsonwebtoken");
// const Guardian = require("../models/Guardian");

// const authMiddleware = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   const token = authHeader.split(" ")[1];

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const guardian = await Guardian.findById(decoded.id);

//     if (!guardian) {
//       return res.status(404).json({ message: "Guardian not found" });
//     }

//     req.guardian = { id: guardian._id }; // attaches `guardian.id` to request
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token" });
//   }
// };



// module.exports = authMiddleware;


// authMiddleware.js
const jwt = require("jsonwebtoken");
const Guardian = require ('../models/Guardian');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const guardian = await Guardian.findById(decoded.id);
    if (!guardian) {
      return res.status(404).json({ message: "Guardian not found" });
    }

    req.guardian = { id: guardian._id }; // ← this must be present
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
