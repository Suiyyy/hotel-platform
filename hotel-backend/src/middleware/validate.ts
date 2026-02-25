import type { Request, Response, NextFunction } from 'express'

export function validateHotelCreate(req: Request, res: Response, next: NextFunction): void {
  const body = req.body as Record<string, unknown>
  const errors: string[] = []

  if (!body.nameCn || typeof body.nameCn !== 'string') {
    errors.push('酒店中文名为必填项')
  }
  if (!body.address || typeof body.address !== 'string') {
    errors.push('地址为必填项')
  }
  if (typeof body.star !== 'number' || body.star < 1 || body.star > 5) {
    errors.push('星级必须在 1-5 之间')
  }
  if (typeof body.price !== 'number' || body.price <= 0) {
    errors.push('价格必须大于 0')
  }
  if (!body.imageUrl || typeof body.imageUrl !== 'string') {
    errors.push('图片链接为必填项')
  }
  if (!body.phone || typeof body.phone !== 'string') {
    errors.push('联系电话为必填项')
  }

  if (errors.length > 0) {
    res.status(400).json({ message: '参数校验失败', errors })
    return
  }

  next()
}

export function validateHotelPatch(req: Request, res: Response, next: NextFunction): void {
  const body = req.body as Record<string, unknown>

  if (body.star !== undefined && (typeof body.star !== 'number' || body.star < 1 || body.star > 5)) {
    res.status(400).json({ message: '星级必须在 1-5 之间' })
    return
  }
  if (body.price !== undefined && (typeof body.price !== 'number' || body.price <= 0)) {
    res.status(400).json({ message: '价格必须大于 0' })
    return
  }
  if (body.status !== undefined && !['pending', 'approved', 'rejected'].includes(body.status as string)) {
    res.status(400).json({ message: '状态值无效' })
    return
  }

  next()
}
