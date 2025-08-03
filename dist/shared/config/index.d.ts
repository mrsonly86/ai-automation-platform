export declare const config: {
    port: string | number;
    nodeEnv: string;
    mongodb: {
        uri: string;
    };
    vietnam: {
        taxAuthority: {
            baseUrl: string;
            apiKey: string;
            taxCode: string;
        };
        invoice: {
            template: string;
            vatRate: number;
            digitalSignature: {
                certPath: string;
                certPassword: string;
            };
        };
    };
    voice: {
        speechRecognition: {
            provider: string;
            language: string;
            dialects: string[];
        };
        textToSpeech: {
            provider: string;
            voice: string;
            speed: number;
        };
        nlp: {
            model: string;
            threshold: number;
        };
    };
    security: {
        jwtSecret: string;
        encryption: {
            algorithm: string;
            keyLength: number;
        };
    };
};
//# sourceMappingURL=index.d.ts.map