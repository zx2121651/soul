import { z } from 'zod';

// 严格校验发布动态的接口参数
export const createMomentSchema = z.object({
  body: z.object({
    type: z.enum(['text', 'image', 'voice'], {
      required_error: '必须指定动态类型 (text, image, voice)',
      invalid_type_error: '不支持的动态类型'
    }),
    content: z.string().max(1000, '动态内容最多不能超过 1000 个字符').optional().nullable(),
    url: z.string().url('必须是一个有效的 URL 链接').optional().nullable(),
  }).refine((data) => {
    // 业务校验：纯文本不能什么都不发，图文必须有 url
    if (data.type === 'text' && (!data.content || data.content.trim().length === 0)) {
      return false;
    }
    if (data.type !== 'text' && !data.url) {
      return false;
    }
    return true;
  }, {
    message: '文字动态不能为空，图文或语音动态必须附带媒体链接',
    path: ['body', 'content']
  })
});
