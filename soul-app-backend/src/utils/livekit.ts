
export function generateToken(roomId: string, identity: string, isOwner: boolean = false) {
  // 模拟 LiveKit Token
  return 'mock_token_' + identity + '_' + roomId + (isOwner ? '_owner' : '');
}
