import { createContext, useContext, useState, ReactNode } from 'react';
import { Typesetting, TypesettingOption, TypesettingProof } from '@prisma/client';

export type TypesettingWithRelations = Typesetting & {
    TypesettingOptions: TypesettingOption[];
    TypesettingProofs: TypesettingProof[];
};

interface TypesettingContextType {
    typesetting: TypesettingWithRelations[];
    setTypesetting: (typesetting: TypesettingWithRelations[]) => void;
}

const TypesettingContext = createContext<TypesettingContextType | undefined>(undefined);

export const useTypesettingContext = () => {
    const context = useContext(TypesettingContext);
    if (context === undefined) {
        throw new Error('useTypesettingContext must be used within a TypesettingProvider');
    }
    return context;
};

export const TypesettingProvider = ({ children }: { children: ReactNode }) => {
    const [typesetting, setTypesetting] = useState<TypesettingWithRelations[]>([]);

    return (
        <TypesettingContext.Provider value={{ typesetting, setTypesetting }}>
            {children}
        </TypesettingContext.Provider>
    );
};

export default TypesettingContext;
