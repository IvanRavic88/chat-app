import { useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ChatIcon from "@mui/icons-material/Chat";
import IconButton from "@mui/material/IconButton";
import * as EmailValidator from "email-validator";
import { collection, addDoc, query, where } from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";

const Popup = () => {
  const [user] = useAuthState(auth);

  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);

  const userChatRef = query(
    collection(db, "chats"),
    where("users", "array-contains", user.email)
  );

  const [chatsSnapshot] = useCollection(userChatRef);

  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const createChat = () => {
    handleClose();
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
    setInput("");
  };
  const chatExists = (recipientEmail) =>
    !!chatsSnapshot?.docs.find(
      (chat) =>
        chat.data().users.find((user) => user === recipientEmail)?.length > 0
    );

  return (
    <div>
      <div>
        <IconButton onClick={handleClickOpen}>
          <ChatIcon className="hover:text-red-500 text-amber-500" />
        </IconButton>
      </div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle className="text-red-500">Open New Chat Room</DialogTitle>
        <DialogContent>
          <DialogContentText className="popup-main-text">
            Please enter an email address for the user you wish to chat with
          </DialogContentText>
          <TextField
            InputLabelProps={{
              style: { color: "#ef4444" },
            }}
            sx={{
              "& .MuiInput-underline:after": {
                borderBottomColor: "#ef4444",
              },
            }}
            value={input}
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
            variant="standard"
            onChange={(e) => setInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button className="button-popup-cancel" onClick={handleClose}>
            Cancel
          </Button>
          <Button className="button-popup-chat" onClick={createChat}>
            Create Chat
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default Popup;
