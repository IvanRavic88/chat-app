import Head from "next/head";
import TextsmsIcon from "@mui/icons-material/Textsms";
import { Button } from "@mui/material";
import { auth, provider } from "../firebase";
import { signInWithPopup } from "firebase/auth";

function Login() {
  const signIn = () => {
    signInWithPopup(auth, provider).catch(alert);
  };

  return (
    <div className="grid place-items-center h-[100vh] bg-slate-50">
      <Head>
        <title>Login</title>
      </Head>
      <div className="p-20 flex flex-col items-center bg-white rounded-sm shadow-md ">
        <h1 className="p-2 pb-8 text-blue-900 text-3xl font-extrabold">
          Chat-App
        </h1>
        <TextsmsIcon
          fontSize="ingerit"
          className="text-blue-600 mb-12 text-8xl"
        />
        <Button
          className="text-gray-500 hover:text-white"
          onClick={signIn}
          variant="contained"
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}

export default Login;
