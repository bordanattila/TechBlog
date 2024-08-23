const router = require("express").Router();
const { User } = require("../../models");
const BlogPosts = require('../../models/blogPost');

// Create new user
router.post("/signup", async (req, res) => {
    try {
      const userData = await User.create({
        username: req.body.username,
        password: req.body.password,
      });
      req.session.save(() => {
        req.session.loggedIn = true;  
        res.status(200).json(userData);
      });
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
          .json({ message: "Incorrect username or password. Please try again!" });
        return;
      }

      const validPassword = await userData.checkPassword(req.body.password);

      if (!validPassword) {
        res
          .status(400)
          .json({ message: "Incorrect username or password. Please try again!" });
        return;
      }

      req.session.save(() => {
        req.session.loggedIn = true;  
        req.session.userID = userData.id;
        res
          .status(200)
          .json({ user: userData, message: "You are now logged in!" });

      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
  });

  // Dashoard
  router.get("/dashboard ", async (req,res) => {
    const userData = await User.findByPk({
      where: {
        id: 1,
      },
      include: [
        {
          model: BlogPosts,
          attributes: [
            "id",
            "topic",
            "content",
            "user_id",
          ],
        },
      ],
    }).catch((err) => {
      res.json(err);
  });

  //   const pageData = await BlogPosts.findAll(
  //     { 
  //     where: {
  //       user_id: 1,
  //     } }
  // ).catch((err) => {
  //     res.json(err);
  // });

    res.render("dashboard", {      
      user: userData,
      userBlogs: pageData
    })
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