import React from "react";
import { useAuth } from "../context/AuthContext";

const UserDebug: React.FC = () => {
  const { user } = useAuth();
  return (
    <pre
      style={{
        background: "#f8f9fa",
        color: "#333",
        padding: 8,
        fontSize: 12,
        border: "1px solid #ccc",
        borderRadius: 4,
      }}
    >
      {JSON.stringify(user, null, 2)}
    </pre>
  );
};

export default UserDebug;
