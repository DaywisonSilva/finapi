const express = require('express')
const { v4: uuidv4 } = require('uuid')

const app = express()

const customers = []

app.listen(3000, () => console.log('listen on port 3000'))

app.use(express.json())

app.get('/', (_, res) => {
  res.json({ message: 'works fine' })
})

app.post('/account', (req, res) => {
  const { cpf, name } = req.body
  const id = uuidv4()
  const customerAlreadyExists = customers.some(
    (customer) => customer.cpf === cpf
  )

  if (customerAlreadyExists) {
    return res.status(400).send({ error: 'customer already exists' })
  }
  if (!cpf || !name) {
    return res.status(400).send({ error: 'Fields cpf, name are required' })
  }

  customers.push({ cpf, name, id, statement: [] })

  return res.status(201).send()
})