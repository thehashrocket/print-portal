import { Printer } from 'lucide-react';
import { Button } from '../../ui/button';

export const PrintButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <Button
            variant="default"
            onClick={onClick}
            title="Print Item Details"
        >
            <Printer className="w-4 h-4 mr-2" />
            Print Item Details
        </Button>
    );
};