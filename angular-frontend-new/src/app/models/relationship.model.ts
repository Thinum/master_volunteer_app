export interface RelationshipDTO {
  id: number;
  fromUserId: number;
  fromUserName: string;
  toUserId: number;
  toUserName: string;
  type: string; // e.g. "FRIEND", "SIBLING", "PARTNER", etc.
  likeScore: number;
}

//TODO change type above

export enum RelationshipType {
  FRIEND = 'FRIEND',
  PARTNER = 'PARTNER',
  ACQUAINTANT = 'ACQUAINTANT',
  RELATIVE = 'RELATIVE',
  PARENT = 'PARENT',
  CHILD = 'CHILD',
  SIBLING = 'SIBLING'
}
