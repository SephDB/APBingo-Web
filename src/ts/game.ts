import { Client } from "archipelago.js"
import { Bingo, Square } from "./bingo"

// Create a new instance of the Client class.
const client = new Client()

// Setup a listener for incoming chat messages and print them to the console.
client.messages.on("chat", (message, sender) => {
    console.log(`${sender.alias}: ${message}`)
})

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

const params = new URLSearchParams(window.location.search)
const url = params.get('hostname') ?? 'localhost'
const port = params.get('port') ?? '38281'
const name = params.get('name') ?? 'Bingo'

// Connect to the Archipelago server (replace url, slot name, and game as appropriate for your scenario).
const slotdata = await client.login<BingoSlotData>(`${url}:${port}`, name, "APBingo")

const root = document.querySelector(":root") as HTMLElement
root.style.setProperty("--tilesize",`${100/slotdata.boardSize}%`)
root.style.setProperty("--textColor",slotdata.customText)
root.style.setProperty("--hightlightColor",slotdata.customHLSquare)
root.style.setProperty("--squareColor",slotdata.customSquare)
root.style.setProperty("--boardColor",slotdata.customBoard)

const body = document.body, table = document.createElement("table")

for (let i = 0; i < slotdata.boardSize; i++) {
  const tr = table.insertRow()
  for(let j = 0; j < slotdata.boardSize; j++) {
    const td = tr.insertCell()
    const div = document.createElement("div")
    div.appendChild(document.createTextNode(slotdata.boardLocations[i*slotdata.boardSize+j]))
    td.appendChild(div)
  }
}
body.appendChild(table)

const bingo = new Bingo(slotdata.boardSize)

function setReceived(item:string) {
  const sq = Square.fromName(item)

  const cell = table.querySelector(`tr:nth-child(${sq.y+1}) td:nth-child(${sq.x+1})`) as HTMLTableRowElement
  cell.classList.add("checked")

  const bingos = bingo.check(sq)
  if(bingos.length > 0) {
    const pkg = client.package.findPackage(client.game)
    if(pkg !== null) {
      let checks = Object.keys(pkg.locationTable).filter(
        (loc)=>bingos.some((b)=>loc.startsWith(`Bingo (${b})`))
      ).map((check)=>pkg.locationTable[check])
      if(bingo.all) {
        checks.push(pkg.locationTable["Bingo (ALL)"])
      }
      client.check(...checks)
      if(bingo.num_bingos >= slotdata.requiredBingoCount) {
        client.goal()
      }
    }
    else {
      console.error("PANIC, datapackage somehow not loaded yet")
    }
  }
}

client.items.received.forEach(item => setReceived(item.name))

client.items.on("itemsReceived",items => items.forEach(item => setReceived(item.name)))

declare global {
  interface Window {
    gameclient: Client
    bingo: Bingo
  }
}

window.gameclient = client
window.bingo = bingo