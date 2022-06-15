const { request } = require('express')
const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()

const customers = []

app.listen(3000, () => console.log('listen on port 3000'))
app.use(express.json())

const verifyIfExistAccountCPF = (req, res, next) => {
  const { cpf } = req.params
  const customer = customers.find((customer) => customer.cpf === cpf)

  if (!customer) {
    return res.status(400).send({ error: 'customer not found' })
  }
  req.customer = customer
  return next()
}

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

app.get('/statement/:cpf', verifyIfExistAccountCPF, (req, res) => {
  const { customer } = req
  return res.json(customer.statement)
})
