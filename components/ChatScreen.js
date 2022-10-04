import { Avatar, IconButton } from "@mui/material";
import { useState, useRef } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebase";
import { AttachFileOutlined } from "@mui/icons-material";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  addDoc,
  collection,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  doc,
  where,
} from "firebase/firestore";
import Message from "./Message";
import { InsertEmoticon } from "@mui/icons-material";
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from "timeago-react";

function ChatScreen({ messages, chat }) {
  const endOfMessagesRef = useRef(null);
  const filePickerRef = useRef(null);

  const [input, setInput] = useState("");
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [messagesSnapshot] = useCollection(
    query(
      collection(db, "chats", `${router.query.id}`, "messages"),
      orderBy("timestamp", "asc")
    )
  );

  const [recipentSnapshot] = useCollection(
    collection(db, "users"),
    where("email", "==", getRecipientEmail(chat.users, user))
  );

  const showMessages = () => {
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message) => (
        <Message
          key={message.id}
          user={message.data().user}
          message={{
            ...message.data(),
            timestamp: message.data()?.timestamp?.toDate().getTime(),
          }}
        ></Message>
      ));
    } else {
      return JSON.parse(messages).map((message) => (
        <Message
          key={message.id}
          user={message.user}
          message={{
            ...message.message,
            timestamp: message.timestamp,
          }}
        ></Message>
      ));
    }
  };

  const scrollToBottom = () => {
    endOfMessagesRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  };

  const sendMessage = (e) => {
    e.preventDefault();
    setDoc(
      doc(db, "users", user.uid),
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
    addDoc(collection(db, "chats", `${router.query.id}`, "messages"), {
      timestamp: serverTimestamp(),
      message: input,
      user: user.email,
      photoUrl: user.photoURL,
    });
    setInput("");
    scrollToBottom();
  };

  const recipientEmail = getRecipientEmail(chat.users, user);
  const recipient = recipentSnapshot?.docs?.[0]?.data();

  const addImageToPost = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setImageToPost(readerEvent.target.result);
    };
  };

  const removeImage = () => {
    setImageToPost(null);
  };

  return (
    <div className="relative">
      <header className="flex sticky top-0 bg-white p-3 items-center z-50 h-20 border-b-2 border-yellow-100">
        {recipient ? (
          <Avatar src={recipient?.photoURL} />
        ) : (
          <Avatar>{recipientEmail[0]}</Avatar>
        )}

        <div className="ml-2 flex-1">
          <h3 className="mb-1">{recipientEmail}</h3>
          {recipentSnapshot ? (
            <p className="text-gray-500 text-xs">
              Last active: {` `}
              {recipient?.lastSeen?.toDate() ? (
                <TimeAgo datetime={recipient?.lastSeen?.toDate()} />
              ) : (
                "Unavailable"
              )}
            </p>
          ) : (
            <p className="text-gray-500 text-xs">Loading last active...</p>
          )}
        </div>
        <div className="flex"></div>
      </header>

      <div className="p-3 pb-20 bg-yellow-50">{showMessages()}</div>
      <div ref={endOfMessagesRef} className="absolute bottom-0"></div>

      <form className="flex items-center p-2 sticky bottom-0 bg-white z-50 rounded-full">
        <InsertEmoticon />

        <input
          className="flex-1 outline-none bg-slate-white p-2 ml-2 mr-2"
          placeholder="Send message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button hidden disabled={!input} type="submit" onClick={sendMessage}>
          Send message
        </button>
        <IconButton onClick={() => filePickerRef.current.click()}>
          <AttachFileOutlined />
          <input
            ref={filePickerRef}
            onChange={addImageToPost}
            type="file"
            hidden
          ></input>
        </IconButton>
      </form>
    </div>
  );
}

export default ChatScreen;
