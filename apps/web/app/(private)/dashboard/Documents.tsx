"use client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { use, useActionState, useEffect, useMemo, useState } from "react";
import { Document, getAllDocuments, uploadDocument } from "./action";
import { FileIcon } from "lucide-react";

const handleFileUpload = async (prevState: unknown, formData: FormData) => {
  const file = formData.get("file") as File;

  const fileSizeInKB = file.size / 1024;

  const fileSizeInMb = Math.floor(fileSizeInKB / 1024);

  if (fileSizeInMb > 5) {
    return {
      success: false,
      message: "File size should be less than 5 mb",
    };
  }
  await uploadDocument(formData);

  return {
    success: true,
    message: "",
  };
};

export const Documents: React.FC<{ accessToken: string }> = () => {
  const [state, action, isPending] = useActionState(handleFileUpload, null);
  const [documents, setDocuments] = useState<Document[]>([]);

  useEffect(() => {
    (async () => {
      const result = await getAllDocuments();
      console.log("TCL: result", result);
      setDocuments(result);
    })();
  }, []);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Accordion>
            <AccordionItem value="item-1">
              <AccordionTrigger>Upload New Document</AccordionTrigger>
              <AccordionContent>
                <form action={action}>
                  <Input type="file" name="file" />
                  <Button type="submit" disabled={isPending}>
                    Submit
                  </Button>
                  {state?.message.length && (
                    <p className="text-red-600">{state.message}</p>
                  )}
                </form>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
        <div>
          {documents.map((doc) => {
            return (
              <div key={doc.id}>
                <FileIcon />
                <p className="">{doc.url}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
