import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
import router from "next/router";

function SearchUser({ openChatsWith }) {
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
    <div className="items-center justify-center w-full">
      <div className="border bg-white rounded-full w-full focus-within:shadow-lg max-w-md border-gray-200 px-5 py-1 items-center">
        <SearchIcon className="text-rose-700" />
        <input
          className="outline-none flex-1 ml-2 "
          placeholder="Search chats"
          onChange={handleSearchUser}
          value={input}
        />
      </div>
      {searchUser.length ? (
        <div className="pt-2 rounded-lg h-fit border-solid boc-shadow shadow-lg w-full">
          {searchUser.slice(0, 5).map(({ userEmail, chatId }) => {
            return (
              <div
                key={chatId}
                onClick={() => enterChat(chatId)}
                className="cursor-pointer rounded-lg w-[100%] flex items-center justify-center p-1 hover:bg-red-500 hover:text-white"
              >
                <p>{userEmail}</p>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default SearchUser;
