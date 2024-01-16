import { memo, useContext } from "react";
import "./Controlbar.scss";
import User from "./User/User";
import { EditorDataContext } from "../../contexts/EditorData";
import History from "./History/History";
function Controlbar() {
  const { me, users } = useContext(EditorDataContext);
  return (
    <div id='Controlbar'>
      <User user={me ?? {}} isMe />
      {users.map((user, i) =>
        user.id !== me?.id ? <User key={i} user={user} /> : null
      )}
      <History />
    </div>
  );
}

export default memo(Controlbar);
