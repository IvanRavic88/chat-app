import Chat from "./Chat";
import { Avatar, IconButton, Button } from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import SearchIcon from "@mui/icons-material/Search";
import * as EmailValidator from "email-validator";
import { auth, db } from "../firebase";
import { collection, addDoc, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { signOut } from "firebase/auth";

function Sidebar() {
  const [user] = useAuthState(auth);
  const userChatRef = query(
    collection(db, "chats"),
    where("users", "array-contains", user.email)
  );

  const [chatsSnapshot] = useCollection(userChatRef);

  const createChat = () => {
    const input = prompt(
      "Please enter an email address for the user you wish to chat with"
    );
    if (!input) return null;

    if (
      EmailValidator.validate(input) &&
      !chatExists(input) &&
      input !== user.email
    ) {
      addDoc(collection(db, "chats"), {
        users: [user.email, input],
      });
    }
  };
  const chatExists = (recipientEmail) =>
    !!chatsSnapshot?.docs.find(
      (chat) =>
        chat.data().users.find((user) => user === recipientEmail)?.length > 0
    );
  return (
    <div className="flex-1 border-r-2 border-yellow-100 h-[100vh] max-w-xs overflow-y-scroll no-scrollbar">
      <div className="flex sticky bg-white z-50 space-x-3 items-center p-3 h-20 border-b-2 border-yellow-100 ">
        <Avatar
          className="cursor-pointer hover:opacity-75"
          src={user?.photoURL}
          onClick={() => signOut(auth)}
        />
        <p>{user.email}</p>
        <div>
          <IconButton onClick={createChat}>
            <ChatIcon />
          </IconButton>
        </div>
      </div>
      <div className="flex items-center p-5 rounded-sm">
        <SearchIcon className="text-red-600" />
        <input
          className="outline-none border-none flex-1 ml-2"
          placeholder="Search in chats"
        />
      </div>
      {chatsSnapshot?.docs.map((chat) => (
        <Chat key={chat.id} id={chat.id} users={chat.data().users} />
      ))}
    </div>
  );
}

export default Sidebar;
