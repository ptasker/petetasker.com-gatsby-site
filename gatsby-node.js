const path = require(`path`)
const { createFilePath } = require(`gatsby-source-filesystem`)

exports.createPages = async ({ graphql, actions }) => {
  const { createPage } = actions

  const blogPost = path.resolve(`./src/templates/blog-post.js`)

  const postsResult = await graphql(
    `
      {
        allMarkdownRemark(
          sort: { fields: [frontmatter___date], order: DESC }
          limit: 1000
        ) {
          edges {
            node {
              fields {
                slug
              }
              frontmatter {
                title
                type
                permalink
              }
            }
          }
        }
      }
    `
  )

  if (postsResult.errors) {
    throw postsResult.errors
  }

  // Create blog posts pages.
  const posts = postsResult.data.allMarkdownRemark.edges

  posts.forEach((post, index) => {
    let previous, next

    const { node } = post
    if (node.frontmatter.type === "post") {
      previous = index === posts.length - 1 ? null : posts[index + 1].node
    }

    if (node.frontmatter.type === "post") {
      next = index === 0 ? null : posts[index - 1].node
    }

    createPage({
      path: post.node.frontmatter.permalink
        ? post.node.frontmatter.permalink
        : post.node.fields.slug,
      component: blogPost,
      context: {
        slug: post.node.fields.slug,
        previous,
        next,
      },
    })
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `MarkdownRemark`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
