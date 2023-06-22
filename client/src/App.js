import { useEffect } from 'react'
import { Route, BrowserRouter as Router } from 'react-router-dom'

import PageRender from './customRouter/PageRender'
import PrivateRouter from './customRouter/PrivateRouter'

import Home from './pages/home'
import Login from './pages/login'
import Register from './pages/register'

import Alert from './components/alert/Alert'
import Header from './components/header/Header'
import StatusModal from './components/StatusModal'

import { useDispatch, useSelector } from 'react-redux'
import { refreshToken } from './redux/actions/authAction'
import { getPosts } from './redux/actions/postAction'
import { getSuggestions } from './redux/actions/suggestionsAction'

import io from 'socket.io-client'
import { GLOBALTYPES } from './redux/actions/globalTypes'
import SocketClient from './SocketClient'

import Peer from 'peerjs'
import CallModal from './components/message/CallModal'
import { getNotifies } from './redux/actions/notifyAction'

import * as tf from '@tensorflow/tfjs'
import * as tmImage from '@teachablemachine/image'

function App() {
  const { auth, status, modal, call } = useSelector((state) => state)
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(refreshToken())

    const socket = io()
    dispatch({ type: GLOBALTYPES.SOCKET, payload: socket })
    return () => socket.close()
  }, [dispatch])

  useEffect(() => {
    if (auth.token) {
      dispatch(getPosts(auth.token))
      dispatch(getSuggestions(auth.token))
      dispatch(getNotifies(auth.token))
    }
  }, [dispatch, auth.token])

  useEffect(() => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification')
    } else if (Notification.permission === 'granted') {
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(function (permission) {
        if (permission === 'granted') {
        }
      })
    }
  }, [])

  useEffect(() => {
    const newPeer = new Peer(undefined, {
      path: '/',
      secure: true,
    })

    dispatch({ type: GLOBALTYPES.PEER, payload: newPeer })
  }, [dispatch])

  useEffect(() => {
    const modelURL =
      'https://teachablemachine.withgoogle.com/models/jIYN5u9iK/model.json' // Replace with your model URL
    const metadataURL =
      'https://teachablemachine.withgoogle.com/models/jIYN5u9iK/metadata.json' // Replace with your model URL
    const classifyImage = async (imageUrl) => {
      const model = await tmImage.load(modelURL, metadataURL)
      console.log('model:', model)
      const classes = model.getClassLabels()

      const image = new Image()
      image.crossOrigin = 'Anonymous' // Enable CORS if needed
      image.src = imageUrl

      const preprocessImage = (imageTensor) => {
        const processedTensor = imageTensor.resizeBilinear([224, 224]).toFloat()
        const expandedTensor = processedTensor.expandDims()
        return expandedTensor
      }

      const makePredictions = async (imageTensor) => {
        const model = await tf.loadLayersModel(modelURL)
        const processedTensor = preprocessImage(imageTensor)
        const predictions = await model.predict(processedTensor).dataSync()

        console.log('process:', predictions)

        // Cleanup
        model.dispose()
        processedTensor.dispose()

        return predictions
      }

      image.onload = async () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        canvas.width = image.width
        canvas.height = image.height
        ctx.drawImage(image, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        const imageTensor = tf.browser.fromPixels(imageData)
        // Process the imageTensor and make predictions
        const predictions = await makePredictions(imageTensor)
        console.log('Predictions:', imageTensor, predictions)
        console.log(predictions)

        const predictedLabelIndex = predictions.indexOf(
          Math.max(...predictions)
        )
        const predictedLabel = classes[predictedLabelIndex]

        // Display the predicted label
        console.log('Predicted Label:', predictedLabel, predictions)

        // Cleanup
        imageTensor.dispose()
      }

      image.onerror = () => {
        console.log('Failed to load image:', imageUrl)
      }

      return 'load...'
    }

    ;(async () => {
      const result = await classifyImage(
        'https://res.cloudinary.com/divarx8nr/image/upload/v1687251623/opf44ncv3lscltovrjss.jpg'
      )
      console.log('results: ', result)
    })()
  }, [])

  return (
    <Router>
      <Alert />

      <input type='checkbox' id='theme' />
      <div className={`App ${(status || modal) && 'mode'}`}>
        <div className='main'>
          {auth.token && <Header />}
          {status && <StatusModal />}
          {auth.token && <SocketClient />}
          {call && <CallModal />}

          <Route exact path='/' component={auth.token ? Home : Login} />
          <Route exact path='/register' component={Register} />

          <PrivateRouter exact path='/:page' component={PageRender} />
          <PrivateRouter exact path='/:page/:id' component={PageRender} />
        </div>
      </div>
    </Router>
  )
}

export default App
