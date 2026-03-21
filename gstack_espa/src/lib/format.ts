export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatRelativeDue(dueAt: string, now = new Date()) {
  const diffMs = new Date(dueAt).getTime() - now.getTime()

  if (diffMs <= 0) {
    return '지금 복습 가능'
  }

  const diffMinutes = Math.max(1, Math.round(diffMs / (60 * 1000)))

  if (diffMinutes < 60) {
    return `${diffMinutes}분 후`
  }

  const diffHours = Math.round(diffMinutes / 60)

  if (diffHours < 24) {
    return `${diffHours}시간 후`
  }

  const diffDays = Math.round(diffHours / 24)

  if (diffDays === 1) {
    return '내일'
  }

  return `${diffDays}일 후`
}
