import { Download, FilePlus } from 'lucide-react';
import { Button } from '../../ui/button';

export const PrintButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <Button
            variant="default"
            onClick={onClick}
            title="Download PDF Invoice"
        >
            <Download className="w-4 h-4 mr-2" />
            Download PDF Invoice
        </Button>
    );
};