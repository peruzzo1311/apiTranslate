const express = require('express')
const multer = require('multer')
const fs = require('fs')
const { Configuration, OpenAIApi } = require('openai')

const app = express()
const upload = multer({ dest: 'uploads/' })
const configuration = new Configuration({
  apiKey: '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',
})
const openai = new OpenAIApi(configuration)

function base64ToFile(fileName, file) {
  fs.writeFile(`uploads/${fileName}`, file, 'base64', (error) => {
    if (error) {
      console.log(error)
    }
  })
}

app.use(express.json())

app.post('/translate', async (req, res) => {
  const { prompt } = req.body

  const response = await openai.createCompletion({
    model: 'text-davinci-003',
    prompt: prompt,
    max_tokens: 2048,
    temperature: 1.0,
  })

  res.send(response.data.choices[0].text)
})

app.post('/transcription', async (req, res) => {
  const { fileName, file } = req.body

  base64ToFile(fileName, file)

  const response = await openai.createTranscription(
    fs.createReadStream(`uploads/${fileName}`),
    'whisper-1'
  )

  res.send(response.data.text)

  fs.unlink(`uploads/${fileName}`, function (err) {
    if (err) {
      console.error(err)
    }
  })
})

app.get('/', (req, res) => {
  res.json({ message: 'Test' })
})

app.listen(3000, () => {
  console.log('Server started on port 3000')
})
