import { createContext, useContext, useState, type ReactNode } from 'react';
import { Typesetting, TypesettingOption, TypesettingProof } from '@prisma/client';
import { type SerializedTypesetting, type SerializedTypesettingOption, SerializedTypesettingProof, type SerializedTypesettingProofArtwork } from '~/types/serializedTypes';

export type TypesettingWithRelations = SerializedTypesetting & {
    TypesettingOptions: SerializedTypesettingOption[];
    TypesettingProofs: {
        artwork: SerializedTypesettingProofArtwork[];
    }[];
};

interface TypesettingContextType {
    typesetting: TypesettingWithRelations[];
    setTypesetting: React.Dispatch<React.SetStateAction<TypesettingWithRelations[]>>;
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
