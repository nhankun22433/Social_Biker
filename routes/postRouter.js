const router = require('express').Router()
const postCtrl = require('../controllers/postCtrl')
const auth = require('../middleware/auth')
const { classifyImage } = require('../utils/common')
const TeachableMachine = require('@sashido/teachablemachine-node')

router.get('/prediction-img', async (req, res) => {
  const model = new TeachableMachine({
    modelUrl: 'https://teachablemachine.withgoogle.com/models/LPRhBBSky/',
  })

  model
    .classify({
      imageUrl:
        // 'https://media-blog.sashido.io/content/images/2020/09/SashiDo_Dog.jpg',
        // 'https://muaxe.minhlongmoto.com/wp-content/uploads/2019/11/xsr155-mau-xanh-duong.jpg',
        'https://res.cloudinary.com/divarx8nr/image/upload/v1687424980/biker/gekihifuasz4fsqrozlv.jpg',
      // 'https://thietbiruaxegiare.net/wp-content/uploads/2019/04/biker-chan-chinh.jpg',
    })
    .then((predictions) => {
      predictions.forEach((item) => {
        item.score = parseFloat(item.score).toFixed(5)
      })
      console.log('Predictions:', predictions)
    })
    .catch((e) => {
      console.log('ERROR', e)
    })

  res.status(200).json({ success: true })
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

router.put('/post/:id/like', auth, postCtrl.likePost)

router.put('/post/:id/unlike', auth, postCtrl.unLikePost)

router.get('/user_posts/:id', auth, postCtrl.getUserPosts)

router.get('/post_discover', auth, postCtrl.getPostsDicover)

router.put('/savePost/:id', auth, postCtrl.savePost)

router.put('/unSavePost/:id', auth, postCtrl.unSavePost)

router.get('/getSavePosts', auth, postCtrl.getSavePosts)

module.exports = router
