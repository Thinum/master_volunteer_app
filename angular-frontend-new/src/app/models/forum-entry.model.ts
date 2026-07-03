export interface ForumEntry {
  id?: number;
  title: string;
  lastMessage: string;
  lastEdited: Date;
  icon: string;
  newPosts?: number;
}
