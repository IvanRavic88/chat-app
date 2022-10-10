import Avatar from "@mui/material/Avatar";
import { IconButton } from "@mui/material";
import { useState, useRef, createRef } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../firebase";
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
  updateDoc,
} from "firebase/firestore";
import Message from "./Message";
import { InsertEmoticon } from "@mui/icons-material";
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from "timeago-react";
import EmojiPicker from "emoji-picker-react";
import {
  getDownloadURL,
  ref,
  uploadBytes,
  uploadBytesResumable,
  uploadString,
} from "firebase/storage";

function ChatScreen({ messages, chat }) {
  const [imageToMessage, setImageToMessage] = useState(null);
  const inputRef = createRef();
  const [showEmoji, setShowEmoji] = useState(false);
  const endOfMessagesRef = useRef(null);
  const filePickerRef = useRef(null);
  const [input, setInput] = useState("");
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [cursorPosition, setCursorPosition] = useState();
  const [messagesSnapshot] = useCollection(
    query(
      collection(db, "chats", `${router.query.id}`, "messages"),
      orderBy("timestamp", "asc")
    )
  );
  const emojiChoice = ({ emoji }) => {
    const ref = inputRef.current;
    ref.focus();
    const start = input.substring(0, ref.selectionStart);
    const end = input.substring(ref.selectionStart);
    const text = start + emoji + end;
    setInput(text);
    setCursorPosition(start.length + emoji.length);
  };

  const [recipentSnapshot] = useCollection(
    query(
      collection(db, "users"),
      where("email", "==", getRecipientEmail(chat.users, user))
    )
  );
  const handleViewEmoji = () => {
    setShowEmoji(!showEmoji);
  };
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
    addDoc(query(collection(db, "chats", `${router.query.id}`, "messages")), {
      timestamp: serverTimestamp(),
      message: input,
      user: user.email,
      photoUrl: user.photoURL,
    }).then((document) => {
      const storageRef = ref(storage, `chats/${document.id}`, "messages");
      if (imageToMessage) {
        uploadString(storageRef, imageToMessage, "data_url");
        const uploadTask = uploadBytesResumable(
          storageRef,
          `chats/${document.id}/messages`
        );
        uploadTask.on(
          "state_changed",
          null,
          (error) => console.log(error),
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((url) => {
              updateDoc(
                doc(
                  db,
                  "chats",
                  `${router.query.id}`,
                  "messages",
                  `${document.id}`
                ),
                {
                  postImage: url,
                }
              );
            });
          }
        );
      }
    });
    setInput("");
    setImageToMessage(null);
    scrollToBottom();
  };

  const recipientEmail = getRecipientEmail(chat.users, user);
  const recipient = recipentSnapshot?.docs?.[0]?.data();

  const addImageToMessage = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setImageToMessage(readerEvent.target.result);
    };
  };
  const removeImage = () => setImageToMessage(null);
  return (
    <div className="relative">
      <header className="flex sticky top-0 bg-white p-3 items-center z-50 h-20 border-b-2 border-yellow-100">
        {recipient ? (
          <Avatar src={recipient?.photo} />
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
      </header>
      <div className="p-3 pb-20 pt-20 bg-yellow-50 min-h-[90vh]">
        {showMessages()}
      </div>

      <div ref={endOfMessagesRef} className="absolute bottom-0"></div>

      <form className="flex items-center sticky bottom-0 p-2 bg-white z-50 rounded-full">
        <IconButton onClick={handleViewEmoji}>
          <InsertEmoticon className=" text-red-600 hover:text-red-400" />
        </IconButton>
        <input
          ref={inputRef}
          className="flex-1 outline-none bg-slate-white p-2 ml-2 mr-2"
          placeholder="Send message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />{" "}
        {showEmoji && (
          <div className="absolute bottom-[5rem] z-50">
            <EmojiPicker onEmojiClick={emojiChoice} />
          </div>
        )}
        <button hidden disabled={!input} type="submit" onClick={sendMessage}>
          Send message
        </button>
        {imageToMessage && (
          <div
            onClick={removeImage}
            className="flex flex-col filter hover: brightness-110 transition duration-150 transform hover:scale-105 cursor-pointer"
          >
            <img className="h-10 object-contain" src={imageToMessage} />
            <p className="text-xs text-red-500 text-center">Remove</p>
          </div>
        )}
        <IconButton onClick={() => filePickerRef.current.click()}>
          <AttachFileOutlined />
          <input
            ref={filePickerRef}
            onChange={addImageToMessage}
            type="file"
            hidden
          ></input>
        </IconButton>
      </form>
    </div>
  );
}

export default ChatScreen;
