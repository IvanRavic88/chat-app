import { useAuthState } from "react-firebase-hooks/auth";
import Image from "next/image";
import { auth } from "../utils/firebase";
import moment from "moment/moment";

const Message = ({ user, message }) => {
  const [userLoggedIn] = useAuthState(auth);
  const TypeOfMessage = user === userLoggedIn.email ? "Sender" : "Reciver";

  return (
    <div>
      <div
        className={
          TypeOfMessage == "Sender"
            ? "text-white shadow-xl text-lg w-fit p-2 m-2 pb-5 relative min-w-[5rem] min-h-[4rem] rounded-lg text-right ml-auto bg-amber-500"
            : "text-white shadow-xl text-lg w-fit p-2 m-2 pb-5 relative min-w-[5rem] min-h-[4rem] rounded-lg  bg-red-500 text-left"
        }
      >
        {message.message}
        <span className="text-zinc-100 text-[0.7rem] absolute bottom-0 text-center right-2">
          {message.timestamp ? moment(message.timestamp).format("LT") : "..."}
        </span>
        <div>
          {message?.postImage && (
            <Image
              loader={() => message.postImage}
              unoptimized={true}
              width={350}
              height={250}
              layout="intrinsic"
              src={message.postImage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;
