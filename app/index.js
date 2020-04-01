const express = require('express')
const handlebars = require('express-handlebars')
const request = require('request')
const sudo = require('sudo-js')

const config = require('../config')

const app = express()

if (config.password) {
  sudo.setPassword(config.password)
}

app.engine('handlebars', handlebars())
app.set('view engine', 'handlebars')
app.use(express.static(`${__dirname}/../public`))
app.use(express.static(`${__dirname}/public`))

app.get('/', (req, res) => {
  req.pipe(request(config.camUrl)).pipe(res)
})

app.get('/control', (req, res) => {
  res.render('control', { title: `${config.title} | Control` })
})

const handleCommand = (...args) => (req, res) => {
  if (!config.password) {
    return res.json({ ok: false })
  }

  sudo.exec(args, function (error) {
    if (!error) {
      return res.json({ ok: true })
    }

    res.json({ ok: false, error: error.stack || error.message })
  })
}

app.post('/reboot', handleCommand('reboot'))
app.post('/shutdown', handleCommand('shutdown', '-h', 'now'))
app.post('/restart-camera', handleCommand('service', 'motion', 'restart'))

app.listen(config.port, () => {
  console.log('Listening on 3000...') // eslint-disable-line no-console
})
