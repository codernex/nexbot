"use client";
import { Button } from "@/components/ui/button";
import { CopyIcon } from "lucide-react";
import { useEffect, useState } from "react";

export const ApiToken: React.FC<{ token: string }> = ({ token }) => {
  const [modToken, setModToken] = useState("");

  useEffect(() => {
    let modToken2 = token.slice(0, 5);

    for (let i = 5; i < token.length; i++) {
      modToken2 += `*`;
    }
    setModToken(modToken2);
  }, [token]);
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
    </div>
  );
};
