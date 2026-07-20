import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mediaUrl: [{ type: String, required: true }],
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    caption: { type: String, default: '', maxlength: 2200 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [commentSchema],
    hashtags: [{ type: String, lowercase: true }],
  },
  { timestamps: true }
);

postSchema.pre('save', function (next) {
  if (this.caption) {
    const tags = this.caption.match(/#[\w]+/g);
    this.hashtags = tags ? tags.map((t) => t.slice(1).toLowerCase()) : [];
  }
  next();
});

const Post = mongoose.model('Post', postSchema);
export default Post;
