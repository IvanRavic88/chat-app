import Head from "next/head";
import Sidebar from "../../components/Sidebar";
import ChatScreen from "../../components/ChatScreen";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { auth, db } from "../../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import getRecipientEmail from "../../utils/getRecipientEmail";
import { useStateContext } from "../../contex/StateContex";
import { useEffect, useState } from "react";

const Chat = ({ chat, messages }) => {
  const { showSidebar, isDesktop } = useStateContext();
  const [user] = useAuthState(auth);
  const [vh, setVh] = useState(window.innerHeight);

  // fix for mobile browser (problem with 100vh and URL bar)
  useEffect(() => {
    const updateVh = () => {
      setVh(window.innerHeight);
    };
    window.addEventListener("resize", updateVh);

    return () => {
      return () => window.removeEventListener("resize", updateVh);
    };
  }, []);

  return (
    <div className="flex no-scrollbar">
      <Head>
        <title>Chat whit {getRecipientEmail(chat.users, user)}</title>
      </Head>
      {(showSidebar || isDesktop) && <Sidebar />}

      <div
        style={{ height: vh }}
        className="no-scrollbar flex-1 overflow-scroll w-screen"
      >
        <ChatScreen chat={chat} messages={messages} />
      </div>
    </div>
  );
};

export default Chat;

export async function getServerSideProps(context) {
  const ref = doc(db, "chats", `${context.query.id}`);

  const messagesQuery = query(
    collection(db, "chats", `${context.query.id}`, "messages"),
    orderBy("timestamp", "asc")
  );

  const messagesRes = await getDocs(messagesQuery);

  const messages = messagesRes.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .map((messages) => ({
      ...messages,
      timestamp: messages.timestamp.toDate().getTime(),
    }));

  const chatRef = await getDoc(ref);

  const chat = {
    id: chatRef.id,
    ...chatRef.data(),
  };

  return {
    props: {
      messages: JSON.stringify(messages),
      chat: chat,
    },
  };
}
