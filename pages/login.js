import Head from "next/head";
import TextsmsIcon from "@mui/icons-material/Textsms";
import Button from "@mui/material/Button";
import { auth, provider } from "../utils/firebase";
import { signInWithPopup } from "firebase/auth";
import Image from "next/image";
import { FcGoogle } from "react-icons/fc";

function Login() {
  const signIn = () => {
    signInWithPopup(auth, provider).catch(alert);
  };

  return (
    <div className="grid relative place-items-center h-[100vh] bg-zinc-900/90">
      <Image
        src="/login-picture.jpg"
        layout="fill"
        className="absolute w-full h-full object-cover mix-blend-overlay"
        alt="Young people next to a laptop."
      />
      <Head>
        <title>Login</title>
      </Head>
      <div className="flex flex-col items-center bg-white rounded-xl shadow-xl p-16">
        <h1 className="p-2 pb-8 text-rose-700 text-4xl font-extrabold">
          Chat-App
        </h1>
        <p className="text-rose-700 text-base pb-3">Welcome</p>
        <TextsmsIcon
          fontSize="ingerit"
          className="text-rose-700 mb-12 text-8xl"
        />

        <Button
          className=" hover:text-white btn"
          onClick={signIn}
          variant="contained"
        >
          {" "}
          <FcGoogle className="w-8 h-8 pr-2" />
          Sign in with Google
        </Button>
      </div>
    </div>
  );
}

export default Login;
