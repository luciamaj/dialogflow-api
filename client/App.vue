<template>
    <div id="app">
        <div class="container-fluid">
            <div class="row">
                <div class="col">
                    <h1>CHATBOT</h1>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <div class="chat">
                        <div class="chatbody">
                            <div :class="'msg ' + mex.type" v-for="mex in messages" v-bind:key="mex.text">
                                {{ mex.text }}
                            </div>
                        </div>
                        <div class="inputcontainer">
                            <input v-model="userMessage" class="form-control form-control-sm textinput" type="text" placeholder="scrivi qualcosa...">
                            <button v-on:click="sendMsg()" type="button" class="btn btn-primary sendbtn">INVIA</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    module.exports = {
        name: "app",
        data() {
            return {
                messages: [
                { type: 'botmsg', text: 'Ciao' },
                { type: 'usermsg', text: 'Hello' },
                ],
                userMessage: "",
                socket: {}
            }
        },
        mounted() {
            console.log("mounted!");
            // MI SONO CONNESSO VIA WEBSOCKET AL SERVER
            this.socket = io.connect('http://localhost:3000');

            this.socket.on('BOT_RESPONSE', (msg) => {
                console.log("the bot response", msg);
                let botMsg = { type: "botmsg", text: msg }
                this.messages.push(botMsg);
            });
        },
        methods: {
            sendMsg() {
                if (this.userMessage != "") {
                    console.log("Il messaggio che sto per inviare: ", this.userMessage);
                    let messageToPush = {type: 'usermsg', text: this.userMessage};
                    this.messages.push(messageToPush);
                    this.socket.emit('USER_MSG', this.userMessage);
                    this.userMessage = '';
                }
            }
        }
    }
</script>