import { Puff } from "svg-loaders-react";
const Loading = () => {
  return (
    <center className="grid place-items-center h-[100vh]">
      <div>
        <Puff stroke="#ef4444" />
      </div>
    </center>
  );
};

export default Loading;
