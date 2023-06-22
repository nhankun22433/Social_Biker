const tmImage = require('@teachablemachine/image')

const classifyImage = async (imageURL) => {
  const modelURL =
    'https://teachablemachine.withgoogle.com/models/jIYN5u9iK/model.json' // Replace with your model URL
  const metadataURL =
    'https://teachablemachine.withgoogle.com/models/jIYN5u9iK/metadata.json' // Replace with your model URL

  const model = await tmImage.load(modelURL, metadataURL)
  const image = await tmImage.create.imageFromUrl(imageURL) // Load the image from the provided URL
  const prediction = await model.predict(image)

  return prediction
}

module.exports = { classifyImage }
