import UserIcon from "../../../icons/UserIcon";
import { IUser } from "../../../models/User.model";
interface props {
  isMe?: boolean;
  user: IUser;
}
function User({ isMe = false, user }: props) {
  return (
    <div
      className={`p-2 alert ${isMe ? "alert-info" : "alert-primary"}`}
      data-bs-theme='dark'
    >
      <UserIcon color='var(--bs-alert-color)' /> {user.name}
    </div>
  );
}

export default User;
