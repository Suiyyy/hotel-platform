/** 格式化价格显示 */
export const formatPrice = (price: number): string => `¥${price}`

/** 格式化距离显示 */
export const formatDistance = (km: number): string =>
  km < 1 ? `${Math.round(km * 1000)}m` : `${km}km`

/** 格式化日期时间 */
export const formatDateTime = (iso: string): string => {
  const d = new Date(iso)
  const month = d.getMonth() + 1
  const day = d.getDate()
  const hour = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${month}月${day}日 ${hour}:${min}`
}
