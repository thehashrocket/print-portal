import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Label } from "~/app/_components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/app/_components/ui/card";
import { Textarea } from "~/app/_components/ui/textarea";
import dayjs from "dayjs";
import type { SerializedOutsourcedOrderItemInfo, SerializedOutsourcedOrderItemInfoFile } from "~/types/serializedTypes";
import FileUpload from "~/app/_components/shared/fileUpload";

// Define the props interface
interface OutsourcedOrderItemInfoProps {
  info?: SerializedOutsourcedOrderItemInfo | null;
  onSave?: (data: OutsourcedOrderItemInfoFormData) => Promise<void>;
  isEditable?: boolean;
  orderItemId?: string;
  initialFiles?: SerializedOutsourcedOrderItemInfoFile[];
  onFileUploaded?: (fileUrl: string, description: string) => Promise<void>;
  onFileRemoved?: (fileUrl: string) => Promise<void>;
  onFileDescriptionChanged?: (fileUrl: string, description: string) => Promise<void>;
}

// Define the form schema
const outsourcedOrderItemInfoSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  contactName: z.string().min(1, "Contact name is required"),
  contactPhone: z.string().min(1, "Contact phone is required"),
  contactEmail: z.string().optional(),
  jobDescription: z.string().optional(),
  orderNumber: z.string().optional(),
  estimatedDeliveryDate: z.string().optional(),
  files: z.array(z.object({
    fileUrl: z.string(),
    description: z.string().optional(),
  })).optional(),
});

// Define the form data type
export type OutsourcedOrderItemInfoFormData = z.infer<typeof outsourcedOrderItemInfoSchema>;

export default function OutsourcedOrderItemInfoForm({ 
  info, 
  onSave, 
  isEditable = false,
  orderItemId,
  initialFiles = [],
  onFileUploaded,
  onFileRemoved,
  onFileDescriptionChanged
}: OutsourcedOrderItemInfoProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [files, setFiles] = useState<{ fileUrl: string; description: string }[]>(
    initialFiles.map(file => ({
      fileUrl: file.fileUrl,
      description: file.description ?? ''
    }))
  );
  
  // Initialize the form with the current info data
  const { register, handleSubmit, formState: { errors, isDirty }, setValue } = useForm<OutsourcedOrderItemInfoFormData>({
    resolver: zodResolver(outsourcedOrderItemInfoSchema),
    defaultValues: {
      companyName: info?.companyName || "",
      contactName: info?.contactName || "",
      contactPhone: info?.contactPhone || "",
      contactEmail: info?.contactEmail || "",
      jobDescription: info?.jobDescription || "",
      orderNumber: info?.orderNumber || "",
      estimatedDeliveryDate: info?.estimatedDeliveryDate 
        ? dayjs(info.estimatedDeliveryDate).format("YYYY-MM-DD")
        : undefined,
      files: initialFiles.map(file => ({
        fileUrl: file.fileUrl,
        description: file.description ?? ''
      })),
    },
  });

  // Handle form submission
  const handleFormSubmit = async (data: OutsourcedOrderItemInfoFormData) => {
    if (onSave) {
      console.log("Saving outsourced order info", data);
      await onSave({
        ...data,
        files // Include the current files state
      });
      setIsEditing(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (fileUrl: string, description: string) => {
    const newFile = { fileUrl, description };
    setFiles(prev => [...prev, newFile]);
    setValue('files', [...files, newFile], { shouldDirty: true });
    if (onFileUploaded) {
      await onFileUploaded(fileUrl, description);
    }
  };

  // Handle file removal
  const handleFileRemove = async (fileUrl: string) => {
    setFiles(prev => prev.filter(file => file.fileUrl !== fileUrl));
    setValue('files', files.filter(file => file.fileUrl !== fileUrl), { shouldDirty: true });
    if (onFileRemoved) {
      await onFileRemoved(fileUrl);
    }
  };

  // Handle file description change
  const handleFileDescriptionChange = async (fileUrl: string, description: string) => {
    setFiles(prev => prev.map(file => file.fileUrl === fileUrl ? { ...file, description } : file));
    setValue('files', files.map(file => file.fileUrl === fileUrl ? { ...file, description } : file), { shouldDirty: true });
    if (onFileDescriptionChanged) {
      await onFileDescriptionChanged(fileUrl, description);
    }
  };

  // If !editing and !info, display a message
  if (!isEditing && !info) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Outsourced Order Information</CardTitle>
          <CardDescription>No information available</CardDescription>
        </CardHeader>
        {isEditable && (
          <CardFooter>
            <Button onClick={() => setIsEditing(true)}>Add Information</Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  

  // If not editing, display the info in read-only mode
  if (!isEditing) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Outsourced Order Information</CardTitle>
          <CardDescription>Details about the outsourced order</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Company Name</h3>
              <p className="mt-1">{info?.companyName || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Order Number</h3>
              <p className="mt-1">{info?.orderNumber || "Not specified"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Name</h3>
              <p className="mt-1">{info?.contactName || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Contact Phone</h3>
              <p className="mt-1">{info?.contactPhone || "Not specified"}</p>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Contact Email</h3>
            <p className="mt-1">{info?.contactEmail || "Not specified"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Job Description</h3>
            <p className="mt-1 whitespace-pre-wrap">{info?.jobDescription || "Not specified"}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-gray-500">Estimated Delivery Date</h3>
            <p className="mt-1">
              {info?.estimatedDeliveryDate 
                ? dayjs(info.estimatedDeliveryDate).format("MMMM D, YYYY")
                : "Not specified"}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">Attachments</h3>
            <div className="mt-1 space-y-2">
              {info?.files.map(file => (
                <div key={file.id} className="flex items-center gap-2">
                  <a href={file.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {file.description || file.fileUrl.split('/').pop()}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
        {isEditable && (
          <CardFooter>
            <Button onClick={() => setIsEditing(true)}>Edit Information</Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  // If editing, display the form
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Edit Outsourced Order Information</CardTitle>
        <CardDescription>Update the details about the outsourced order</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <CardContent className="space-y-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              {...register("companyName")}
              className="w-full"
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="orderNumber">Order Number</Label>
            <Input
              id="orderNumber"
              {...register("orderNumber")}
              className="w-full"
            />
            {errors.orderNumber && (
              <p className="text-sm text-red-500">{errors.orderNumber.message}</p>
            )}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="contactName">Contact Name</Label>
            <Input
              id="contactName"
              {...register("contactName")}
              className="w-full"
            />
            {errors.contactName && (
              <p className="text-sm text-red-500">{errors.contactName.message}</p>
            )}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="contactPhone">Contact Phone</Label>
            <Input
              id="contactPhone"
              {...register("contactPhone")}
              className="w-full"
            />
            {errors.contactPhone && (
              <p className="text-sm text-red-500">{errors.contactPhone.message}</p>
            )}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="contactEmail">Contact Email</Label>
            <Input
              id="contactEmail"
              type="email"
              {...register("contactEmail")}
              className="w-full"
            />
            {errors.contactEmail && (
              <p className="text-sm text-red-500">{errors.contactEmail.message}</p>
            )}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              {...register("jobDescription")}
              className="w-full"
              rows={4}
            />
            {errors.jobDescription && (
              <p className="text-sm text-red-500">{errors.jobDescription.message}</p>
            )}
          </div>

          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="estimatedDeliveryDate">Estimated Delivery Date</Label>
            <Input
              id="estimatedDeliveryDate"
              type="date"
              {...register("estimatedDeliveryDate")}
              className="w-full"
            />
            {errors.estimatedDeliveryDate && (
              <p className="text-sm text-red-500">{errors.estimatedDeliveryDate.message}</p>
            )}
          </div>

          {/* Add FileUpload component */}
          {isEditable && (
            <div className="space-y-2">
              <Label>Attachments</Label>
              <FileUpload
                workOrderItemId={orderItemId}
                initialFiles={files}
                onFileUploaded={handleFileUpload}
                onFileRemoved={handleFileRemove}
                onDescriptionChanged={handleFileDescriptionChange}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setIsEditing(false)}>
            Cancel
          </Button>
          <Button type="submit" disabled={!isDirty}>
            Save Changes
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
