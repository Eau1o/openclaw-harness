
import { userRepo } from '../repo/user-repo';

export function UserProfile({ userId }: { userId: string }) {
  const user = userRepo.findById(userId);
  return <div>{user?.name}</div>;
}