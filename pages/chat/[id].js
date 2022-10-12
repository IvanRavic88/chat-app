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
import { auth, db } from "../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import getRecipientEmail from "../../utils/getRecipientEmail";

function Chat({ chat, messages }) {
  const [user] = useAuthState(auth);

  return (
    <div className="flex no-scrollbar">
      <Head>
        <title>Chat whit {getRecipientEmail(chat.users, user)}</title>
      </Head>
      <Sidebar />
      <div className="no-scrollbar flex-1 overflow-scroll h-[100vh]">
        <ChatScreen chat={chat} messages={messages}></ChatScreen>
      </div>
    </div>
  );
}

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