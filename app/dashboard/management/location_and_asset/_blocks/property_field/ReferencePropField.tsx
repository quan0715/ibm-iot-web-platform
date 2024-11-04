import { ReferenceFieldProps } from "@/app/dashboard/management/location_and_asset/_blocks/property_field/FieldInterface";
import { useFormContext } from "react-hook-form";
import { useDataQueryRoute } from "../../_hooks/useQueryRoute";
import { useDocumentReference } from "../../_hooks/useDocument";
import {
  FormField,
  FormControl,
  FormMessage,
  FormItem,
} from "@/components/ui/form";
import { DocumentObject } from "@/domain/entities/Document";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LuLock, LuSearch } from "react-icons/lu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LoadingWidget,
  SuspenseWidget,
} from "@/components/blocks/LoadingWidget";
import { DocumentReferencePropertyView } from "../DocumentDataDisplayUI";
import { ButtonHTMLAttributes } from "react";
import { AnimationListContent } from "@/components/motion/AnimationListContent";
import {
  DocumentTreeProvider,
  useDocumentTree,
} from "../../_hooks/useDocumentContext";

function SearchButton({ isEmpty = false }: { isEmpty?: boolean }) {
  const buttonProps = {
    type: "button",
    variant: "ghost",
    className: "text-gray-600 gap-2 w-full",
  } as {
    type: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  };
  return (
    <Button {...buttonProps} asChild>
      <div className="flex flex-row justify-center items-center">
        <LuSearch /> 修改關聯
      </div>
    </Button>
  );
}

function PropsLoadingWidget() {
  return (
    <Skeleton className="w-full">
      <LoadingWidget />
    </Skeleton>
  );
}

export function DocumentReferenceField({
  name,
  isDisabled = false,
  referenceGroup,
  limit = false,
  view = "page",
}: ReferenceFieldProps) {
  const { control, ...form } = useFormContext();
  const useQueryRoute = useDataQueryRoute();
  const documentOptions = useDocumentReference(referenceGroup);
  const documentTree = useDocumentTree();
  console.log(documentTree);
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const selected: DocumentObject[] =
          documentOptions.documentList?.filter((doc) =>
            field.value.includes(doc.id),
          ) ?? [];

        const options =
          documentOptions.documentList?.filter(
            (doc) => !field.value.includes(doc.id),
          ) ?? [];

        const onReferenceAdd = (documentId: string) => {
          field.onChange(limit ? [documentId] : [...field.value, documentId]);
        };

        const onReferenceRemove = (documentId: string) => {
          field.onChange(
            selected
              .filter((selectedDoc) => selectedDoc.id !== documentId)
              .map((data) => data.id),
          );
        };

        const onReferencesClick = (doc: DocumentObject) => {
          useQueryRoute.setAssetId(doc.id ?? "", referenceGroup);
        };

        const isReferenceEmpty = !field.value || field.value.length === 0;
        const isBlocking = documentOptions.isFetchingData;

        return (
          <FormItem className="w-full flex flex-row justify-start items-center">
            <FormControl>
              <div
                className={cn(
                  "w-full flex flex-col justify-start items-start space-x-2 rounded-md py-0.5",
                )}
              >
                <Dialog>
                  <DialogTrigger
                    className={view == "table" ? "hidden" : "block"}
                  >
                    <SearchButton isEmpty={isReferenceEmpty} />
                  </DialogTrigger>
                  <DialogContent className="">
                    <DialogHeader>
                      <DialogTitle>新增關聯</DialogTitle>
                      <DialogDescription>選擇你要關聯的文檔</DialogDescription>
                    </DialogHeader>
                    <SuspenseWidget
                      isSuspense={isBlocking}
                      fallback={<PropsLoadingWidget />}
                    >
                      <div className="w-full flex flex-col justify-start items-start space-y-2 max-h-[500px] overflow-y-scroll">
                        <ReferencesList
                          references={selected}
                          label="已選擇的文檔"
                          isInDialog={limit}
                          referencesMode="selected"
                          onClick={(doc) => {
                            onReferenceRemove(doc.id ?? "");
                          }}
                        />
                        <ReferencesList
                          references={options}
                          label="選擇其他文檔"
                          isInDialog={limit}
                          referencesMode="candidate"
                          onClick={(doc) => {
                            onReferenceAdd(doc.id ?? "");
                          }}
                        />
                      </div>
                    </SuspenseWidget>
                  </DialogContent>
                </Dialog>
                <SuspenseWidget
                  isSuspense={isBlocking}
                  fallback={<PropsLoadingWidget />}
                >
                  <ReferencesList
                    references={selected}
                    isInDialog={false}
                    onClick={(doc) => {
                      onReferencesClick(doc);
                    }}
                  />
                </SuspenseWidget>
              </div>
            </FormControl>
            {isDisabled ? <LuLock /> : null}
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}

export function ReferencesList({
  references,
  label,
  isInDialog = false,
  isDataCollapsible = false,
  referencesMode = "display",
  onClick,
}: {
  references: DocumentObject[];
  label?: string;
  isInDialog?: boolean;
  isDataCollapsible?: boolean;
  referencesMode?: "selected" | "candidate" | "display";
  onClick: (doc: DocumentObject) => void;
}) {
  return (
    <div className="w-full h-fit grid grid-cols-1">
      {label && <Label className={"py-1"}>{label}</Label>}
      {references.map((doc, index: number) => {
        return (
          <AnimationListContent
            key={doc.id + doc.title + "AnimationListContent" + referencesMode}
            index={index}
          >
            <DialogCloseWrapper wrapped={isInDialog}>
              <DocumentReferencePropertyView
                data={doc}
                onClick={() => {
                  onClick(doc);
                }}
                mode={referencesMode}
                isCollapsible={isDataCollapsible}
              />
            </DialogCloseWrapper>
          </AnimationListContent>
        );
      })}
    </div>
  );
}
function ReferencesTreeViewList({
  references,
  label,
  isInDialog = false,
  referencesMode = "display",
  onClick,
}: {
  references: DocumentObject[];
  label?: string;
  isInDialog: boolean;
  referencesMode?: "selected" | "candidate" | "display";
  onClick: (doc: DocumentObject) => void;
}) {
  return (
    <div className="w-full h-fit grid grid-cols-1">
      {label && <Label>{label}</Label>}
      {references.map((doc, index: number) => {
        return (
          <AnimationListContent key={doc.id} index={index}>
            <DialogCloseWrapper key={doc.id} wrapped={isInDialog}>
              <DocumentReferencePropertyView
                data={doc}
                onClick={() => {
                  onClick(doc);
                }}
                mode={referencesMode}
              />
            </DialogCloseWrapper>
          </AnimationListContent>
        );
      })}
    </div>
  );
}

function DialogCloseWrapper({
  wrapped,
  children,
}: {
  wrapped: boolean;
  children: React.ReactNode;
}) {
  return wrapped ? (
    <DialogClose className="w-full">{children}</DialogClose>
  ) : (
    <div>{children}</div>
  );
}
