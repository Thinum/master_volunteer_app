export interface ForumReply {
  id?: number;
  author: string;
  avatar: string;
  message: string;
  createdAt: Date;
  forumEntryId?: number;
}
