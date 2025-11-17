import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, 'utf8');
  env.split(/\r?\n/).forEach(line => {
    const m = line.match(/^\s*([A-Za-z_0-9]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2];
  });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Supabase credentials not found in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  try {
    const testEmail = 'tester' + Date.now() + '@example.com';
    const testPassword = 'Test1234!';

    console.log('Signing up test user:', testEmail);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({ email: testEmail, password: testPassword });
    if (signUpError) {
      // If user exists or other error, try sign in
      console.warn('Sign up error (trying sign in):', signUpError.message || signUpError);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email: testEmail, password: testPassword });
      if (signInError) throw signInError;
      console.log('Signed in existing user');
    } else {
      console.log('Sign up created, proceeding to sign in...');
      const { data: signInData2, error: signInError2 } = await supabase.auth.signInWithPassword({ email: testEmail, password: testPassword });
      if (signInError2) throw signInError2;
      console.log('Signed in new user');
    }

    // At this point client has auth session internally; proceed with inserts
    console.log('Inserting test service...');
    const { data: service, error: serviceErr } = await supabase
      .from('services')
      .insert({ name: 'Teste Cortes Auth', duration: 30, price: 50 })
      .select('*')
      .single();
    if (serviceErr) throw serviceErr;

    console.log('Service created:', service.id || service);

    console.log('Inserting test professional...');
    const { data: professional, error: profErr } = await supabase
      .from('professionals')
      .insert({ name: 'Teste Profissional Auth', email: 'prof_auth@test.com', specialties: ['corte'] })
      .select('*')
      .single();
    if (profErr) throw profErr;
    console.log('Professional created:', professional.id || professional);

    console.log('Inserting test client...');
    const { data: client, error: clientErr } = await supabase
      .from('clients')
      .insert({ name: 'Cliente Teste Auth', phone: '11988888888', email: 'cliente_auth@test.com', consent_lgpd: true })
      .select('*')
      .single();
    if (clientErr) throw clientErr;
    console.log('Client created:', client.id || client);

    console.log('Inserting test appointment...');
    const start = new Date();
    const end = new Date(start.getTime() + service.duration * 60000);
    const { data: appt, error: apptErr } = await supabase
      .from('appointments')
      .insert({ client_name: client.name, client_phone: client.phone, service_id: service.id, start_time: start.toISOString(), end_time: end.toISOString(), status: 'pendente', attendant_id: professional.id, source: 'admin' })
      .select('*')
      .single();
    if (apptErr) throw apptErr;
    console.log('Appointment created:', appt.id || appt);

    console.log('\nFetching latest entries...');
    const [{ data: services }, { data: professionals }, { data: clients }, { data: appointments }] = await Promise.all([
      supabase.from('services').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('professionals').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('clients').select('*').order('created_at', { ascending: false }).limit(5),
      supabase.from('appointments').select('*').order('created_at', { ascending: false }).limit(5),
    ]);

    console.log('Services:', services);
    console.log('Professionals:', professionals);
    console.log('Clients:', clients);
    console.log('Appointments:', appointments);

    process.exit(0);
  } catch (err) {
    console.error('Error during test inserts:', err.message || err);
    process.exit(2);
  }
}

run();
