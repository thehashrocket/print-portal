import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const basicInfoSchema = z.object({
    officeId: z.string(),
    dateIn: z.date(),
    inHandsDate: z.date(),
    estimateNumber: z.string(),
    purchaseOrderNumber: z.string(),
    pressRun: z.string(),
    specialInstructions: z.string().optional(),
    artwork: z.string().optional(),
});

const BasicInfoForm = ({ onNext }) => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(basicInfoSchema),
    });

    const onSubmit = (data) => {
        // Handle form submission and navigate to the next step
        console.log(data);
        onNext();
    };

    return (
        <div className="mb-4">
            <form
                className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
                onSubmit={handleSubmit(onSubmit)}>
                {/* Render form fields */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Date In
                    </label>
                    <input type="text" {...register("officeId")} />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Date In
                    </label>
                    <input type="date" {...register("dateIn")} />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        In Hands Date
                    </label>
                    <input type="date" {...register("inHandsDate")} />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Estimate Number
                    </label>
                    <input type="text" {...register("estimateNumber")} />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Purchase Order Number
                    </label>
                    <input type="text" {...register("purchaseOrderNumber")} />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Press Run
                    </label>
                    <input type="text" {...register("pressRun")} />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Special Instructions
                    </label>
                    <textarea {...register("specialInstructions")} />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                        Artwork
                    </label>
                    <input type="text" {...register("artwork")} />
                </div>
                <button type="submit">Next</button>
            </form>
        </div>
    );
};

export default BasicInfoForm;