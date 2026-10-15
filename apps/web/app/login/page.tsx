"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useActionState } from "react";
import { login } from "./action";

async function handleFormSubmit(prevState: unknown, formData: FormData) {
  try {
    const identity = formData.get("identity") as string;
    const password = formData.get("password") as string;
    await login({ identity, password });
    return true;
  } catch (error) {
    return false;
  }
}

export default function Page() {
  const [state, action, isPending] = useActionState(handleFormSubmit, null);
  return (
    <div className="h-screen w-full flex items-center justify-center">
      <form className="max-w-lg space-y-2" action={action}>
        <Input
          className="h-10"
          name="identity"
          placeholder="email or username"
        />
        <Input className="h-10" name="password" placeholder="password" />
        <Button disabled={isPending} type="submit">
          Login
        </Button>
      </form>
    </div>
  );
}
