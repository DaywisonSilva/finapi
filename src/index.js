const { request, response } = require('express')
const express = require('express')
const { v4: uuidv4 } = require('uuid')
const app = express()

const customers = []

app.listen(3000, () => console.log('listen on port 3000'))
app.use(express.json())

const getBalance = (statement) => {
  return statement.reduce((acc, operation) => {
    if (operation.type === 'credit') return acc + operation.amount
    return acc - operation.amount
  }, 0)
}

const verifyIfExistAccountCPF = (req, res, next) => {
  const { cpf } = req.headers
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

app.get('/statement', verifyIfExistAccountCPF, (req, res) => {
  const { customer } = req
  return res.json(customer.statement)
})

app.post('/deposit', verifyIfExistAccountCPF, (req, res) => {
  const { description, amount } = req.body
  const { customer } = req

  const statementOperation = {
    description,
    amount,
    created_at: new Date(),
    type: 'credit'
  }

  customer.statement.push(statementOperation)

  return res.status(201).send()
})

app.post('/withdraw', verifyIfExistAccountCPF, (req, res) => {
  const { customer } = req
  const { amount } = req.body

  const balance = getBalance(customer.statement)

  if (balance < amount)
    return res.status(400).send({ error: 'Insufficient funds!' })

  const statementOperation = {
    amount,
    created_at: new Date(),
    type: 'debit'
  }

  customer.statement.push(statementOperation)

  return res.status(201).send()
})

app.get('/statement/date', verifyIfExistAccountCPF, (req, res) => {
  const { customer } = req
  const { date } = req.query

  const dateFormat = new Date(date + ' 00:00')

  const statements = customer.statement.filter(
    (statement) =>
      statement.created_at.toDateString() ===
      new Date(dateFormat).toDateString()
  )

  return res.status(200).json(statements)
})

app.put('/account', verifyIfExistAccountCPF, (req, res) => {
  const { name } = req.body
  const { customer } = req

  customer.name = name

  res.status(200).send()
})

app.get('/account', verifyIfExistAccountCPF, (req, res) => {
  const { customer } = req

  return res.status(200).json(customer)
})

app.delete('/account', verifyIfExistAccountCPF, (req, res) => {
  const { customer } = req

  customers.splice(customer, 1)

  return res.status(200).json(customers)
})

app.get('/balance', verifyIfExistAccountCPF, (req, res) => {
  const { customer } = req

  const balance = getBalance(customer.statement)

  return res.status(200).json(balance)
})
