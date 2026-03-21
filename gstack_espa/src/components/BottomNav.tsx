import { NavLink } from 'react-router-dom'

interface BottomNavProps {
  dueCount: number
}

const navItems = [
  { to: '/deck', label: '단어장' },
  { to: '/add', label: '추가' },
  { to: '/review', label: '복습' },
  { to: '/summary', label: '요약' },
  { to: '/settings', label: '설정' },
]

export function BottomNav({ dueCount }: BottomNavProps) {
  return (
    <nav aria-label="주요 화면" className="bottom-nav">
      {navItems.map((item) => (
        <NavLink
          aria-label={item.label}
          key={item.to}
          className={({ isActive }) =>
            isActive ? 'bottom-nav-link is-active' : 'bottom-nav-link'
          }
          to={item.to}
        >
          <span>{item.label}</span>
          {item.to === '/review' && dueCount ? (
            <span aria-label={`복습 ${dueCount}개`} className="nav-badge">
              {dueCount}
            </span>
          ) : null}
        </NavLink>
      ))}
    </nav>
  )
}
