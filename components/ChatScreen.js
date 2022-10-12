import Avatar from "@mui/material/Avatar";
import { IconButton } from "@mui/material";
import { useState, useRef, createRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../firebase";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
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
  uploadBytesResumable,
  uploadString,
} from "firebase/storage";
import { signOut } from "firebase/auth";

function ChatScreen({ messages, chat }) {
  const [imageToMessage, setImageToMessage] = useState(null);
  const inputRef = createRef();
  const [showEmoji, setShowEmoji] = useState(false);
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
  useEffect(() => {
    scrollToBottom();
  }, [messagesSnapshot]);

  //Insert emoji
  const emojiChoice = ({ emoji }) => {
    const ref = inputRef.current;
    ref.focus();
    const start = input.substring(0, ref.selectionStart);
    const end = input.substring(ref.selectionStart);
    const text = start + emoji + end;
    setInput(text);
  };
  //open window for selecting emoji
  const handleViewEmoji = () => {
    setShowEmoji(!showEmoji);
  };

  const [recipentSnapshot] = useCollection(
    query(
      collection(db, "users"),
      where("email", "==", getRecipientEmail(chat.users, user))
    )
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

  // Sending Messeges with or without pictures
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

  const addImageToMessage = (e) => {
    const reader = new FileReader();
    if (e.target.files[0]) {
      reader.readAsDataURL(e.target.files[0]);
    }
    reader.onload = (readerEvent) => {
      setImageToMessage(readerEvent.target.result);
    };
    scrollToBottom();
  };
  const removeImage = () => setImageToMessage(null);

  const recipientEmail = getRecipientEmail(chat.users, user);
  const recipient = recipentSnapshot?.docs?.[0]?.data();

  return (
    <div className="relative">
      <header className="flex sticky top-0 bg-zinc-800 p-3 items-center z-50 h-20 border-b-2 border-white">
        {recipient ? (
          <Avatar src={recipient?.photo} />
        ) : (
          <Avatar>{recipientEmail[0]}</Avatar>
        )}

        <div className="ml-2 flex-1 ">
          <h3 className="mb-1 text-white">{recipientEmail}</h3>
          {recipentSnapshot ? (
            <p className="text-zinc-400 text-xs">
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
        <div onClick={() => signOut(auth)} className="cursor-pointer p-2">
          <h2 className="text-rose-500 hover:scale-110">Logout</h2>
        </div>
      </header>
      <div className="p-3 pb-20 pt-20 bg-gray-50 min-h-[90vh]">
        {showMessages()}
      </div>

      <div ref={endOfMessagesRef} className="absolute bottom-0"></div>

      <form className="flex items-center sticky bottom-0 p-2 bg-white z-50 rounded-full">
        <IconButton onClick={handleViewEmoji}>
          <InsertEmoticon className=" text-teal-600 hover:text-teal-700 hover:scale-110" />
        </IconButton>
        <input
          ref={inputRef}
          className="flex-1 outline-none bg-zinc-200 rounded-full p-2 pl-5 ml-2 mr-2"
          placeholder="Type a message here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />{" "}
        {showEmoji && (
          <div className="absolute bottom-[5rem] z-50">
            <EmojiPicker onEmojiClick={emojiChoice} />
          </div>
        )}
        <button
          hidden
          disabled={!input & !imageToMessage}
          type="submit"
          onClick={sendMessage}
        >
          Send message
        </button>
        {imageToMessage && (
          <div
            onClick={removeImage}
            className="flex flex-col filter hover: brightness-110 transition duration-150 transform hover:scale-105 cursor-pointer"
          >
            <img
              className="h-10 object-contain"
              src={imageToMessage}
              alt="Message from user"
            />
            <p className="text-xs text-red-500 text-center">Remove</p>
          </div>
        )}
        <IconButton onClick={() => filePickerRef.current.click()}>
          <AddAPhotoIcon className="text-teal-600 hover:text-teal-700 hover:scale-110 ease-in duration-500" />
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
