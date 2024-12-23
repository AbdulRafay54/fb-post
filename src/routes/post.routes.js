
import express from "express";
import {
  addComment,
  addPost,
  getPostDetails,
  likePost,
} from "../controllers/post.controllers.js";

const router = express.Router();

router.post("/addpost", addPost);
router.post("/post/:id/like", likePost);
router.post("/post/:id/comment", addComment);
router.get("/post/:id", getPostDetails);

export default router;
