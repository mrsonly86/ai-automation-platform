#!/bin/bash

# Fix import paths from @ aliases to relative paths

# Vietnam E-Invoice files
sed -i 's|@/shared/config|../../../shared/config|g' src/vietnam/e-invoice/government-apis/tax-authority-connector.ts
sed -i 's|@/shared/utils/logger|../../../shared/utils/logger|g' src/vietnam/e-invoice/government-apis/tax-authority-connector.ts
sed -i 's|@/shared/types|../../../shared/types|g' src/vietnam/e-invoice/government-apis/tax-authority-connector.ts

sed -i 's|@/shared/config|../../../shared/config|g' src/vietnam/e-invoice/security/digital-signature.ts
sed -i 's|@/shared/utils/logger|../../../shared/utils/logger|g' src/vietnam/e-invoice/security/digital-signature.ts
sed -i 's|@/shared/types|../../../shared/types|g' src/vietnam/e-invoice/security/digital-signature.ts

sed -i 's|@/shared/types|../../../shared/types|g' src/vietnam/e-invoice/invoice-processing/xml-formatter.ts
sed -i 's|@/shared/utils/logger|../../../shared/utils/logger|g' src/vietnam/e-invoice/invoice-processing/xml-formatter.ts

sed -i 's|@/shared/types|../../../shared/types|g' src/vietnam/e-invoice/compliance-engine/vat-calculator.ts
sed -i 's|@/shared/utils/logger|../../../shared/utils/logger|g' src/vietnam/e-invoice/compliance-engine/vat-calculator.ts
sed -i 's|@/shared/config|../../../shared/config|g' src/vietnam/e-invoice/compliance-engine/vat-calculator.ts

sed -i 's|@/shared/types|../../../shared/types|g' src/vietnam/e-invoice/routes.ts
sed -i 's|@/shared/utils/logger|../../../shared/utils/logger|g' src/vietnam/e-invoice/routes.ts

# Voice Assistant files
sed -i 's|@/shared/utils/logger|../../../shared/utils/logger|g' src/agents/vietnamese-voice/speech-processing/voice-recognition-vn.ts
sed -i 's|@/shared/config|../../../shared/config|g' src/agents/vietnamese-voice/speech-processing/voice-recognition-vn.ts
sed -i 's|@/shared/types|../../../shared/types|g' src/agents/vietnamese-voice/speech-processing/voice-recognition-vn.ts

sed -i 's|@/shared/utils/logger|../../../shared/utils/logger|g' src/agents/vietnamese-voice/speech-processing/text-to-speech-vn.ts

sed -i 's|@/shared/types|../../../shared/types|g' src/agents/vietnamese-voice/nlp-engine/vietnamese-tokenizer.ts
sed -i 's|@/shared/utils/logger|../../../shared/utils/logger|g' src/agents/vietnamese-voice/nlp-engine/vietnamese-tokenizer.ts

sed -i 's|@/shared/types|../../../shared/types|g' src/agents/vietnamese-voice/routes.ts
sed -i 's|@/shared/utils/logger|../../../shared/utils/logger|g' src/agents/vietnamese-voice/routes.ts

echo "Import paths fixed!"