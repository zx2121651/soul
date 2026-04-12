import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.object({
    text: z.string({ required_error: '消息内容不能为空' })
      .min(1, '不能发送空消息')
      .max(500, '单条消息不能超过500字'),
  }),
  params: z.object({
    roomId: z.string().regex(/^\\d+$/, 'roomId 必须是数字')
  })
});
