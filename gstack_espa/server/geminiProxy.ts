import type { IncomingMessage, ServerResponse } from 'node:http'
import { loadEnv, type Plugin } from 'vite'

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash'
const GEMINI_ROUTE = '/api/spanish-word-autofill'

interface EnvConfig {
  apiKey: string | null
  model: string
}

interface MiddlewareStack {
  use: (
    route: string,
    handler: (
      request: IncomingMessage,
      response: ServerResponse,
      next: (error?: unknown) => void,
    ) => void | Promise<void>,
  ) => void
}

interface GeminiAutofillResult {
  meaningKo: string
  exampleSentence: string
  tags: string[]
}

interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string
      }>
    }
  }>
  error?: {
    message?: string
  }
}

function getEnvConfig(mode: string): EnvConfig {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    apiKey:
      env.GEMINI_API_KEY ??
      env.GOOGLE_API_KEY ??
      process.env.GEMINI_API_KEY ??
      process.env.GOOGLE_API_KEY ??
      null,
    model:
      env.GEMINI_MODEL ??
      process.env.GEMINI_MODEL ??
      DEFAULT_GEMINI_MODEL,
  }
}

function json(
  response: ServerResponse,
  statusCode: number,
  payload: unknown,
) {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.end(JSON.stringify(payload))
}

async function readJsonBody(request: IncomingMessage) {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  const rawBody = Buffer.concat(chunks).toString('utf-8')

  if (!rawBody) {
    return {}
  }

  return JSON.parse(rawBody) as Record<string, unknown>
}

function buildPrompt(spanish: string) {
  return [
    'You are preparing a Spanish vocabulary flashcard for a Korean learner.',
    `Target word: ${spanish}`,
    'Write concise study-friendly content.',
    'Requirements:',
    '- meaningKo: concise Korean gloss, comma-separated only when necessary.',
    '- exampleSentence: one short natural Spanish sentence using the word or a natural inflected form.',
    '- tags: 2 to 4 short tags without hashtags. The first tag should usually be the part of speech in Korean.',
  ].join('\n')
}

function normalizeGeminiResult(payload: unknown): GeminiAutofillResult {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Gemini 응답 형식을 해석하지 못했습니다.')
  }

  const candidate = payload as Partial<GeminiAutofillResult>
  const meaningKo = typeof candidate.meaningKo === 'string' ? candidate.meaningKo.trim() : ''
  const exampleSentence =
    typeof candidate.exampleSentence === 'string'
      ? candidate.exampleSentence.trim()
      : ''
  const tags = Array.isArray(candidate.tags)
    ? Array.from(
        new Set(
          candidate.tags
            .filter((value): value is string => typeof value === 'string')
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      )
    : []

  if (!meaningKo || !exampleSentence || tags.length < 2) {
    throw new Error('Gemini가 필요한 카드 정보를 모두 채워 주지 못했습니다.')
  }

  return {
    meaningKo,
    exampleSentence,
    tags: tags.slice(0, 4),
  }
}

async function fetchGeminiAutofill(
  spanish: string,
  envConfig: EnvConfig,
): Promise<GeminiAutofillResult> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15_000)

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${envConfig.model}:generateContent`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': envConfig.apiKey ?? '',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: buildPrompt(spanish),
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: 'application/json',
            responseJsonSchema: {
              type: 'object',
              properties: {
                meaningKo: {
                  type: 'string',
                  description:
                    'A concise Korean meaning for the Spanish word.',
                },
                exampleSentence: {
                  type: 'string',
                  description:
                    'One short natural Spanish example sentence using the target word.',
                },
                tags: {
                  type: 'array',
                  description:
                    'Two to four short tags, no hashtags, first tag preferably the part of speech in Korean.',
                  items: {
                    type: 'string',
                  },
                  minItems: 2,
                  maxItems: 4,
                },
              },
              required: ['meaningKo', 'exampleSentence', 'tags'],
            },
          },
        }),
        signal: controller.signal,
      },
    )
    const responseText = await response.text()

    if (!response.ok) {
      const errorPayload = JSON.parse(responseText) as GeminiApiResponse
      throw new Error(
        errorPayload.error?.message ?? 'Gemini 요청이 실패했습니다.',
      )
    }

    const parsed = JSON.parse(responseText) as GeminiApiResponse
    const jsonText = parsed.candidates?.[0]?.content?.parts?.find(
      (part) => typeof part.text === 'string',
    )?.text

    if (!jsonText) {
      throw new Error('Gemini 응답에서 JSON 본문을 찾지 못했습니다.')
    }

    return normalizeGeminiResult(JSON.parse(jsonText))
  } finally {
    clearTimeout(timeoutId)
  }
}

function attachGeminiRoute(middlewares: MiddlewareStack, envConfig: EnvConfig) {
  middlewares.use(
    GEMINI_ROUTE,
    async (request, response, next) => {
      if (request.method === 'OPTIONS') {
        response.statusCode = 204
        response.end()
        return
      }

      if (request.method !== 'POST') {
        json(response, 405, { error: 'POST 요청만 지원합니다.' })
        return
      }

      if (!envConfig.apiKey) {
        json(response, 500, {
          error:
            'GEMINI_API_KEY가 설정되지 않았습니다. .env.local에 키를 넣고 개발 서버를 다시 시작해 주세요.',
        })
        return
      }

      try {
        const requestBody = await readJsonBody(request)
        const spanish =
          typeof requestBody.spanish === 'string'
            ? requestBody.spanish.trim()
            : ''

        if (!spanish) {
          json(response, 400, {
            error: '스페인어 단어를 입력해 주세요.',
          })
          return
        }

        const suggestion = await fetchGeminiAutofill(spanish, envConfig)
        json(response, 200, suggestion)
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          json(response, 504, {
            error: 'Gemini 응답이 너무 오래 걸렸습니다. 잠시 후 다시 시도해 주세요.',
          })
          return
        }

        if (error instanceof SyntaxError) {
          json(response, 400, {
            error: '요청 형식을 읽지 못했습니다.',
          })
          return
        }

        json(response, 502, {
          error:
            error instanceof Error
              ? error.message
              : 'Gemini 자동 작성 요청 중 오류가 발생했습니다.',
        })
      }

      next()
    },
  )
}

export function geminiAutofillPlugin(): Plugin {
  return {
    name: 'gemini-autofill-proxy',
    configureServer(server) {
      attachGeminiRoute(server.middlewares, getEnvConfig(server.config.mode))
    },
    configurePreviewServer(server) {
      attachGeminiRoute(server.middlewares, getEnvConfig(server.config.mode))
    },
  }
}
