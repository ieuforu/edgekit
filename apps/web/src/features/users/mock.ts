export interface User {
  id: number
  name: string
  email: string
  avatar: string
  department: string
  role: string
  status: 'active' | 'inactive' | 'suspended'
  joinedAt: string
  lastActive: string
  location: string
  bio: string
}

const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Legal',
]
const ROLES = ['admin', 'member', 'viewer']
const STATUSES: User['status'][] = ['active', 'inactive', 'suspended']
const LOCATIONS = [
  'San Francisco',
  'New York',
  'London',
  'Tokyo',
  'Berlin',
  'Singapore',
  'Sydney',
  'Toronto',
  'Amsterdam',
  'Remote',
]
const FIRST_NAMES = [
  'Alice',
  'Bob',
  'Charlie',
  'Diana',
  'Eve',
  'Frank',
  'Grace',
  'Henry',
  'Iris',
  'Jack',
  'Kate',
  'Leo',
  'Mia',
  'Noah',
  'Olivia',
  'Paul',
  'Quinn',
  'Rose',
  'Sam',
  'Tina',
  'Uma',
  'Vince',
  'Wendy',
  'Xavier',
  'Yara',
  'Zoe',
  'Adam',
  'Bella',
  'Chris',
  'Daisy',
]
const LAST_NAMES = [
  'Smith',
  'Johnson',
  'Lee',
  'Brown',
  'Wilson',
  'Moore',
  'Taylor',
  'Davis',
  'Garcia',
  'Miller',
  'Anderson',
  'Thomas',
  'Jackson',
  'White',
  'Harris',
  'Martin',
  'Thompson',
  'Robinson',
  'Clark',
  'Lewis',
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateAvatar(name: string): string {
  return `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(name)}`
}

const ALL_USERS: User[] = Array.from({ length: 100_000 }, (_, i) => {
  const name = `${randomItem(FIRST_NAMES)} ${randomItem(LAST_NAMES)}`
  return {
    id: i + 1,
    name,
    email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
    avatar: generateAvatar(name),
    department: randomItem(DEPARTMENTS),
    role: randomItem(ROLES),
    status: randomItem(STATUSES),
    joinedAt: new Date(Date.now() - Math.floor(Math.random() * 365 * 5) * 86400000).toISOString(),
    lastActive: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
    location: randomItem(LOCATIONS),
    bio:
      i % 3 === 0
        ? `Passionate about ${randomItem(DEPARTMENTS).toLowerCase()} and building great products.`
        : '',
  }
})

export function fetchUser(id: number): User | undefined {
  return ALL_USERS.find((u) => u.id === id)
}

export interface UsersResponse {
  data: User[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export async function fetchUsers({
  page = 1,
  pageSize = 50,
  search = '',
}: {
  page?: number
  pageSize?: number
  search?: string
}): Promise<UsersResponse> {
  await new Promise((r) => setTimeout(r, 150))

  let filtered = ALL_USERS
  if (search) {
    const q = search.toLowerCase()
    filtered = ALL_USERS.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    )
  }

  const start = (page - 1) * pageSize
  const data = filtered.slice(start, start + pageSize)

  return {
    data,
    page,
    pageSize,
    total: filtered.length,
    totalPages: Math.ceil(filtered.length / pageSize),
  }
}
