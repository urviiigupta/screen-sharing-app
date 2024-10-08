const { ipcRenderer } = require('electron');

window.onload = function () {
    console.log('Page loaded');
    
    ipcRenderer.on('uuid', function (event, data) {
        document.getElementById('code').innerHTML = data;
    });

    document.getElementById('start').addEventListener('click', startShare);
    document.getElementById('stop').addEventListener('click', stopShare);
};

function startShare() {
    ipcRenderer.send('start-share', {});
    document.getElementById('start').style.display = "none";
    document.getElementById('stop').style.display = "block";
}

function stopShare() {
    ipcRenderer.send('stop-share', {});
    document.getElementById('stop').style.display = "none";
    document.getElementById('start').style.display = "block";
}
