const router = require('express').Router();
const { User, BlogPosts, Comment } = require('../models');
const withAuth = require('../utils/auth');

// router.get("/", async (req, res) => {
//     const pageData = await BlogPosts.findAll(
//         { raw: true }
//     ).catch((err) => {
//         res.json(err);
//     });

//     res.render("main", {
//         existingBlog: pageData,
//     })

// });

router.get("/", async (req, res) => {
    try {
        const blogPosts = await BlogPosts.findAll();
        const blogPostsWithExcerpt = blogPosts.map((blogPost) => {
            const excerpt = blogPost.get("excerpt");
            console.log(`Excerpt for blog post ${blogPost.topic}: ${excerpt}`);
            return {
                ...blogPost.dataValues,
                excerpt,
            };
        });
        res.render("main", { existingBlog: blogPostsWithExcerpt });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Error fetching blog posts" });
    }
});


router.get("/login", async (req, res) => {
    res.render("login")
});

router.get("/signup", async (req, res) => {
    res.render("signup")
});

router.get("/dashboard", withAuth, async (req, res) => {
    const user_id = req.session.userId;
    const pageData = await BlogPosts.findAll(
        {
            // raw: true,
            where: {
                user_id: user_id,
            }
        }
    ).catch((err) => {
        res.json(err);
        console.log(err)
    });
        // Add a new property to each blog post object with the excerpt
        const blogPostsWithExcerpt = pageData.map((blogPost) => {
            const excerpt = blogPost.get("excerpt"); 
            return {
                ...blogPost.dataValues,
                excerpt,
            };
        });
    const userData = await User.findOne({
        raw: true,
        attributes: {
            exclude: [
                "password",
            ]
        },
        where: {
            id: user_id,
        }
    });
    res.render("dashboard", {
        blogs: blogPostsWithExcerpt,
        username: userData.username,
        loggedIn: req.session.loggedIn,
    })
});

router.get("/homepagestart", withAuth, async (req, res) => {
    const pageData = await BlogPosts.findAll({
        include: [
            {
                model: User,
                attributes: ["username"],
                as: 'user'
            }
        ]
    }
    ).catch((err) => {
        res.json(err);
    });
            // Add a new property to each blog post object with the excerpt and user name
            const blogPostsWithExcerpt = pageData.map((blogPost) => {
                const excerpt = blogPost.get("excerpt"); 
                return {
                    ...blogPost.dataValues,
                    excerpt,
                    username: blogPost.user.username, // access the username
                };
            });

    res.render("homepagestart", {
        loggedIn: req.session.loggedIn,
        blogs: blogPostsWithExcerpt,
    })

});

router.get("/homepage/:id", withAuth, async (req, res) => {
    try {
        const blogData = await BlogPosts.findByPk(req.params.id, {
            raw: true,
            include: [
                {
                    model: User,
                    attributes: ["username"],
                    as: 'user'
                }
            ],
        });

        const commentData = await Comment.findAll({
            where: {
                blog_id: req.params.id,
            },
            include: [
                {
                    model: User,
                    attributes: [
                        "username",
                    ]
                }
            ],
        });

        const comments = commentData.map((comment) => comment.get({ plain: true }));
        req.session.save(() => {
            req.session.blog_id = blogData.id;
        })
        res.render("homepage", {
            blogUserName: blogData["user.username"],
            comments,
            blogData,
            loggedIn: req.session.loggedIn,
            user_name: commentData["user.username"]
        });
    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
});

router.get("/dashboard/:id", withAuth, async (req, res) => {
    try {
        const blogData = await BlogPosts.findByPk(req.params.id, {
            raw: true,

        });
        res.render("editblogpost", {
            blogData,
            loggedIn: req.session.loggedIn,
        })
    } catch (err) {
        console.log(err);
        res.status(500).json(err)
    }
})

router.get("/newblogpost", withAuth, async (req, res) => {
    res.render("newblogpost", {
        loggedIn: req.session.loggedIn,
    })
});

module.exports = router;
