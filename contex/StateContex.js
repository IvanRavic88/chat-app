import React, { createContext, useContext, useState, useEffect } from "react";

const Context = createContext();

export const StateContext = ({ children }) => {
  const [showSidebar, setShowSidebar] = useState(false);

  const handleShowSidebar = (showSidebar) => {
    setShowSidebar(showSidebar);
  };

  const [isDesktop, setDesktop] = useState(window.innerWidth > 767);

  const updateMedia = () => {
    setDesktop(window.innerWidth > 767);
  };

  useEffect(() => {
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  });

  return (
    <Context.Provider
      value={{ showSidebar, setShowSidebar, handleShowSidebar, isDesktop }}
    >
      {children}
    </Context.Provider>
  );
};
export const useStateContext = () => useContext(Context);
