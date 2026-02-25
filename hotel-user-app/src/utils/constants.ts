/** 酒店审核状态映射 */
export const STATUS_MAP = {
  pending: { label: '审核中', color: '#faad14' },
  approved: { label: '已通过', color: '#52c41a' },
  rejected: { label: '已拒绝', color: '#ff4d4f' },
} as const

/** 排序选项 */
export const SORT_OPTIONS = [
  { key: 'price' as const, label: '价格', order: 'asc' as const },
  { key: 'rating' as const, label: '评分', order: 'desc' as const },
  { key: 'distance' as const, label: '距离', order: 'asc' as const },
]
