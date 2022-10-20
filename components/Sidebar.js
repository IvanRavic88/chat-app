import Chat from "./Chat";
import Avatar from "@mui/material/Avatar";
import Search from "./Search";
import { auth, db } from "../utils/firebase";
import { collection, query, where } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import { signOut } from "firebase/auth";
import Popup from "./Popup";
import { useStateContext } from "../contex/StateContex";
import Button from "@mui/material/Button";

const Sidebar = () => {
  const { handleShowSidebar, showSidebar } = useStateContext();
  const [user] = useAuthState(auth);
  const userChatRef = query(
    collection(db, "chats"),
    where("users", "array-contains", user.email)
  );

  const openChatsWith = [];
  const [chatsSnapshot] = useCollection(userChatRef);

  chatsSnapshot?.docs?.map((chat) => {
    const chatId = chat.id;
    chat.data().users.filter((userEmail) => {
      if (userEmail !== user.email)
        openChatsWith.push({ chatId: chatId, userEmail: userEmail });
    });
  });

  return (
    <div className="relative text-sm md:text-base">
      <div className=" z-[100] absolute md:relative flex-1 bg-zinc-900  h-[100vh] max-w-xs  overflow-y-scroll no-scrollbar">
        <div className="text-white flex bg-zinc-900 sticky z-50 space-x-3 items-center p-3 h-20 border-2 border-red-500 ">
          <Avatar
            className="cursor-pointer hover:opacity-75"
            src={user?.photoURL}
            onClick={() => signOut(auth)}
          />
          <p>{user.email}</p>
          <Popup />
        </div>

        <div className="flex items-center p-5 rounded-sm">
          <Search openChatsWith={openChatsWith} />
        </div>
        {chatsSnapshot?.docs.map((chat) => (
          <Chat key={chat.id} id={chat.id} users={chat.data().users} />
        ))}
        {showSidebar && (
          <div className="m-2">
            <Button
              className="btn-sidebar"
              onClick={() => handleShowSidebar(false)}
            >
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
