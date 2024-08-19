let injected = false;
function insertIrLibScript() {
    if (!injected) {
        const script = document.createElement('script');
        script.id = 'irlib';
        script.type = 'module';
        // script.src = 'https://wb-cmp.igloorooms.com/be/dist/iglooroom/iglooroom.esm.js';
        script.src = 'https://david1chowaifaty.github.io/igloo-calendar-main-web/be-dist/iglooroom/iglooroom.esm.js';
        document.head.appendChild(script);
        injected = true;
        console.log("injection ")
    }
}
insertIrLibScript();
