/* SERVICE WORKER (sw.js)
  Este ficheiro deve ser guardado na pasta "public/" do seu projeto Vite.
  Ele é o "motor invisível" que corre no fundo do telemóvel para receber as notificações Push.
*/

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Instalado.');
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Ativado.');
  event.waitUntil(clients.claim());
});

// Evento: Receber a Notificação Push do Backend (Supabase/Servidor)
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Notificação Push Recebida.');

  let data = { title: 'Novo Aviso', body: 'Tem uma nova atualização na igreja.', icon: '/vite.svg' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/vite.svg', // Substitua pelo caminho da sua logo PWA (ex: /icon-192.png)
    badge: '/vite.svg',             // Ícone pequeno para a barra de topo do Android
    vibrate: [200, 100, 200, 100, 200], // Padrão de vibração
    tag: data.tag || 'geral',       // Evita notificações duplicadas
    data: data.url || '/',          // Guarda o URL para abrir quando o utilizador clicar
    requireInteraction: true        // A notificação fica na tela até o utilizador a fechar
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Evento: Utilizador clica na notificação
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Clique na Notificação detectado.');
  
  event.notification.close(); // Fecha o aviso na tela

  // URL que vamos abrir (Vem dos dados da notificação ou vai para a Home)
  const urlToOpen = event.notification.data || '/';

  // Abre a app ou foca na janela se já estiver aberta
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Se a app já estiver aberta numa aba, foca nela
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      // Se a app estiver fechada, abre uma nova janela
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});