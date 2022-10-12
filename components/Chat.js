import { useRouter } from "next/router";
import { Avatar } from "@mui/material";
import { collection, where, query } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import getRecipientEmail from "../utils/getRecipientEmail";
import { auth, db } from "../firebase";

function Chat({ id, users }) {
  const router = useRouter();
  const [user] = useAuthState(auth);
  const recipientEmail = getRecipientEmail(users, user);
  const q = query(
    collection(db, "users"),
    where("email", "==", `${recipientEmail}`)
  );

  const [recipientSnapshot] = useCollection(q);

  const recipient = recipientSnapshot?.docs?.[0]?.data();

  const enterChat = () => {
    router.push(`/chat/${id}`);
  };

  return (
    <div
      className="m-2 bg-white rounded-xl flex items-center cursor-pointer p-3 break-word hover:bg-rose-500 hover:shadow-xl hover:text-white"
      onClick={enterChat}
    >
      {recipient ? (
        <Avatar className="m-1 mr-3" src={recipient?.photo} />
      ) : (
        <Avatar className="m-1 mr-3">{recipientEmail[0]}</Avatar>
      )}
      <p>{recipientEmail}</p>
    </div>
  );
}

export default Chat;
