export class ServerClient {
    OnSocketOpen(event) {
        console.log("Socket opened");
        this.socket.send(CLIENTID);
    }
    OnSocketError(event) {
        if(this.attempts === 4) {
            this._callbackfail();
			this.active = false;
            return;
        }

        this.attempts = this.attempts + 1;
        this.socket.close();
        this.socket = new WebSocket(this.address);

        // Bind callbacks
        this.socket.addEventListener("open", this._callbackopen);
        this.socket.addEventListener("message", this._callbackmessage);
        this.socket.addEventListener("error", this._callbackerror);
    }

    Send(msg) {
        this.socket.send(msg);
    }

    constructor(address, onconnect, onmessage, onerror, onfail) {
		this.active = true;
        this.attempts = 1;
        this.address = address;
        this.socket = new WebSocket(address);

        // Create callbacks
        this._callbackopen = (event) => {
			this.active = false;
            this.OnSocketOpen(event);
            onconnect(event);
        };
        this._callbackmessage = (event) => {
            onmessage(event);
        };
        this._callbackerror = (event) => {
            setTimeout((event) => {
                onerror(event);
                this.OnSocketError(event);
            }, 3000);
        };
        this._callbackfail = onfail;

        // Bind callbacks
        this.socket.addEventListener("open", this._callbackopen);
        this.socket.addEventListener("message", this._callbackmessage);
        this.socket.addEventListener("error", this._callbackerror);
    }
}