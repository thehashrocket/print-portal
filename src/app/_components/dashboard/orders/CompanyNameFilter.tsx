import React from 'react';

interface CompanyNameFilterProps {
    companyName: string;
    onCompanyNameChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onClear: () => void;
}

const CompanyNameFilter: React.FC<CompanyNameFilterProps> = ({ companyName, onCompanyNameChange, onSubmit, onClear }) => {
    return (
        <div className="card" style={{ padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            <input
                className="input"
                type="text"
                value={companyName}
                onChange={onCompanyNameChange}
                placeholder="Filter by Company Name..."
                style={{ width: 240 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
                <button className="btn primary sm" onClick={onSubmit}>Filter</button>
                <button className="btn sm" onClick={onClear}>Clear</button>
            </div>
        </div>
    );
};

export default CompanyNameFilter;
