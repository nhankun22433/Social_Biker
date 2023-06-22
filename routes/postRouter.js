const router = require('express').Router()
const postCtrl = require('../controllers/postCtrl')
const auth = require('../middleware/auth')
const { classifyImage } = require('../utils/common')

router.get('/prediction-img', async (req, res) => {
  try {
    console.log('load image...')
    const result = await classifyImage(
      'https://res.cloudinary.com/divarx8nr/image/upload/v1686649831/biker/lanqwzuohqdjnxykzeln.jpg'
    )
    console.log(result)

    res.status(200).json({
      data: result,
    })
  } catch (error) {
    res.status(500).json({
      error,
    })
  }
})

router
  .route('/posts')
  .post(auth, postCtrl.createPost)
  .get(auth, postCtrl.getPosts)

router
  .route('/post/:id')
  .patch(auth, postCtrl.updatePost)
  .get(auth, postCtrl.getPost)
  .delete(auth, postCtrl.deletePost)

router.patch('/post/:id/like', auth, postCtrl.likePost)

router.patch('/post/:id/unlike', auth, postCtrl.unLikePost)

router.get('/user_posts/:id', auth, postCtrl.getUserPosts)

router.get('/post_discover', auth, postCtrl.getPostsDicover)

router.patch('/savePost/:id', auth, postCtrl.savePost)

router.patch('/unSavePost/:id', auth, postCtrl.unSavePost)

router.get('/getSavePosts', auth, postCtrl.getSavePosts)

module.exports = router
