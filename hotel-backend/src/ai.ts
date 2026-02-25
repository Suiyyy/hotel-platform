import { ChatZhipuAI } from '@langchain/community/chat_models/zhipuai'
import { HumanMessage, SystemMessage } from '@langchain/core/messages'
import { getAllHotels } from './store.js'
import type { IHotel } from './types/hotel.js'

const GLM_API_KEY = process.env.GLM_API_KEY || '1e3e62bcd61e499fa1159284eae5ad2a.zJA78ekJCibPpfS3'

const chatModel = new ChatZhipuAI({
  model: 'glm-4-flash',
  apiKey: GLM_API_KEY,
  temperature: 0.1,
})

/** AI 提取的搜索意图结构 */
export interface ISearchIntent {
  keyword?: string
  tags?: string[]
  minStar?: number
  maxPrice?: number
  minRating?: number
  sort?: 'price' | 'rating' | 'distance' | 'star'
  order?: 'asc' | 'desc'
}

const SEARCH_SYSTEM_PROMPT = `你是一个酒店搜索意图解析助手。用户会用自然语言描述他们想住的酒店，你需要从中提取结构化的搜索条件。

请严格以 JSON 格式返回，不要包含任何其他文字。JSON 字段说明：
- keyword: 地点/酒店名关键词（字符串，可选）
- tags: 用户提到的标签/需求，如 ["安静", "双早", "家庭", "商务", "亲子", "浪漫", "WiFi", "停车场", "健身房", "游泳池"]（数组，可选）
- minStar: 最低星级 1-5（数字，可选）
- maxPrice: 最高价格（数字，可选）
- minRating: 最低评分 0-5（数字，可选）
- sort: 排序字段，可选值为 "price"/"rating"/"distance"/"star"（字符串，可选）
- order: 排序方向 "asc" 或 "desc"（字符串，可选）

示例输入："帮我找武汉光谷附近，便宜一点的安静酒店"
示例输出：{"keyword":"光谷","tags":["安静"],"sort":"price","order":"asc"}

示例输入："找个五星级评分高的酒店，最好有泳池和健身房"
示例输出：{"minStar":5,"tags":["游泳池","健身房"],"sort":"rating","order":"desc"}`

/**
 * 本地降级：当 GLM 不可用时，用简单规则从自然语言提取意图
 */
function fallbackParseIntent(input: string): ISearchIntent {
  const intent: ISearchIntent = {}

  // 提取价格
  const priceMatch = input.match(/(\d+)\s*(块|元)?\s*(以内|以下|之内)|不超过\s*(\d+)/)
  if (priceMatch) {
    intent.maxPrice = Number(priceMatch[1] || priceMatch[4])
  }

  // 提取星级
  const starMap: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5 }
  const starMatch = input.match(/([一二三四五1-5])\s*星/)
  if (starMatch) {
    intent.minStar = starMap[starMatch[1]] || Number(starMatch[1])
  }

  // 提取设施标签
  const knownTags = ['游泳池', '泳池', '健身房', '停车场', '餐厅', '商务中心', 'WiFi', 'wifi', '沙滩', '安静', '双早', '家庭', '亲子']
  const matchedTags = knownTags.filter(tag => input.includes(tag))
  const normalizedTags = matchedTags.map(t => t === '泳池' ? '游泳池' : t === 'wifi' ? 'WiFi' : t)
  if (normalizedTags.length > 0) {
    intent.tags = [...new Set(normalizedTags)]
  }

  // 提取地点关键词
  const places = ['北京', '上海', '广州', '深圳', '杭州', '成都', '三亚', '厦门', '西安', '南京',
    '王府井', '陆家嘴', '西湖', '鼓浪屿', '钟楼', '天河', '夫子庙', '锦里', '南山', '三亚湾']
  for (const p of places) {
    if (input.includes(p)) {
      intent.keyword = p
      break
    }
  }

  // 排序意图
  if (input.includes('便宜') || input.includes('最低价') || input.includes('划算')) {
    intent.sort = 'price'; intent.order = 'asc'
  } else if (input.includes('评分高') || input.includes('评分最高') || input.includes('口碑')) {
    intent.sort = 'rating'; intent.order = 'desc'
  } else if (input.includes('近') || input.includes('最近')) {
    intent.sort = 'distance'; intent.order = 'asc'
  }

  return intent
}

export interface IParseResult {
  intent: ISearchIntent
  fallback: boolean
}

/**
 * 给 Promise 加超时
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout after ${ms}ms`)), ms)
    ),
  ])
}

/**
 * 调用 GLM 从自然语言提取搜索意图，超时或失败时降级到本地规则
 */
export async function parseSearchIntent(userInput: string): Promise<IParseResult> {
  try {
    console.log('[ai] calling GLM for:', userInput)
    const response = await withTimeout(
      chatModel.invoke([
        new SystemMessage(SEARCH_SYSTEM_PROMPT),
        new HumanMessage(userInput),
      ]),
      10_000
    )

    const text = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)

    console.log('[ai] GLM response:', text)

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.log('[ai] no JSON in response, using fallback')
      return { intent: fallbackParseIntent(userInput), fallback: true }
    }

    const parsed = JSON.parse(jsonMatch[0]) as ISearchIntent
    console.log('[ai] parsed intent:', JSON.stringify(parsed))
    return { intent: parsed, fallback: false }
  } catch (err) {
    console.error('[ai] GLM call failed, using fallback:', (err as Error).message)
    return { intent: fallbackParseIntent(userInput), fallback: true }
  }
}

const POLISH_SYSTEM_PROMPT = `你是一个酒店文案润色助手。用户会给你一段酒店简介，请将其改写为更吸引人的版本。

要求：
- 保留原文的核心信息（地点、特色、设施等）
- 语言优美流畅，突出酒店亮点
- 控制在 50-150 字之间
- 直接返回润色后的文本，不要包含任何额外说明`

/**
 * 调用 GLM 润色酒店简介，失败时返回原文
 */
export async function polishDescription(input: string): Promise<{ result: string; fallback: boolean }> {
  try {
    console.log('[ai] polishing description:', input)
    const response = await withTimeout(
      chatModel.invoke([
        new SystemMessage(POLISH_SYSTEM_PROMPT),
        new HumanMessage(input),
      ]),
      10_000
    )
    const text = typeof response.content === 'string'
      ? response.content
      : JSON.stringify(response.content)
    console.log('[ai] polished result:', text)
    return { result: text.trim(), fallback: false }
  } catch (err) {
    console.error('[ai] polish failed, returning original:', (err as Error).message)
    return { result: input, fallback: true }
  }
}

/**
 * 根据 AI 提取的意图过滤酒店列表
 */
export async function aiSearchHotels(
  intent: ISearchIntent,
  page = 1,
  pageSize = 10,
  fallback = false
): Promise<{ data: IHotel[]; total: number; filters: ISearchIntent; fallback: boolean }> {
  const allHotels = await getAllHotels()
  let filtered = allHotels.filter(h => h.status === 'approved' && h.isOnline)
  console.log('[ai] approved+online hotels:', filtered.length)

  // keyword 匹配 nameCn / address / nameEn
  if (intent.keyword) {
    const kw = intent.keyword.toLowerCase()
    filtered = filtered.filter(h =>
      h.nameCn.toLowerCase().includes(kw) ||
      h.address.toLowerCase().includes(kw) ||
      (h.nameEn && h.nameEn.toLowerCase().includes(kw))
    )
  }

  // tags 匹配 facilities + description
  if (intent.tags && intent.tags.length > 0) {
    filtered = filtered.filter(h => {
      const facilitiesStr = h.facilities.join(' ').toLowerCase()
      const descStr = (h.description || '').toLowerCase()
      return intent.tags!.some(tag =>
        facilitiesStr.includes(tag.toLowerCase()) ||
        descStr.includes(tag.toLowerCase())
      )
    })
  }

  // star 过滤
  if (intent.minStar) {
    filtered = filtered.filter(h => h.star >= intent.minStar!)
  }

  // price 过滤
  if (intent.maxPrice) {
    filtered = filtered.filter(h => h.price <= intent.maxPrice!)
  }

  // rating 过滤
  if (intent.minRating) {
    filtered = filtered.filter(h => h.rating >= intent.minRating!)
  }

  // 排序
  const sortKey = intent.sort || 'rating'
  const order = intent.order || 'desc'
  filtered.sort((a, b) => {
    const va = a[sortKey as keyof IHotel] as number
    const vb = b[sortKey as keyof IHotel] as number
    return order === 'desc' ? vb - va : va - vb
  })

  const total = filtered.length
  const data = filtered.slice((page - 1) * pageSize, page * pageSize)

  console.log('[ai] search result:', total, 'hotels matched, fallback:', fallback)
  return { data, total, filters: intent, fallback }
}
