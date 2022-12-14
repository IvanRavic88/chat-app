import Avatar from "@mui/material/Avatar";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";
import { useState, useRef, createRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, storage } from "../utils/firebase";
import AddAPhotoIcon from "@mui/icons-material/AddAPhoto";
import { useCollection } from "react-firebase-hooks/firestore";
import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
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
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import getRecipientEmail from "../utils/getRecipientEmail";
import TimeAgo from "timeago-react";
import dynamic from "next/dynamic";
const Picker = dynamic(
  () => {
    return import("emoji-picker-react");
  },
  { ssr: false }
);
import {
  getDownloadURL,
  ref,
  uploadBytesResumable,
  uploadString,
} from "firebase/storage";
import { signOut } from "firebase/auth";
import Image from "next/image";
import { useStateContext } from "../contex/StateContex";

const ChatScreen = ({ messages, chat }) => {
  const { showSidebar, handleShowSidebar } = useStateContext();
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
    setShowEmoji(false);
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
  const logOut = () => {
    signOut(auth);
    router.push("/");
  };

  // if no text or image then disable send button
  const disableSendButton = !!input || !!imageToMessage;

  return (
    <div className="flex-1 relative">
      <header className="flex sticky top-0 bg-zinc-900 p-3 items-center z-50 h-20 ">
        {recipient ? (
          <Avatar src={recipient?.photo} alt="User photo" />
        ) : (
          <Avatar alt="User photo">{recipientEmail[0]}</Avatar>
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
        {!showSidebar && (
          <IconButton
            className="hide"
            onClick={() => {
              handleShowSidebar(true);
            }}
          >
            <MenuIcon className=" text-red-500 hover:text-amber-500 hover:scale-110 hover:easy-in-out hover:duration-100" />
          </IconButton>
        )}
        <div onClick={logOut} className="cursor-pointer p-2 hidden md:flex ">
          <h2 className="text-red-500 hover:scale-110 hover:text-amber-500">
            Logout
          </h2>
        </div>
      </header>

      <Image
        src="/login-picture.jpg"
        layout="fill"
        className="absolute w-full h-full object-cover mix-blend-overlay opacity-70"
        alt="Young people next to a laptop."
      />

      <div className="p-3 pb-20 pt-20  min-h-[90vh]">{showMessages()}</div>

      <div ref={endOfMessagesRef} className="absolute bottom-0"></div>

      <form className="flex  items-center sticky  bottom-0 p-2 z-50 rounded-full">
        <IconButton
          className="icon-button-padding"
          onClick={() => filePickerRef.current.click()}
        >
          <AddAPhotoIcon className="text-red-500 hover:text-amber-500 hover:scale-110 ease-in duration-500" />
          <input
            ref={filePickerRef}
            onChange={addImageToMessage}
            type="file"
            hidden
          ></input>
        </IconButton>
        <IconButton className="icon-button-padding" onClick={handleViewEmoji}>
          <InsertEmoticonIcon className=" text-amber-500 hover:text-red-500 hover:scale-110" />
        </IconButton>
        <input
          ref={inputRef}
          className="flex-1 outline-none bg-white rounded-full p-1 pl-3 ml-1 mr-1 md:p-3 md:pl-5 md:ml-2 md:mr-2"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />{" "}
        {showEmoji && (
          <div className="absolute bottom-14 z-50">
            <Picker
              showSkinTone={false}
              showPreview={false}
              emojiStyle="google"
              lazyLoadEmojis={true}
              searchDisabled={true}
              onEmojiClick={emojiChoice}
            />
          </div>
        )}
        {imageToMessage && (
          <div
            onClick={removeImage}
            className="flex flex-col filter hover: brightness-110 transition duration-150 transform hover:scale-105 cursor-pointer"
          >
            <Image
              width={25}
              height={25}
              className="object-contain"
              src={imageToMessage}
              alt="Message from user"
            />
            <p className="text-xs text-red-500 text-center">Remove</p>
          </div>
        )}
        <IconButton
          className="icon-button-padding"
          disabled={!disableSendButton}
          type="submit"
          onClick={sendMessage}
        >
          <SendOutlinedIcon
            className={
              !disableSendButton
                ? "text-gray-500"
                : "text-green-500 hover:text-amber-500"
            }
          />
        </IconButton>
      </form>
    </div>
  );
};

export default ChatScreen;
