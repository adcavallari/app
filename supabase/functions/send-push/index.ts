import webPush from "npm:web-push";
import { createClient } from "npm:@supabase/supabase-js@2";

// Configure com as chaves que gerou no Passo 1!
const publicVapidKey = Deno.env.get('VAPID_PUBLIC_KEY') || 'BJSF3kTzfj9mdgUn2HpLfUTaeHTIzNweXVdNJUwIeci8Mrgh6Yu_WneYo6Uw3YwABAt4V_XGSVqkk3GsM_UdVU4';
const privateVapidKey = Deno.env.get('VAPID_PRIVATE_KEY') || 'Q3Tct9M3j5AJ3K8_S8sHif5nuXnTgRdMN48vzfkBU40';

webPush.setVapidDetails(
  'mailto:ad.cavallri@gmail.com',
  publicVapidKey,
  privateVapidKey
);

serve(async (req) => {
  try {
    const { eventTitle, eventMessage, targetMinistry } = await req.json();

    // Ligar à BD do Supabase
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? 'https://iiqlekttxfbwuvdfriaz.supabase.co',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpcWxla3R0eGZid3V2ZGZyaWF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDQzMDE2NSwiZXhwIjoyMDg2MDA2MTY1fQ.TAw96fYcZgeUlM-oOCKzIrrDEcx5T8EvJiv13_dYP6Q'
    );

    // Buscar todos os dispositivos registados
    const { data: subscriptions, error } = await supabaseClient
      .from('push_subscriptions')
      .select('subscription');

    if (error) throw error;

    const payload = JSON.stringify({
      title: eventTitle,
      body: eventMessage,
      icon: '/vite.svg',
      url: '/events'
    });

    // Enviar notificação para cada dispositivo
    const sendPromises = subscriptions.map((sub) => 
      webPush.sendNotification(sub.subscription, payload).catch(e => console.error("Erro ao enviar:", e))
    );

    await Promise.all(sendPromises);

    return new Response(JSON.stringify({ success: true, message: "Notificações enviadas!" }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
})