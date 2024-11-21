import { Printer } from 'lucide-react';

export const PrintButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <button 
            onClick={onClick}
            className="btn btn-primary"
            title="Print Job Details"
        >
            <Printer className="w-4 h-4 mr-2" />
            Print Job Details
        </button>
    );
};