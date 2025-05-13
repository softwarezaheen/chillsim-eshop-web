import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteToken } from "firebase/messaging";
import axios from "axios";
import { toast } from "react-toastify";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";
import supabase from "../supabase/SupabaseClient";
import { SignIn, SignOut } from "../../redux/reducers/authReducer";
import { supabaseSignout, userLogout } from "../apis/authAPI";
import { DetachDevice } from "../../redux/reducers/deviceReducer";
import { messaging } from "../../../firebaseconfig";
import { queryClient } from "../../main";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const dispatch = useDispatch();
  const [loadingSocial, setLoadingSocial] = useState(false);
  const { user_info, isAuthenticated } = useSelector(
    (state) => state.authentication
  );

  /*EXPLANATION : this is when i want to stimulate a 500 error to be added in the return of user info
  const error = new Error("Internal Server Error");
      error.response = {
        status: 500,
        data: {
          message: "Simulated 500 error",
        },
      };
      */
  /*NOTES:
     test cases to test
     - in case  500 error 
     - in case token is invalid (add some digits to token to trigger error)
     */

  const displayUserInfo = useCallback(
    (data) => {
      console.log("display user info", data);
      setLoadingSocial(true);
      axios
        .get(`${import.meta.env.VITE_API_URL}api/v1/auth/user-info`, {
          headers: {
            Authorization: `Bearer ${data?.session?.access_token}`,
            "x-refresh-token": data?.session?.refresh_token,
            "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone,
            "X-Language": "en",
            "x-device-id": sessionStorage.getItem("x-device-id") || "1234",
          },
        })
        .then((res) => {
          if (res?.data?.status === "success") {
            dispatch(
              SignIn({
                user_token: res?.data?.data?.user_token,
                access_token: data?.session?.access_token,
                refresh_token: data?.session?.refresh_token,
                user_info: res?.data?.data?.user_info,
              })
            );
          }

          setLoadingSocial(false);
        })
        .catch((error) => {
          toast.error(
            `Failed to Sign-in : ${error?.message}` ||
              "Failed to signin. Please try again later"
          );
          console.log("catch user info error in social media", error);
          if (isAuthenticated) {
            handleLogout();
          } else {
            supabaseSignout();
          }

          setLoadingSocial(false);
        });
    },
    [dispatch]
  );

  const signinWithFacebook = async () => {
    console.log("facebook login success:");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/signin?social=true`,
        },
      });
      if (error) {
        toast.error(
          error?.message ||
            "Failed to signin with facebook. Please try again later"
        );
        return;
      }
    } catch (error) {
      handleError(error, "facebook");
    }
  };

  const signinWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    console.log("Google login success:");
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential || !credential.idToken) {
        toast.error("Failed to retrieve ID Token");
        return;
      }

      //NOTES: we can use jwt decode to decode the token the aud should be one of the client ids used in supabase
      const googleIdToken = credential.idToken;

      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: googleIdToken,
      });

      if (error) {
        toast.error(
          error?.message ||
            "Failed to sign-in with google. Please try again later"
        );
        return;
      }
    } catch (error) {
      handleError(error, "google");
    }
  };

  const handleLogout = () => {
    const auth = getAuth();
    userLogout()
      .then((res) => {
        if (res?.data?.status === "success") {
          console.log("start with firebase signout");
          firebaseSignOut(auth);
          console.log("start with dispatch");
          dispatch(SignOut());
          dispatch(DetachDevice());
          queryClient.clear();
          deleteToken(messaging);
          supabaseSignout();
        }
      })
      .catch((error) => {
        toast.error(error?.message || "Failed to loggout");
      })
      .finally(() => {
        setLoadingSocial(false);
      });
  };

  const handleError = (error, provider) => {
    if (error?.code === "auth/popup-blocked") {
      toast.error("Please enable popups for this website");
    } else if (error?.code === "auth/popup-closed-by-user") {
      toast.error(`Login with ${provider} cancelled - Please try again`);
    } else if (
      error?.code === "auth/account-exists-with-different-credential"
    ) {
      toast.error(
        `An account already exists with the same email address but different sign-in credentials for ${provider}`
      );
    } else if (error?.code === "auth/cancelled-popup-request") {
      toast.error(`You click the login button twice quickly`);
    } else if (error?.code === "auth/unauthorized-domain") {
      toast.error(
        `Your app is running on a domain not whitelisted in Firebase Authentication settings`
      );
    } else {
      toast.error(error?.message || `Failed to login with ${provider}`);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        event,
        ":event on auth state change session:",
        session,
        user_info
      );
      console.log(session?.user?.email, user_info?.email);
      if (
        (event === "SIGNED_IN" ||
          event === "INITIAL_SESSION" ||
          event === "TOKEN_REFRESHED") &&
        session &&
        session?.user?.email !== user_info?.email
      ) {
        displayUserInfo({ session });
      } else if (event === "SIGNOUT") {
        handleLogout();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        handleLogout,
        signinWithGoogle,
        loadingSocial,
        signinWithFacebook,
        displayUserInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
