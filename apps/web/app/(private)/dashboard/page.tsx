import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@/components/ui/code-block";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import { cookies } from "next/headers";
import { ApiToken } from "./ApiToken";
import { Documents } from "./Documents";

export default async function Page() {
  const cookie = await cookies();
  const content = `
  <script
      type="module"
      src="https://chatbot.codernex.dev/nex-chat.js"
    ></script>
  <nex-chat
      api-url="https://api-chatbot.codernex.dev"
      bot-name="NexBot"
      token=""
      theme=""
      position=""
    ></nex-chat>
  `;

  const accessToken = cookie.get("access_token");
  console.log("TCL: Page -> accessToken", accessToken?.value);

  if (!accessToken?.value) throw new Error("Unauthorized access");
  const response = await axios.get(
    "http://localhost:9090/api/v1/users/api-key/list",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken?.value}`,
      },
    },
  );

  const result = response.data as string;

  return (
    <div className="h-screen w-full flex items-center justify-center">
      <Tabs defaultValue="account" className="w-full max-w-xl">
        <TabsList className={"w-full"}>
          <TabsTrigger value="account">Widget</TabsTrigger>
          <TabsTrigger value="password">API Key</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <CodeBlock>
            <CodeBlockHeader>
              <CodeBlockTitle>Terminal</CodeBlockTitle>
              <CodeBlockActions>
                <CodeBlockCopyButton value={content} />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent>{content}</CodeBlockContent>
          </CodeBlock>
        </TabsContent>
        <TabsContent value="password">
          <ApiToken token={result} accessToken={accessToken?.value} />
        </TabsContent>
        <TabsContent value="documents">
          <Documents accessToken={accessToken.value} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
