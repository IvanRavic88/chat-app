import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import router from "next/router";

const SearchUser = ({ openChatsWith }) => {
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
    <div className="items-center justify-center w-full relative">
      <div className="border bg-white rounded-full w-full focus-within:shadow-amber-500  focus-within:shadow-md max-w-md border-gray-200 pl-3 py-1 items-center">
        <SearchIcon className="text-rose-700" />
        <input
          className="outline-none flex-1 ml-2 "
          placeholder="Search chats"
          onChange={handleSearchUser}
          value={input}
        />
      </div>
      {searchUser.length ? (
        <div className="border-2 border-white absolute z-50 bg-zinc-800 mt-2 p-2 rounded-lg h-fit border-solid boc-shadow shadow-lg w-full">
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
