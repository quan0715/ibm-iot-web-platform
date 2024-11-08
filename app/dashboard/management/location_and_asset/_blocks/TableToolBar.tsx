import { Button } from "@/components/ui/button";
import { LuCircle, LuImport, LuPlus, LuX } from "react-icons/lu";
import { FaUpload } from "react-icons/fa6";
import { useRef, useState, useTransition } from "react";
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
import { ReferencesList } from "@/app/dashboard/management/location_and_asset/_blocks/property_field/ReferencePropField";
import { useDocumentData } from "@/app/dashboard/management/location_and_asset/_hooks/useDocument";
import { FaSpinner } from "react-icons/fa";
import { useDataQueryRoute } from "@/app/dashboard/management/location_and_asset/_hooks/useQueryRoute";
import { Separator } from "@/components/ui/separator";
import { ActionButton } from "@/components/blocks/ActionButton";
interface FileSelectAreaProps {
  onFileSelect: (data: any[]) => void;
}

export function TableToolBar() {
  return (
    <div className="mb-2 h-12 w-full flex flex-row justify-end items-center bg-background dark:bg-black">
      <Separator orientation={"vertical"} />
      <ExportFileDialog />
      <Separator orientation={"vertical"} />
      <ActionButton icon={<LuPlus />} label={"新增"} onClick={() => {}} />
      <Separator orientation={"vertical"} />
      <ExportFileDialog />
    </div>
  );
}

export function ExportFileDialog() {
  const [data, setData] = useState<any[]>([]);
  const documentTree = useDocumentTree();
  const type = documentTree.type;
  const template = useDocumentTemplate(type);
  const [newDocumentData, setNewDocumentData] = useState<DocumentObject[]>([]);
  const documentHandler = useDocumentData("", type);
  const [isLoading, setLoadingState] = useState(false);
  const [removeDocumentData, setRemoveDocumentData] = useState<
    DocumentObject[]
  >([]);
  const queryPath = useDataQueryRoute();
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

        let doc = createNewDocument(
          template!.template!,
          objectType,
          data["上層主檔"],
        );

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
        <ActionButton label={"匯入"} icon={<LuImport />} />
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>匯入檔案</DialogTitle>
          選擇要匯入的檔案
        </DialogHeader>
        <FileSelectArea onFileSelect={handleFileSelect} />
        <div className="w-full max-h-72 overflow-auto flex flex-col">
          {newDocumentData.length > 0 ? (
            <ReferencesList
              isInDialog={false}
              isDataCollapsible={true}
              references={newDocumentData}
              label={`匯入檔案數目 ${data.length} 筆`}
              onClick={(document) => {
                setRemoveDocumentData([
                  ...removeDocumentData,
                  newDocumentData[0],
                ]);
                setNewDocumentData(
                  newDocumentData.filter((doc, index) => doc != document),
                );
              }}
              referencesMode={"selected"}
            />
          ) : null}
          {removeDocumentData.length > 0 ? (
            <ReferencesList
              isInDialog={false}
              isDataCollapsible={true}
              references={removeDocumentData}
              label={`移除檔案數目 ${removeDocumentData.length} 筆`}
              onClick={(document) => {
                setNewDocumentData([...newDocumentData, removeDocumentData[0]]);
                setRemoveDocumentData(
                  removeDocumentData.filter((doc, index) => doc != document),
                );
              }}
              referencesMode={"candidate"}
            />
          ) : null}
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
            disabled={isLoading}
            variant="outline"
            className="flex flex-row justify-center items-center space-x-1 text-blue-500 hover:text-blue-700"
            onClick={() => {
              console.log("imported data", newDocumentData);
              setLoadingState((prevState) => true);
              newDocumentData.map(async (doc) => {
                await documentHandler.createNewDocument(doc);
                setNewDocumentData((prevState) =>
                  prevState.filter((document) => document != doc),
                );
              });
              setLoadingState((prevState) => false);
              queryPath.refresh();
            }}
          >
            {isLoading ? (
              <FaSpinner className={"animate-spin"} />
            ) : (
              <LuImport />
            )}
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
      const workbook = XLSX.read(data, { type: "binary", cellDates: true });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      console.log(jsonData);
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
        "group hover:border-blue-500 hover:cursor-pointer",
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
