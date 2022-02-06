const express = require('express')
const joyas = require('./data/joyas.js').results
const app = express()
app.listen(3000, () => console.log('Your app listening on port 3000'))

app.get('/', (req, res) => {
  res.send('Oh wow! this is working =)')
})

app.use(express.static('data'))

const HATEOASV1 = () => {

  const jewels = joyas.map((j) => {
    return {
      nombre: j.name,
      href: `http://localhost:3000/jewel/${j.id}`
    }
  })

  return jewels
}

app.get('/api/v1/jewels', (req, res) => {
  res.send({
    jewels: HATEOASV1()
  })
})

const HATEOASV2 = () => {

  const jewels = joyas.map((j) => {
    return {
      name: j.name,
      src: `http://localhost:3000/api/v2/jewel/${j.id}`
    }
  })

  return jewels
}

const HATEOASV2Value = () => {

  const jewels = joyas.map((j) => {
    return {
      name: j.name,
      src: `http://localhost:3000/jewel/${j.id}`,
      value: j.value
    }
  })

  return jewels
}

const orderJewels = (order) => {

  const jewels = HATEOASV2Value()

  return order == 'asc' ? jewels.sort((a, b) => (a.value > b.value ? 1 : -1)) :
    order == 'des' ? jewels.sort((a, b) => (a.value < b.value ? 1 : -1)) :
    false
}

app.get('/api/v2/jewels', (req, res) => {
  const {
    order
  } = req.query

  if (order == 'asc') {
    res.send(orderJewels('asc'))
  }
  if (order == 'des') {
    res.send(orderJewels('des'))
  }

  if (req.query.page) {
    const {
      page
    } = req.query

    const lastPage = Math.trunc(joyas.length / 3)

    if (page == 1) {
      return res.send({
        next: `http://localhost:3000/api/v2/jewels?page=${page*1+1}`,
        jewels: HATEOASV2().slice(page * 3 - 3, page * 3)
      })
    } else if (page > 1 && page < lastPage) {
      return res.send({
        previous: `http://localhost:3000/api/v2/jewels?page=${page-1}`,
        next: `http://localhost:3000/api/v2/jewels?page=${page*1+1}`,
        jewels: HATEOASV2().slice(page * 3 - 3, page * 3)
      })
    } else if (page > 1 && page == lastPage) {
      return res.send({
        previous: `http://localhost:3000/api/v2/jewels?page=${page-1}`,
        jewels: HATEOASV2().slice(page * 3 - 3, page * 3)
      })
    } else {
      return res.send(
        `Page doesn't exist.`
      )
    }
  }

  res.send({
    jewels: HATEOASV2()
  })
})

const filterByCategory = (category) => {
  const jewels = joyas.filter((j) => {
    return j.category === category
  })
  return jewels
}

app.get('/api/v2/category/:category', (req, res) => {
  const category = req.params.category
  res.send({
    count: filterByCategory(category).length,
    jewels: filterByCategory(category)
  })
})

const fieldsSelect = (jewel, fields) => {
  for (property in jewel) {
    if (!fields.includes(property)) delete jewel[property]
  }
  return jewel
}

const jewel = (id) => {
  return joyas.find((j) => j.id == id)
}

app.get('/api/v2/jewel/:id', async (req, res) => {
  const {
    id
  } = req.params
  const {
    fields
  } = req.query

  jewel(id) ? fields ? res.send({
    jewel: fieldsSelect(jewel(id), fields.split(','))
  }) : res.send(jewel(id)) : res.status(404).send({
    error: '404 Not Found',
    message: 'No existe una guitarra con ese id.'
  })

})