import "../styles/globals.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../utils/firebase";
import Login from "./login";
import Loading from "../components/Loading";
import { useEffect, useState } from "react";
import { serverTimestamp, doc, setDoc } from "firebase/firestore";
import { StateContext } from "../contex/StateContex";
import router from "next/router";

function MyApp({ Component, pageProps }) {
  const [load, setLoad] = useState(false);
  const [user, loading] = useAuthState(auth);

  router.events.on("routeChangeStart", () => {
    setLoad(true);
  });
  router.events.on("routeChangeComplete", () => {
    setLoad(false);
  });

  useEffect(() => {
    if (user) {
      setDoc(
        doc(db, "users", user.uid),
        {
          email: user.email,
          lastSeen: serverTimestamp(),
          photo: user.photoURL,
        },
        { merge: true }
      );
    }
  }, [user]);

  if (loading) return <Loading />;
  if (!user) return <Login />;

  return (
    <StateContext>
      {load && <Loading />}
      <Component {...pageProps} />
    </StateContext>
  );
}
export default MyApp;
