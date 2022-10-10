import React from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import Image from "next/image";
import { auth } from "../firebase";
import moment from "moment/moment";

function Message({ user, message }) {
  const [userLoggedIn] = useAuthState(auth);

  const TypeOfMessage = user === userLoggedIn.email ? "Sender" : "Reciver";
  return (
    <div>
      <p
        className={
          TypeOfMessage == "Sender"
            ? "text-lg w-fit p-3 m-2 pb-5 relative min-w-[5rem] min-h-[4rem]  rounded-lg text-right ml-auto bg-green-100"
            : "text-lg w-fit p-3 m-2 pb-5 relative min-w-[5rem] min-h-[4rem] rounded-lg  bg-yellow-100 text-left"
        }
      >
        {message.message}
        <span className="text-gray-400 p-1 text-xs absolute bottom-0 text-center right-0">
          {message.timestamp ? moment(message.timestamp).format("LT") : "..."}
        </span>
        <div>
          {message.postImage && (
            <img
              src={message.postImage}
              className="h-30 w-[20rem]"
              objectFit="cover"
              layout="fill"
            />
          )}
        </div>
      </p>
    </div>
  );
}

export default Message;
