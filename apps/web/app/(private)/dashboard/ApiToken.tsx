"use client";
import { Button } from "@/components/ui/button";
import { CopyIcon, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

export const ApiToken: React.FC<{ token: string; accessToken: string }> = ({
  token,
  accessToken,
}) => {
  const [securedKey, setSecuredKey] = useState(token);
  const [modToken, setModToken] = useState("");

  useEffect(() => {
    let modToken2 = securedKey.slice(0, 5);

    for (let i = 5; i < securedKey.length; i++) {
      modToken2 += `*`;
    }
    setModToken(modToken2);
  }, [securedKey]);

  const handleRegenerate = () => {
    axios
      .get("http://localhost:9090/api/v1/users/api-key", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })
      .then((res) => setSecuredKey(res.data));
  };
  return (
    <div className="flex items-center gap-4">
      <div>{modToken}</div>
      <Button
        onClick={() => {
          navigator.clipboard.writeText(token);
          console.log(token);
        }}
      >
        <CopyIcon />
      </Button>

      <Button onClick={() => handleRegenerate()}>
        Regenerate
        <RefreshCcw />
      </Button>
    </div>
  );
};
