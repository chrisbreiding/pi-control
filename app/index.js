const execa = require('execa')
const express = require('express')
const handlebars = require('express-handlebars')
const config = require('../config')

const app = express()

app.engine('handlebars', handlebars())
app.set('view engine', 'handlebars')
app.use(express.static(`${__dirname}/../public`))
app.use(express.static(`${__dirname}/public`))

app.get('/', (req, res) => {
  res.render('index', {
    title: config.title,
    camUrl: config.camUrl,
  })
})

app.get('/control', (req, res) => {
  res.render('control', { title: `${config.title} | Control` })
})

const handleCommand = (command, ...args) => (req, res) => {
  if (!config.installed) {
    return res.json({ ok: false })
  }

  execa(command, ...args, { stdio: 'inherit' })
  .then(() => {
    res.json({ ok: true })
  })
  .catch((error) => {
    res.json({ ok: false, error: (error || {}).stack })
  })
}

app.post('/reboot', handleCommand('reboot'))
app.post('/shutdown', handleCommand('shutdown', '-h', 'now'))
app.post('/restart-camera', handleCommand('service', 'motion', 'restart'))

app.listen(config.port, () => {
  console.log('Listening on 3000...') // eslint-disable-line no-console
})
