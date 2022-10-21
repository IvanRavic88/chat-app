import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import router from "next/router";
import { useStateContext } from "../contex/StateContex";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

const SearchUser = ({ openChatsWith }) => {
  const { showSidebar, handleShowSidebar } = useStateContext();
  const [searchUser, setSearchUser] = useState({});
  const [input, setInput] = useState("");

  const handleSearchUser = (event) => {
    event.preventDefault();
    const searchQuery = event.target.value;
    setInput(event.target.value);
    const filteredUsers = [];
    openChatsWith.filter(({ userEmail, chatId }) => {
      if (userEmail.toLowerCase().includes(searchQuery.toLowerCase()))
        filteredUsers.push({ userEmail: userEmail, chatId: chatId });
    });

    if (searchQuery === "") {
      setSearchUser({});
    } else {
      setSearchUser(filteredUsers);
    }
  };
  const enterChat = (chatId) => {
    router.push(`/chat/${chatId}`);
    setSearchUser("");
    setInput("");
  };

  return (
    <div className="flex flex-wrap items-center  w-screen justify-center relative">
      <div className="mb-5">
        {showSidebar && (
          <IconButton
            className="hide"
            onClick={() => {
              handleShowSidebar(false);
            }}
          >
            <CloseIcon className="close-icon hover:scale-110 hover:easy-in-out hover:duration-100" />
          </IconButton>
        )}
      </div>
      <div className="border flex bg-white rounded-full w-full focus-within:shadow-amber-500  focus-within:shadow-md  border-gray-200 p-3 py-1 items-center">
        <SearchIcon className="text-rose-700" />
        <input
          className="outline-none ml-2 w-full"
          placeholder="Search chats"
          onChange={handleSearchUser}
          value={input}
        />
      </div>
      {searchUser.length ? (
        <div className="border-2 border-white absolute z-50 bg-zinc-800 mt-2 p-2 rounded-lg h-fit border-solid w-full">
          {searchUser.slice(0, 5).map(({ userEmail, chatId }) => {
            return (
              <div
                key={chatId}
                onClick={() => enterChat(chatId)}
                className="white cursor-pointer bg-zinc-800 border-rose-500 border-b-2 text-white rounded-lg w-[100%] flex items-center mb-1 justify-center p-1 hover:bg-rose-500 hover:text-white"
              >
                <p>{userEmail}</p>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};

export default SearchUser;
