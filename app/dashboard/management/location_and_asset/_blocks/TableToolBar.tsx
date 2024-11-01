import { Button } from "@/components/ui/button";
import { LuImport, LuX } from "react-icons/lu";
import { FaUpload } from "react-icons/fa6";
import { useRef, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import * as XLSX from "xlsx";
import { LoadingWidget } from "@/components/blocks/LoadingWidget";
import { set } from "date-fns";
import { useDocumentTree } from "../_hooks/useDocumentContext";
import { useDocumentTemplate } from "../_hooks/useDocumentTemplate";
import {
  DocumentObject,
  getDocumentObjectTypeFromString,
} from "@/domain/entities/Document";
import { createNewDocument } from "@/domain/entities/DocumentTemplate";
import { DocumentReferencePropertyView } from "./DocumentDataDisplayUI";
interface FileSelectAreaProps {
  onFileSelect: (data: any[]) => void;
}

export function TableToolBar() {
  return (
    <div className="w-full flex flex-row justify-end px-4 py-1 bg-background dark:bg-black">
      <ExportFileDialog></ExportFileDialog>
    </div>
  );
}

export function ExportFileDialog() {
  const [data, setData] = useState<any[]>([]);
  const documentTree = useDocumentTree();
  const type = documentTree.type;
  const template = useDocumentTemplate(type);
  const [newDocumentData, setNewDocumentData] = useState<DocumentObject[]>([]);

  const handleFileSelect = (importedData: any[]) => {
    setData(importedData);
    if (template.template != undefined) {
      let importedDocument = importedData.map((item, index) => {
        let data: { [key: string]: any } = JSON.parse(JSON.stringify(item));
        template.template!.properties.map((property) => {
          if (data[property.name]) {
            property.value = data[property.name];
          }
        });
        let objectType = getDocumentObjectTypeFromString(data["類別"]);
        let doc = createNewDocument(template!.template!, objectType, "");
        doc.title = data["主檔名稱"];
        doc.description = data["主檔描述"];
        return doc;
      });
      console.log(importedDocument);
      setNewDocumentData(importedDocument);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex flex-row justify-center items-center space-x-1"
        >
          <LuImport />
          <span>匯入</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>匯入檔案</DialogTitle>
          選擇要匯入的檔案
        </DialogHeader>
        <FileSelectArea onFileSelect={handleFileSelect} />
        <div className="w-full max-h-80 overflow-auto flex flex-col">
          {newDocumentData.length > 0
            ? newDocumentData.map((doc, index) => {
                return (
                  <DocumentReferencePropertyView
                    isCollapsible={true}
                    key={index}
                    data={doc}
                    onClick={() => {}}
                    mode="selected"
                  />
                );
              })
            : null}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="flex flex-row justify-center items-center space-x-1 text-destructive"
            >
              <LuX />
              <span className="">取消</span>
            </Button>
          </DialogClose>
          <Button
            variant="outline"
            className="flex flex-row justify-center items-center space-x-1 text-blue-500 hover:text-blue-700"
          >
            <LuImport />
            <span>匯入</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FileSelectArea({ onFileSelect }: FileSelectAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      onFileSelect(jsonData);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // set delay

    const file = event.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragOver(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "w-full h-64 bg-black/5 dark:bg-black/50 rounded-2xl border-2 border-dotted",
        "group hover:border-blue-500 hover:cursor-pointer"
      )}
    >
      <div className="h-full flex flex-1 flex-col justify-center items-center">
        <input
          type="file"
          accept=".xlsx, .xls"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
        {!isLoading ? (
          <FaUpload
            size={36}
            className="text-blue-500 m-2 group-hover:animate-bounce"
          />
        ) : (
          <LoadingWidget />
        )}

        <span className="text-sm group-hover:font-bold ">
          {!isLoading ? "點擊或拖曳檔案至此" : "讀取中..."}
        </span>
      </div>
    </div>
  );
}
