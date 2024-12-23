
import express from "express";
import {
  addBlog,
  allBlogs,
  deleteBlog,
  singleBlog,
  updateBlog,
} from "../controllers/blogs.controllers.js";

const router = express.Router();
router.get("/allblogs", allBlogs);
router.get("/singleblog/:id", singleBlog);
router.post("/addblog", addBlog);
router.delete("/deleteblog/:id", deleteBlog);
router.put("/updateblog/:id", updateBlog);

export default router;
