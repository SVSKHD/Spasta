import { defineStore } from "pinia";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../lib/firebase/config";

// import { useToast } from "../composables/useToast"

interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export const useAuthStore = defineStore("auth", {
  state: (): AuthState => ({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  }),

  actions: {
    initAuthListener() {
      const savedLogin = localStorage.getItem("spasta-login");
      const savedUser = localStorage.getItem("spasta-user");
      const now = new Date();

      if (savedLogin && savedUser) {
        const loginTime = new Date(savedLogin);
        const hoursSince =
          (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
        if (hoursSince < 24) {
          this.user = JSON.parse(savedUser);
          this.isAuthenticated = true;
          this.isLoading = false;
          return;
        } else {
          localStorage.removeItem("spasta-login");
          localStorage.removeItem("spasta-user");
        }
      }

      auth.onAuthStateChanged((user) => {
        if (user) {
          this.user = {
            id: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",
            photoURL: user.photoURL || "",
          };
          this.isAuthenticated = true;
          localStorage.setItem("spasta-login", new Date().toISOString());
          localStorage.setItem("spasta-user", JSON.stringify(this.user));
        } else {
          this.user = null;
          this.isAuthenticated = false;
        }
        this.isLoading = false;
      });
    },

    async signInWithEmail(email: string) {
      try {
        // Demo account simulation
        this.user = {
          id: "demo-user-id",
          email: email,
          displayName: "Demo User",
        };
        this.isAuthenticated = true;

        localStorage.setItem("spasta-login", new Date().toISOString());
        localStorage.setItem("spasta-user", JSON.stringify(this.user));
        return this.user;
      } catch (error: any) {
        console.error("Error signing in with email:", error);

        throw error;
      }
    },

    async signInWithGoogle() {
      try {
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        this.user = {
          id: result.user.uid,
          email: result.user.email || "",
          displayName: result.user.displayName || "",
          photoURL: result.user.photoURL || "",
        };
        this.isAuthenticated = true;
        localStorage.setItem("spasta-login", new Date().toISOString());
        localStorage.setItem("spasta-user", JSON.stringify(this.user));

        return this.user;
      } catch (error: any) {
        console.error("Error signing in with Google:", error);

        throw error;
      }
    },

    async signOut() {
      try {
        await auth.signOut();

        localStorage.removeItem("spasta-login");
        localStorage.removeItem("spasta-user");

        this.user = null;
        this.isAuthenticated = false;
      } catch (error: any) {
        console.error("Error signing out:", error);

        throw error;
      }
    },
  },
});