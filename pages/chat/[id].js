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
import { useState, useEffect } from "react";

function Chat({ chat, messages }) {
  const [showSidebar, setShowSidebar] = useState(false);
  const [user] = useAuthState(auth);

  const handleShowSidebar = (showSideBar) => {
    setShowSidebar(!showSideBar);
  };
  //handle and show Sidebar if window width > 767px
  const [isDesktop, setDesktop] = useState(window.innerWidth > 767);

  const updateMedia = () => {
    setDesktop(window.innerWidth > 767);
  };

  useEffect(() => {
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

  return (
    <div className="flex no-scrollbar">
      <Head>
        <title>Chat whit {getRecipientEmail(chat.users, user)}</title>
      </Head>

      {(showSidebar || isDesktop) && (
        <Sidebar showSidebar={handleShowSidebar} />
      )}
      <div className="no-scrollbar flex-1 overflow-scroll h-[100vh]">
        <ChatScreen
          chat={chat}
          messages={messages}
          showSideBar={handleShowSidebar}
        />
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
