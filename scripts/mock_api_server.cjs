const http = require('http');

let appointments = [];
let idCounter = 1;

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        const parsed = body ? JSON.parse(body) : {};
        resolve(parsed);
      } catch (e) {
        resolve({ raw: body });
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = req.url;
  if (req.method === 'OPTIONS') {
    res.writeHead(200, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end();
    return;
  }

  if (url === '/api/appointments' && req.method === 'POST') {
    const body = await parseBody(req);
    const now = new Date();
    const appt = {
      id: `mock-${idCounter++}`,
      clientName: body.clientName || body.client_name || 'Teste Mock',
      clientPhone: body.clientPhone || body.client_phone || '11900000000',
      service: body.service || body.service_id || 'Mock Service',
      startTime: body.startTime || body.start_time || now.toISOString(),
      endTime: body.endTime || body.end_time || new Date(now.getTime() + 30*60000).toISOString(),
      status: body.status || 'pendente',
      attendant: body.attendant || body.attendant_id || 'mock-attendant',
      source: body.source || 'mock',
      createdAt: now.toISOString()
    };
    appointments.unshift(appt);
    res.writeHead(201, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
    res.end(JSON.stringify({ success: true, appointment: appt }));
    return;
  }

  if (url === '/api/appointments' && req.method === 'GET') {
    res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
    res.end(JSON.stringify(appointments.slice(0, 10)));
    return;
  }

  if (url === '/api/chat' && req.method === 'POST') {
    const body = await parseBody(req);
    const message = (body.message || body.input || '').toLowerCase();

    if (message.includes('agend')) {
      const apptJson = {
        action: 'CREATE_APPOINTMENT',
        clientName: 'Cliente IA',
        clientPhone: '11911112222',
        service: 'Teste Cortes',
        date: new Date().toLocaleDateString('pt-GB').split('/').reverse().join('-'),
        time: '14:30',
        professional: 'Teste Profissional'
      };
      const reply = `Claro! Vou criar o agendamento.\n\n\`\`\`json\n${JSON.stringify(apptJson, null, 2)}\n\`\`\``;
      res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
      res.end(JSON.stringify({ reply }));
      return;
    }

    const reply = `Você disse: "${body.message || body.input}"`;
    res.writeHead(200, {'Content-Type':'application/json','Access-Control-Allow-Origin':'*'});
    res.end(JSON.stringify({ reply }));
    return;
  }

  res.writeHead(404, {'Content-Type':'text/plain'});
  res.end('Not found');
});

const port = process.env.MOCK_API_PORT || 3001;
server.listen(port, () => console.log(`Mock API server listening on http://localhost:${port}`));
