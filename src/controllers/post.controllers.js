import jwt from "jsonwebtoken";
import Post from "../models/post.model.js";
import User from "../models/usermodel.js";
import Comment from "../models/comments.model.js";

const getUserDetail = async (req) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "no refresh token found!" });

  const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET);
  const user = await User.findOne({ email: decodedToken.email });
  if (!user) {
    return console.log("User Not Found!");
  }
  return user;
};

const addPost = async (req, res) => {
  const { title, content } = req.body;
  if (!title || !content)
    return res.status(400).json({ message: "All The Field Are Required" });
  const user = await getUserDetail(req);
  if (!user) {
    return res
      .status(401)
      .json({ message: "User not found or not authenticated" });
  }
  const post = await Post.create({ title, content, author: user._id });

  res.status(200).json({
    message: "Post created successfully",
    post,
  });
};

const likePost = async (req, res) => {
  const postId = req.params.id;

  try {
    const user = await getUserDetail(req);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found or not authenticated" });
    }
    const post = await Post.findById(postId);

    if (!post.likes.includes(user._id)) {
      post.likes.push(user._id);
      await post.save();
    } else {
      res.status(200).json({
        message: "Post Already Like",
      });
      return;
    }

    res.status(200).json({
      message: "Post Like Successfully",
      length: post.likes.length,
      post,
    });
  } catch (error) {
    res.status(200).json({
      message: `Error Occured ${error}`,
    });
  }
};

const addComment = async (req, res) => {
  const { id } = req.params; // postId
  const { commentText } = req.body;

  if (!id || !commentText) {
    return res.status(400).json({
      message: "Post ID and Comment text are required",
    });
  }

  try {
    // Get user details from the token or session (you might need to adjust this based on your auth system)
    const user = await getUserDetail(req);
    if (!user) {
      return res
        .status(401)
        .json({ message: "User not found or not authenticated" });
    }

    // Create a new comment
    const comment = await Comment.create({
      commentBy: user._id, // Use user._id from getUserDetail
      commentText,
    });

    // Find the post and update the comments array
    const post = await Post.findByIdAndUpdate(
      id,
      {
        $push: { comments: comment._id }, // Ensure comment._id is correctly added
      },
      { new: true } // Ensure the updated post is returned
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Return the updated post and comment details
    res.status(200).json({ post, comment });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error adding comment", error: error.message });
  }
};

const getPostDetails = async (req, res) => {
  const postId = req.params.id; // ID of the post you want to retrieve

  try {
    // Find the post by its ID and populate the necessary fields
    const post = await Post.findById(postId)
      .populate("postedBy", "userName email") // Populating the postedBy field with the user's name and email
      .populate("comments", "commentText commentBy createdAt") // Populating the comments with comment text, user (commentBy), and creation date
      .populate({
        path: "comments",
        populate: {
          path: "commentBy", // Populating the commentBy field in the comment model
          select: "userName email", // Only include the name and email of the commentBy user
        },
      })
      .populate("likes", "userName email"); // Populating the likes field with the user's name and email

    // If post is not found, return a 404 error
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    const likes = post.likes.length;
    const comments = post.comments.length;

    // Return the post with populated details
    res.status(200).json({ likes, comments, post });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Error fetching post details", error: error.message });
  }
};

export { addPost, likePost, addComment, getPostDetails };