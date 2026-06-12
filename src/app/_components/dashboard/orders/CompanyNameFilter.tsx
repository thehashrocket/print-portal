import React from 'react';

interface CompanyNameFilterProps {
    companyName: string;
    onCompanyNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onClear: () => void;
}

const CompanyNameFilter: React.FC<CompanyNameFilterProps> = ({ companyName, onCompanyNameChange, onSubmit, onClear }) => {
    return (
        <div className="card p-3 flex flex-col gap-2">
            <input
                className="input w-60"
                type="text"
                value={companyName}
                onChange={onCompanyNameChange}
                placeholder="Filter by Company Name..."
            />
            <div className="flex gap-2">
                <button className="btn primary sm" onClick={onSubmit}>Filter</button>
                <button className="btn sm" onClick={onClear}>Clear</button>
            </div>
        </div>
    );
};

export default CompanyNameFilter;
