let ports = [];

onconnect = e => {
    let port = e.ports[0];
    port.onmessage = e => {
        let data = e.data;
        ports.forEach(p => {
            p.postMessage(data);
        });
    };
    ports.push(port);
}