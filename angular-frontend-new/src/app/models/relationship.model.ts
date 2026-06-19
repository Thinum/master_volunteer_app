export interface RelationshipDTO {
  id: number;
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  type: string; // e.g. "FRIEND", "SIBLING", "PARTNER", etc.
  likeScore: number;
}
