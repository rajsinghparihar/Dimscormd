import React, { useState } from "react";
import "./App.css";

import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/analytics";

import { useAuthState } from "react-firebase-hooks/auth";
import { useCollectionData } from "react-firebase-hooks/firestore";

firebase.initializeApp({
  apiKey: "AIzaSyDjgQES6D1UtqcMyhC7v9gAF-zCREZtWgQ",
  authDomain: "dimscormd.firebaseapp.com",
  projectId: "dimscormd",
  storageBucket: "dimscormd.appspot.com",
  messagingSenderId: "920982410652",
  appId: "1:920982410652:web:548a69db2be38085712459",
  measurementId: "G-RN6GKXKLGT",
});

const auth = firebase.auth();
const firestore = firebase.firestore();
const analytics = firebase.analytics();

function App() {
  const [user] = useAuthState(auth);
  return (
    <div className='App'>
      <header>
        <h1> Dimscormd </h1>
        <SignOut />
      </header>
      <section>{user ? <ChatRoom /> : <SignIn />}</section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  };

  return (
    <>
      <button className='sign-in' onClick={signInWithGoogle}>
        Sign in with Google
      </button>
    </>
  );
}

function SignOut() {
  return (
    auth.currentUser && (
      <button className='sign-out' onClick={() => auth.signOut()}>
        Log Out
      </button>
    )
  );
}

function ChatRoom() {
  const dummy = React.useRef();
  const msgsRef = firestore.collection("messages");
  const query = msgsRef.orderBy("createdAt").limitToLast(25);

  const [msgs] = useCollectionData(query, { idField: "id" });
  const emojis = ["👍", "👌", "🤘", "💪", "👎", "✊", "👊", "🖐", "🖖", "👋"];

  const [formValue, setFormValue] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
    await msgsRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue("");
    dummy.current?.scrollIntoView({ behavior: "smooth" });
  };
  dummy.current.scrollIntoView({ behavior: "smooth" });
  return (
    <>
      <main>
        {msgs && msgs.map((msg) => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
        <div ref={dummy}></div>
      </main>

      <form onSubmit={sendMessage}>
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder='say something nice'
        />
        <button type='submit' disabled={!formValue}>
          {emojis[Math.floor(Math.random() * emojis.length)]}
        </button>
      </form>
    </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? "SENT" : "RECIEVED";

  return (
    <>
      <div className={`message ${messageClass}`}>
        <img
          src={
            photoURL ||
            "https://appstickers-cdn.appadvice.com/1531823401/837789943/ff1423ce67287b067f9cb2cc465906c0-2.png"
          }
        />
        <p>{text}</p>
      </div>
    </>
  );
}

export default App;
