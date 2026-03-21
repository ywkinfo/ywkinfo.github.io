export class DuplicateEntryError extends Error {
  constructor(message = '같은 스페인어 단어와 뜻 조합이 이미 있습니다.') {
    super(message)
    this.name = 'DuplicateEntryError'
  }
}

export function toUserMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  return '예상하지 못한 오류가 발생했습니다.'
}
