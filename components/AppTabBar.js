import Link from 'next/link'
import { useRouter } from 'next/router'
import { Home, BookOpen, ListOrdered, Trophy, UserCircle2, Layers } from 'lucide-react'

const TAB_ITEMS = [
  { key: 'home', label: 'Home', href: '/dashboard', icon: Home },
  { key: 'courses', label: 'My Courses', href: '/courses', icon: BookOpen },
  { key: 'flashcards', label: 'Cards', href: '/flashcards', icon: Layers },
  { key: 'practice', label: 'Quizzes', href: '/quiz/new', icon: ListOrdered },
  { key: 'leaderboard', label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { key: 'profile', label: 'Profile', href: '/profile', icon: UserCircle2 },
]

function isActivePath(pathname, href) {
  if (href === '/dashboard') return pathname === '/dashboard'
  if (href === '/courses') return pathname === '/courses' || pathname.startsWith('/courses/')
  if (href === '/flashcards') return pathname.startsWith('/flashcards')
  if (href === '/quiz/new') return pathname.startsWith('/quiz')
  if (href === '/leaderboard') return pathname.startsWith('/leaderboard')
  if (href === '/profile') return pathname === '/profile' || pathname.startsWith('/profile/')
  return pathname === href
}

export default function AppTabBar() {
  const router = useRouter()
  const pathname = router.pathname || ''

  return (
    <nav className="border-b border-white/10 bg-[#0b1222]/95 px-4 sm:px-6">
      <ul className="mx-auto flex max-w-[1520px] items-center gap-1 overflow-x-auto py-2">
        {TAB_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href)
          const Icon = item.icon
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  active
                    ? 'bg-orange-500/20 text-orange-200'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
