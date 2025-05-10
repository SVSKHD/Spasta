import { defineStore } from "pinia";
import { useToast } from "vue-toastification";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

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

      const auth = getAuth();
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
      const toast = useToast();
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

        toast.success("Welcome to spasta.online! 🎉");
        return this.user;
      } catch (error: any) {
        console.error("Error signing in with email:", error);
        toast.error(error.message || "Failed to sign in");
        throw error;
      }
    },

    async signInWithGoogle() {
      const toast = useToast();
      try {
        const auth = getAuth();
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

        toast.success("Successfully signed in ! 🎉");
        return this.user;
      } catch (error: any) {
        console.error("Error signing in with Google:", error);
        toast.error(error.message || "Failed to sign in with Google");
        throw error;
      }
    },

    async signOut() {
      const toast = useToast();
      try {
        const auth = getAuth();
        await auth.signOut();

        localStorage.removeItem("spasta-login");
        localStorage.removeItem("spasta-user");

        this.user = null;
        this.isAuthenticated = false;
        toast.success("Successfully signed out! 👋");
      } catch (error: any) {
        console.error("Error signing out:", error);
        toast.error(error.message || "Failed to sign out");
        throw error;
      }
    },
  },
});
