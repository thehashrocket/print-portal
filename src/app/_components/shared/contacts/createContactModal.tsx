import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '~/app/_components/ui/dialog';
import { Button } from '~/app/_components/ui/button';
import { Input } from '~/app/_components/ui/input';
import { Label } from '~/app/_components/ui/label';
import { api } from '~/trpc/react';
import { Loader2 } from 'lucide-react';
import { toast } from "~/hooks/use-toast";

const createContactSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
});

type CreateContactFormData = z.infer<typeof createContactSchema>;

interface CreateContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    officeId: string;
    onContactCreated: (contact: { id: string; name: string; email: string }) => void;
}

export function CreateContactModal({ isOpen, onClose, officeId, onContactCreated }: CreateContactModalProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const createContact = api.contacts.createContact.useMutation();

    const { register, handleSubmit, formState: { errors }, reset } = useForm<CreateContactFormData>({
        resolver: zodResolver(createContactSchema),
    });

    const onSubmit = handleSubmit(async (data) => {
        setIsSubmitting(true);
        try {
            const newContact = await createContact.mutateAsync({
                ...data,
                officeId,
            });
            onContactCreated({
                id: newContact.id,
                name: newContact.name ?? '',
                email: newContact.email ?? '',
            });
            toast({
                title: "Contact Created",
                description: `Successfully created contact: ${newContact.name}`,
            });
            reset();
            onClose();
        } catch (error) {
            console.error('Error creating contact:', error);
            toast({
                title: "Error",
                description: "Failed to create contact. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Contact</DialogTitle>
                    <DialogDescription>
                        Add a new contact to this office. Required fields are marked with an asterisk (*).
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name" className="flex gap-1">
                            Name<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="name"
                            {...register('name')}
                            placeholder="Enter name"
                            disabled={isSubmitting}
                            className={errors.name ? "border-red-500" : ""}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email" className="flex gap-1">
                            Email<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            {...register('email')}
                            placeholder="Enter email"
                            disabled={isSubmitting}
                            className={errors.email ? "border-red-500" : ""}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-500">{errors.email.message}</p>
                        )}
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-[#006739] text-white hover:bg-[#005730]"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Contact'
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
} 