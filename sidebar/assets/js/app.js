(() => {
  const client = ZAFClient.init();

  client.on('app.registered', async () => {
    // 🔑 deixa o Zendesk decidir o tamanho
    client.invoke('resize', { height: 'auto' });

    const data = await client.get([
      'ticket.id',
      'ticket.requester.name',
      'ticket.requester.email'
    ]);

    document.getElementById('ticket-id').textContent =
      data['ticket.id'];

    document.getElementById('ticket-name').textContent =
      data['ticket.requester.name'];

    document.getElementById('ticket-email').textContent =
      data['ticket.requester.email'];
  });
})();
