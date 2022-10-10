import SearchIcon from "@mui/icons-material/Search";
import { useState } from "react";
function SearchUser({ openChatsWith }) {
  const [query, setQuery] = useState("");

  const getChats = async (text) => {
    if (!text) return;
    try {
    } catch (error) {
      setQuery("");
    }
  };

  console.log(openChatsWith);

  const search = (event) => {
    event.preventDefault();

    setQuery(event.target.value);
    getChats(event.target.value);
  };

  return (
    <div className="border rounded-full w-full hover:shadow-lg focus-within:shadow-lg max-w-md border-gray-200 px-5 py-1 items-center">
      <SearchIcon className="text-red-600" />
      <input
        className="outline-none flex-1 ml-2"
        placeholder="Search chats"
        value={query}
        onChange={search}
      />
    </div>
  );
}

export default SearchUser;
