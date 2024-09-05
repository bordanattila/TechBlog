const router = require("express").Router();
const { User, BlogPosts, Comment } = require("../../models");


// Create new user
router.post("/signup", async (req, res) => {
  try {
    const userData = await User.create({
      username: req.body.username,
      password: req.body.password,
    });
    console.log("test: ", userData.id)
    req.session.save(() => {
      req.session.loggedIn = true;
      req.session.userId = userData.id;
      res.status(200).json(userData);
    });
    console.log(req.session)
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Login existing user

router.post("/login", async (req, res) => {
  try {
    const userData = await User.findOne({
      where: {
        username: req.body.username,
      },
    });

    if (!userData) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password. Please try again!' });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    if (!validPassword) {
      res
        .status(400)
        .json({ message: 'Incorrect email or password. Please try again!' });
      return;
    }

    req.session.save(() => {
      req.session.loggedIn = true;
      req.session.userId = userData.id;
      res
        .status(200)
        .json({ user: userData, message: "You are now logged in!" });

    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// Save comment on existing post
router.post("/savecomment/:id", async (req, res) => {

  try {
    const commentData = await Comment.create({
      comment_content: req.body.commentText,
      user_id: req.session.userId,
      blog_id: req.params.id,

    });
    res.status(200).json(commentData)
  } catch (err) {
    res.status(400).json(err)
    console.log(err)
  }
});

// Save new blog post
router.post("/saveblogpost", async (req, res) => {
  textToFormat = req.body.blogText
  function formatText(textToFormat) {
  return textToFormat.replace(/\n/g, '<br>');
  }
  try {
    const newPostData = await BlogPosts.create({
      topic: req.body.blogTopic,
      content: textToFormat,
      user_id: req.session.userId,
    });
    res.status(200).json(newPostData)
  } catch (err) {
    res.status(400).json(err)
    console.log(err)
  }
});

// Update blog post
router.put("/dashboard/:id", async (req, res) => {
  try {
    const blogData = await BlogPosts.update(
      {
        topic: req.body.postTopic,
        content: req.body.postContent,
      },
      {
        where: {
          id: req.params.id,
        }
      }
    );
    res.status(200).json(blogData);
  } catch (err) {
    res.status(400).json(err)
    console.log(err)
  }
})

// Delete Blog Post
router.delete("/dashboard/:id", async (req, res) => {
  try {
    const deletePost = await BlogPosts.destroy({
      where: {
        id: req.params.id,
      }
    });
    res.status(200).json(deletePost);
  } catch (err) {
    res.status(400).json(err)
    console.log(err)
  }
});

// Logout
router.post("/logout", (req, res) => {
  if (req.session.loggedIn) {
    req.session.destroy(() => {
      res.status(204).end();
      console.log("logged out")
    });
  } else {
    res.status(404).end();
  }
});

module.exports = router;