
import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "title is required"],
    },
    content: {
      type: String,
      required: [true, "description is required"],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users", // Reference to the  model
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Users", // Reference to the  model
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comments", // Reference to the  model
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("posts", postSchema);
