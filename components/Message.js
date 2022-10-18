import { useAuthState } from "react-firebase-hooks/auth";

import { auth } from "../utils/firebase";
import moment from "moment/moment";

function Message({ user, message }) {
  const [userLoggedIn] = useAuthState(auth);

  const TypeOfMessage = user === userLoggedIn.email ? "Sender" : "Reciver";
  return (
    <div>
      <div
        className={
          TypeOfMessage == "Sender"
            ? "text-white shadow-xl text-lg w-fit p-5 m-2 pb-6 relative min-w-[5rem] min-h-[4rem] rounded-lg text-right ml-auto bg-teal-400"
            : "shadow-xl text-lg w-fit p-5 m-2 pb-6 relative min-w-[5rem] min-h-[4rem] rounded-lg  bg-white text-left"
        }
      >
        {message.message}
        <span className="text-zinc-600 text-[0.7rem] absolute bottom-0 text-center right-2">
          {message.timestamp ? moment(message.timestamp).format("LT") : "..."}
        </span>
        <div>
          {message.postImage && (
            <img
              src={message.postImage}
              className="h-30 w-[20rem] pb-3"
              layout="fill"
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Message;
