import React from "react";
import TextsmsIcon from "@mui/icons-material/Textsms";
function Loading() {
  return (
    <center className="grid place-items-center h-[100vh]">
      <div>
        <TextsmsIcon
          fontSize="ingerit"
          className="text-blue-600 mb-12 text-8xl"
        />
      </div>
    </center>
  );
}

export default Loading;
