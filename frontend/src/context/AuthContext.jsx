import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("assistiq_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("assistiq_user");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Demo authentication state wrapper
    const userData = {
      email,
      name: email.split("@")[0].replace(".", " ").toUpperCase(),
      role: "Support Agent",
      organization: "Enterprise Support",
      token: "demo-jwt-token-" + Date.now(),
    };
    setUser(userData);
    localStorage.setItem("assistiq_user", JSON.stringify(userData));
    return userData;
  };

  const signup = async (formData) => {
    const userData = {
      email: formData.email,
      name: formData.name,
      role: "Support Admin",
      organization: formData.organization || "My Company",
      token: "demo-jwt-token-" + Date.now(),
    };
    setUser(userData);
    localStorage.setItem("assistiq_user", JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("assistiq_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
