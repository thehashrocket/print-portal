import React from 'react';
import { ArrowRightSquareIcon, Phone, Globe, Clock } from 'lucide-react';

interface CompanyInfoProps {
    companyInfo: any;
}

const QuickBooksCompanyInfo: React.FC<CompanyInfoProps> = ({ companyInfo }) => {
    if (!companyInfo) {
        return (
            <div className="bg-white shadow-lg rounded-lg p-6 max-w-2xl mx-auto">
                <p className="text-red-500">Error: Company information is not available.</p>
            </div>
        );
    }

    const { companyInfo: CompanyInfo, time } = companyInfo;

    const formatDate = (dateString: string | number | Date) => {
        return dateString ? new Date(dateString).toLocaleDateString() : 'N/A';
    };

    const formatDateTime = (dateTimeString: string | number | Date) => {
        return dateTimeString ? new Date(dateTimeString).toLocaleString() : 'N/A';
    };

    const getNameValue = (name: string) => {
        const item = CompanyInfo.NameValue?.find((nv: { Name: any; }) => nv.Name === name);
        return item ? item.Value : 'N/A';
    };

    const renderAddress = (address: { Line1: any; City: any; CountrySubDivisionCode: any; PostalCode: any; Lat: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; Long: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<React.AwaitedReactNode> | null | undefined; }, title: string | number | bigint | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<React.AwaitedReactNode> | null | undefined) => {
        if (!address) return null;
        return (
            <div>
                <h3 className="text-xl font-semibold mb-2 text-secondary">{title}</h3>
                <div className="bg-base-200 p-4 rounded-md">
                    <p>{address.Line1 || 'N/A'}</p>
                    <p>{address.City || 'N/A'}, {address.CountrySubDivisionCode || 'N/A'} {address.PostalCode || 'N/A'}</p>
                    {address.Lat && address.Long && (
                        <p className="text-sm text-gray-500">Lat: {address.Lat}, Long: {address.Long}</p>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-primary">Company Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1 md:col-span-2">
                    <h3 className="text-xl font-semibold mb-2 text-secondary">General Info</h3>
                    <div className="bg-base-200 p-4 rounded-md">
                        <p><span className="font-semibold">Company Name:</span> {CompanyInfo.CompanyName || 'N/A'}</p>
                        <p><span className="font-semibold">Legal Name:</span> {CompanyInfo.LegalName || 'N/A'}</p>
                        <p><span className="font-semibold">Start Date:</span> {formatDate(CompanyInfo.CompanyStartDate)}</p>
                        <p><span className="font-semibold">Fiscal Year Start:</span> {CompanyInfo.FiscalYearStartMonth || 'N/A'}</p>
                        <p><span className="font-semibold">Country:</span> {CompanyInfo.Country || 'N/A'}</p>
                        <p><span className="font-semibold">Email:</span> {CompanyInfo.Email?.Address || 'N/A'}</p>
                        <p><span className="font-semibold">Supported Languages:</span> {CompanyInfo.SupportedLanguages || 'N/A'}</p>
                    </div>
                </div>

                {renderAddress(CompanyInfo.CompanyAddr, "Company Address")}
                {renderAddress(CompanyInfo.LegalAddr, "Legal Address")}
                {renderAddress(CompanyInfo.CustomerCommunicationAddr, "Customer Communication Address")}

                <div>
                    <h3 className="text-xl font-semibold mb-2 text-secondary">Contact Information</h3>
                    <div className="bg-base-200 p-4 rounded-md">
                        <p><span className="font-semibold">Customer Email:</span> {CompanyInfo.CustomerCommunicationEmailAddr?.Address || 'N/A'}</p>
                        <p className="flex items-center">
                            <Phone className="w-4 h-4 mr-1" />
                            <span className="font-semibold">Primary Phone:</span> {Object.keys(CompanyInfo.PrimaryPhone).length ? CompanyInfo.PrimaryPhone : 'N/A'}
                        </p>
                        <p className="flex items-center">
                            <Globe className="w-4 h-4 mr-1" />
                            <span className="font-semibold">Website:</span> {Object.keys(CompanyInfo.WebAddr).length ? CompanyInfo.WebAddr : 'N/A'}
                        </p>
                    </div>
                </div>

                <div className="col-span-1 md:col-span-2">
                    <h3 className="text-xl font-semibold mb-2 text-secondary">Additional Details</h3>
                    <div className="bg-base-200 p-4 rounded-md grid grid-cols-1 md:grid-cols-2 gap-2">
                        <p><span className="font-semibold">Industry Type:</span> {getNameValue('QBOIndustryType')}</p>
                        <p><span className="font-semibold">Subscription:</span> {getNameValue('OfferingSku')}</p>
                        <p><span className="font-semibold">Subscription Status:</span> {getNameValue('SubscriptionStatus')}</p>
                        <p><span className="font-semibold">Payroll Feature:</span> {getNameValue('PayrollFeature')}</p>
                        <p><span className="font-semibold">Accountant Feature:</span> {getNameValue('AccountantFeature')}</p>
                        <p><span className="font-semibold">Item Categories:</span> {getNameValue('ItemCategoriesFeature')}</p>
                        <p><span className="font-semibold">Company Type:</span> {getNameValue('CompanyType')}</p>
                        <p><span className="font-semibold">Neo Enabled:</span> {getNameValue('NeoEnabled')}</p>
                        <p><span className="font-semibold">QB Desktop Migrated:</span> {getNameValue('IsQbdtMigrated')}</p>
                    </div>
                </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
                <p className="flex items-center">
                    <ArrowRightSquareIcon className="w-4 h-4 mr-1" />
                    <span>ID: {CompanyInfo.Id}, Domain: {CompanyInfo.domain}, Sync Token: {CompanyInfo.SyncToken}</span>
                </p>
                <p className="flex items-center mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Created: {formatDateTime(CompanyInfo.MetaData?.CreateTime)}</span>
                </p>
                <p className="flex items-center mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Last Updated: {formatDateTime(CompanyInfo.MetaData?.LastUpdatedTime)}</span>
                </p>
                <p className="flex items-center mt-1">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>Data Time: {formatDateTime(companyInfo.time)}</span>
                </p>
            </div>
        </div>
    );
};

export default QuickBooksCompanyInfo;