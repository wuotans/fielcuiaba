// Dados iniciais
const initialData = {
  News: [
    {
      id: '1',
      title: 'Corinthians vence clássico e se aproxima do G4',
      summary: 'Timão faz grande partida e derrota rival por 2 a 1 no Morumbi',
      content: 'Em uma noite épica para a Fiel, o Corinthians venceu mais um clássico...',
      image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      category: 'jogo',
      featured: true,
      published: true,
      created_date: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Fiel Cuiabá promove encontro especial no próximo domingo',
      summary: 'Evento reunirá corintianos para assistir ao jogo contra o Flamengo',
      content: 'A Fiel Cuiabá está organizando mais um encontro especial...',
      image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
      category: 'fiel_cuiaba',
      featured: false,
      published: true,
      created_date: new Date().toISOString()
    }
  ],
  Event: [
    {
      id: '1',
      title: 'Encontro Fiel Cuiabá - Corinthians x Flamengo',
      description: 'Venha assistir ao clássico contra o Flamengo com a família corintiana!',
      date: '2026-02-15T16:00:00',
      location: 'Bar do Zé - Av. CPA, 1234 - Centro',
      image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
      ticket_price: 50.0,
      total_tickets: 100,
      sold_tickets: 45,
      raffle_limit: 100,
      status: 'ativo',
      published: true,
      created_date: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Caravana para São Paulo - Final do Campeonato',
      description: 'A Fiel Cuiabá vai organizar uma caravana especial para a final!',
      date: '2026-03-20T08:00:00',
      location: 'Terminal Rodoviário de Cuiabá',
      image_url: 'https://images.unsplash.com/photo-1518091043644-c1d4457512c6?w=800',
      ticket_price: 350.0,
      total_tickets: 50,
      sold_tickets: 12,
      raffle_limit: 50,
      status: 'ativo',
      published: true,
      created_date: new Date().toISOString()
    }
  ],
  Photo: [
    {
      id: '1',
      title: 'Encontro Janeiro 2026',
      image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800',
      album: 'Encontro Janeiro 2026',
      published: true,
      created_date: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Torcida vibrando',
      image_url: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800',
      album: 'Encontro Janeiro 2026',
      published: true,
      created_date: new Date().toISOString()
    },
    {
      id: '3',
      title: 'Caravana SP',
      image_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800',
      album: 'Caravana SP 2025',
      published: true,
      created_date: new Date().toISOString()
    },
    {
      id: '4',
      title: 'Churrasco',
      image_url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800',
      album: 'Churrasco Fim de Ano',
      published: true,
      created_date: new Date().toISOString()
    }
  ],
  Raffle: [
    {
      id: '1',
      event_id: '1',
      event_title: 'Encontro Dezembro 2025',
      prize: 'Camisa Oficial do Corinthians Autografada',
      prize_image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
      winner_name: 'João Silva',
      winner_email: 'joao@email.com',
      draw_date: '2025-12-15T20:00:00',
      status: 'realizado',
      created_date: new Date().toISOString()
    }
  ],
  Ticket: [],
  User: [
    {
      id: '1',
      email: 'admin@fielcuiaba.com',
      full_name: 'Administrador',
      role: 'admin'
    }
  ]
}

// Inicializa dados no localStorage
function initializeData() {
  Object.keys(initialData).forEach(entity => {
    if (!localStorage.getItem(`db_${entity}`)) {
      localStorage.setItem(`db_${entity}`, JSON.stringify(initialData[entity]))
    }
  })
}

initializeData()

// Funções de banco de dados
function getAll(entity) {
  const data = localStorage.getItem(`db_${entity}`)
  return data ? JSON.parse(data) : []
}

function getById(entity, id) {
  const items = getAll(entity)
  return items.find(item => item.id === id)
}

function filter(entity, filters, sortField, limit) {
  let items = getAll(entity)
  
  // Aplicar filtros
  if (filters) {
    Object.keys(filters).forEach(key => {
      items = items.filter(item => item[key] === filters[key])
    })
  }
  
  // Ordenar
  if (sortField) {
    const desc = sortField.startsWith('-')
    const field = desc ? sortField.slice(1) : sortField
    items.sort((a, b) => {
      if (desc) return a[field] > b[field] ? -1 : 1
      return a[field] > b[field] ? 1 : -1
    })
  }
  
  // Limitar
  if (limit) {
    items = items.slice(0, limit)
  }
  
  return items
}

function create(entity, data) {
  const items = getAll(entity)
  const newItem = {
    ...data,
    id: Date.now().toString(),
    created_date: new Date().toISOString(),
    updated_date: new Date().toISOString()
  }
  items.push(newItem)
  localStorage.setItem(`db_${entity}`, JSON.stringify(items))
  return newItem
}

function update(entity, id, data) {
  const items = getAll(entity)
  const index = items.findIndex(item => item.id === id)
  if (index !== -1) {
    items[index] = { ...items[index], ...data, updated_date: new Date().toISOString() }
    localStorage.setItem(`db_${entity}`, JSON.stringify(items))
    return items[index]
  }
  return null
}

function remove(entity, id) {
  const items = getAll(entity)
  const filtered = items.filter(item => item.id !== id)
  localStorage.setItem(`db_${entity}`, JSON.stringify(filtered))
}

function bulkCreate(entity, dataArray) {
  const items = getAll(entity)
  const newItems = dataArray.map(data => ({
    ...data,
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    created_date: new Date().toISOString()
  }))
  items.push(...newItems)
  localStorage.setItem(`db_${entity}`, JSON.stringify(items))
  return newItems
}

// Estado do usuário logado
let currentUser = null

// Simula SDK do base44
export const base44 = {
  entities: {
    News: {
      list: (sort, limit) => Promise.resolve(filter('News', null, sort, limit)),
      filter: (filters, sort, limit) => Promise.resolve(filter('News', filters, sort, limit)),
      create: (data) => Promise.resolve(create('News', data)),
      update: (id, data) => Promise.resolve(update('News', id, data)),
      delete: (id) => Promise.resolve(remove('News', id))
    },
    Event: {
      list: (sort, limit) => Promise.resolve(filter('Event', null, sort, limit)),
      filter: (filters, sort, limit) => Promise.resolve(filter('Event', filters, sort, limit)),
      create: (data) => Promise.resolve(create('Event', data)),
      update: (id, data) => Promise.resolve(update('Event', id, data)),
      delete: (id) => Promise.resolve(remove('Event', id))
    },
    Photo: {
      list: (sort, limit) => Promise.resolve(filter('Photo', null, sort, limit)),
      filter: (filters, sort, limit) => Promise.resolve(filter('Photo', filters, sort, limit)),
      create: (data) => Promise.resolve(create('Photo', data)),
      update: (id, data) => Promise.resolve(update('Photo', id, data)),
      delete: (id) => Promise.resolve(remove('Photo', id)),
      bulkCreate: (data) => Promise.resolve(bulkCreate('Photo', data))
    },
    Raffle: {
      list: (sort, limit) => Promise.resolve(filter('Raffle', null, sort, limit)),
      filter: (filters, sort, limit) => Promise.resolve(filter('Raffle', filters, sort, limit)),
      create: (data) => Promise.resolve(create('Raffle', data)),
      update: (id, data) => Promise.resolve(update('Raffle', id, data)),
      delete: (id) => Promise.resolve(remove('Raffle', id))
    },
    Ticket: {
      list: (sort, limit) => Promise.resolve(filter('Ticket', null, sort, limit)),
      filter: (filters, sort, limit) => Promise.resolve(filter('Ticket', filters, sort, limit)),
      create: (data) => Promise.resolve(create('Ticket', data)),
      update: (id, data) => Promise.resolve(update('Ticket', id, data)),
      delete: (id) => Promise.resolve(remove('Ticket', id))
    },
    User: {
      list: () => Promise.resolve(getAll('User')),
      filter: (filters) => Promise.resolve(filter('User', filters))
    }
  },
  auth: {
    me: () => {
      if (!currentUser) {
        currentUser = getAll('User').find(u => u.role === 'admin')
      }
      return Promise.resolve(currentUser)
    },
    isAuthenticated: () => Promise.resolve(true),
    logout: () => {
      currentUser = null
      window.location.href = '/'
    },
    redirectToLogin: (url) => {
      currentUser = getAll('User').find(u => u.role === 'admin')
      window.location.href = url || '/'
    }
  },
  integrations: {
    Core: {
      UploadFile: ({ file }) => {
        return new Promise((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            resolve({ file_url: reader.result })
          }
          reader.readAsDataURL(file)
        })
      }
    }
  }
}