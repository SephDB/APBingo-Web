import { Client } from "archipelago.js";

// Create a new instance of the Client class.
const client = new Client();

// Setup a listener for incoming chat messages and print them to the console.
client.messages.on("chat", (message, sender) => {
    console.log(`${sender.alias}: ${message}`);
});

type BingoSlotData = {
  requiredBingoCount: number
  //Location description for each square
  boardLocations: string[]
  boardSize: number
  //Color values
  customBoard: string
  customSquare: string
  customHLSquare: string
  customText: string
}

const params = new URLSearchParams(window.location.search);
const url = params.get('hostname')
const port = params.get('port')
const name = params.get('name')

if(url === null || port === null || name === null) {
  throw 1;
}

// Connect to the Archipelago server (replace url, slot name, and game as appropriate for your scenario).
const slotdata = await client.login<BingoSlotData>(`${url}:${port}`, name, "APBingo");

const body = document.body, table = document.createElement("table"), main_div = document.createElement("div")
main_div.style.height = "80vh"
main_div.style.width = "100vw"
main_div.style.display = "block"

table.style.height = "100%"
table.style.maxWidth = "70%"
table.style.alignSelf = "center"
table.style.borderSpacing = "4px"
table.style.border = "1px solid black"

for (let i = 0; i < slotdata.boardSize; i++) {
  const tr = table.insertRow();
  for(let j = 0; j < slotdata.boardSize; j++) {
    const td = tr.insertCell();
    td.style.width = `${100/slotdata.boardSize}%`
    td.style.height = `${100/slotdata.boardSize}%`
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(slotdata.boardLocations[i*slotdata.boardSize+j]));
    td.appendChild(div);
    td.style.border = '1px solid black'
  }
}
main_div.appendChild(table);
body.appendChild(main_div);

function setReceived(item:string) {
  let row = item.charCodeAt(0) - 'A'.charCodeAt(0)
  let column = Number(item.slice(1))
  let cell = table.querySelector(`tr:nth-child(${row+1}) td:nth-child(${column})`) as HTMLTableRowElement
  cell.style.backgroundColor = "Green"
}

client.items.received.forEach(item => setReceived(item.name))

client.items.on("itemsReceived",items => items.forEach(item => setReceived(item.name)))