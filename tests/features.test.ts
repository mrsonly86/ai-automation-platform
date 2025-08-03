import request from 'supertest';
import app from '../src/index';

describe('E-Invoice Vietnam Integration', () => {
  const sampleInvoice = {
    invoiceNumber: 'AA/23E-0001',
    issueDate: '2024-01-15',
    taxCode: '1234567890',
    customerInfo: {
      name: 'Công ty ABC',
      taxCode: '0987654321',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      phone: '0901234567',
      email: 'info@abc.com'
    },
    items: [
      {
        description: 'Dịch vụ tư vấn',
        quantity: 1,
        unitPrice: 1000000,
        vatRate: 0.1,
        amount: 1000000,
        vatAmount: 100000
      }
    ],
    taxDetails: {
      vatAmount: 100000,
      totalTax: 100000
    },
    totalAmount: 1000000
  };

  test('should create and process e-invoice', async () => {
    const response = await request(app)
      .post('/api/vietnam/e-invoice/invoices')
      .send(sampleInvoice)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.invoice).toBeDefined();
    expect(response.body.data.xmlData).toBeDefined();
    expect(response.body.data.submissionResult).toBeDefined();
  });

  test('should validate XML invoice', async () => {
    const xmlData = `<?xml version="1.0" encoding="UTF-8"?>
    <Invoice version="1.0" xmlns="http://gdt.gov.vn/einvoice/v1.0">
      <Header>
        <InvoiceNumber>AA/23E-0001</InvoiceNumber>
        <TaxCode>1234567890</TaxCode>
      </Header>
    </Invoice>`;

    const response = await request(app)
      .post('/api/vietnam/e-invoice/invoices/validate-xml')
      .send({ xmlData })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.valid).toBeDefined();
  });

  test('should test tax authority connection', async () => {
    const response = await request(app)
      .get('/api/vietnam/e-invoice/test-connection')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.connected).toBeDefined();
  });
});

describe('Vietnamese Voice Assistant', () => {
  test('should process Vietnamese voice command', async () => {
    const response = await request(app)
      .post('/api/agents/vietnamese-voice/process-command')
      .send({ text: 'Tạo hóa đơn cho khách hàng ABC' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.command).toBeDefined();
    expect(response.body.data.response).toBeDefined();
    expect(response.body.data.command.intent).toBe('CREATE_INVOICE');
  });

  test('should analyze Vietnamese text complexity', async () => {
    const response = await request(app)
      .post('/api/agents/vietnamese-voice/analyze-text')
      .send({ text: 'Hiển thị báo cáo doanh thu tháng này của khách hàng' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.analysis).toBeDefined();
    expect(response.body.data.tokens).toBeDefined();
    expect(response.body.data.entities).toBeDefined();
  });

  test('should get voice assistant status', async () => {
    const response = await request(app)
      .get('/api/agents/vietnamese-voice/status')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('ready');
    expect(response.body.data.supportedDialects).toContain('north');
  });

  test('should set Vietnamese dialect', async () => {
    const response = await request(app)
      .post('/api/agents/vietnamese-voice/set-dialect')
      .send({ dialect: 'south' })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.dialect).toBe('south');
  });
});