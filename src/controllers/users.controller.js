import User from "../models/usermodel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Generate Access Token
const generateAccessToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.ACCESS_JWT_SECRET, {
    expiresIn: "6h",
  });
};

// Generate Refresh Token
const generateRefreshToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "7d",
  });
};

// Register User
const registerUser = async (req, res) => {
  const { email, password, fullName, userName } = req.body;

  if (!email || !password || !fullName || !userName) {
    return res.status(400).json({ message: "All the fields are required" });
  }

  const user = await User.findOne({ email: email });
  if (user) return res.status(401).json({ message: "User already exists" });

  try {
    const createUser = await User.create({
      email,
      password,
      userName,
      fullName,
    });
    res.json({
      message: "User registered successfully",
      data: createUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error occurred while registering user" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: "Email required" });
  if (!password) return res.status(400).json({ message: "Password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "No user found" });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return res.status(400).json({ message: "Incorrect password" });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, { http: true, secure: false });

  res.json({
    message: "User logged in successfully",
    accessToken,
    refreshToken,
    data: user,
  });
};

// Logout User
const logoutUser = async (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "User logged out successfully" });
};

// Refresh Token
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token found!" });

  try {
    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

    const user = await User.findOne({ email: decodedToken.email });

    if (!user) return res.status(404).json({ message: "Invalid token" });

    const generateToken = generateAccessToken(user);
    res.json({ message: "Access token generated", accessToken: generateToken });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error occurred while refreshing token" });
  }
};

export { registerUser, loginUser, logoutUser, refreshToken };
