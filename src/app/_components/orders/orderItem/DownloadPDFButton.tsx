import { Download } from 'lucide-react';
import { Button } from '../../ui/button';

export const DownloadPDFButton = ({ onClick }: { onClick: () => void }) => {
    return (
        <Button
            variant="default"
            onClick={onClick}
            title="Download PDF"
        >
            <Download className="w-4 h-4 mr-2" />
            Download PDF
        </Button>
    );
};
