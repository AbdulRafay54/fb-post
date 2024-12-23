import User from "../models/usermodel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const generateAccessToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.ACCESS_JWT_SECRET, {
    expiresIn: "6h",
  });
};
const generateRefreshToken = (user) => {
  return jwt.sign({ email: user.email }, process.env.REFRESH_JWT_SECRET, {
    expiresIn: "7d",
  });
};

// register user

const registerUser = async (req, res) => {
  const { email, password, fullName, userName } = req.body;

  if (!email || !password || !fullName || !userName) {
    return res.status(400).json({ message: "all the fields are required" });
  }

  const user = await User.findOne({ email: email });
  if (user) return res.status(401).json({ message: "user already exists" });

  try {
    const createUser = await User.create({
      email,
      password,
      userName,
      fullName,
    });
    res.json({
      message: "user registered successfully",
      data: createUser,
    });
  } catch (error) {
    console.log(error);
  }
};

// login user

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email) return res.status(400).json({ message: "email required" });
  if (!password) return res.status(400).json({ message: "password required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: "no user found" });

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid)
    return res.status(400).json({ message: "incorrect password" });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, { http: true, secure: false });

  res.json({
    message: "user logged in successfully",
    accessToken,
    refreshToken,
    data: user,
  });
};

// logout user
const logoutUser = async (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "user logged out successfully" });
};

// refresh token
const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "no refresh token found!" });

  const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);

  const user = await User.findOne({ email: decodedToken.email });

  if (!user) return res.status(404).json({ message: "invalid token" });

  const generateToken = generateAccessToken(user);
  res.json({ message: "access token generated", accessToken: generateToken });
};

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
};
