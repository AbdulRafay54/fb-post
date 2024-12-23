import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    commentBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Users",
    },
    commentText: {
      type: String,
      required: [true, "Comment is required"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Comments", commentSchema);